import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function computeTxHash(
  userId: string,
  postedAtIso: string,
  description: string,
  amount: number,
  source: "bank" | "receipt",
): Promise<string> {
  const collapsed = normalizeWhitespace(description).toUpperCase();
  const iso = new Date(postedAtIso).toISOString();
  const amt = amount.toFixed(2);
  return sha256Hex(`${userId}|${iso}|${collapsed}|${amt}|${source}`);
}

function uint8ToText(u8: Uint8Array): string {
  try {
    return new TextDecoder().decode(u8);
  } catch {
    return "";
  }
}

function detectDelimiter(line: string): string {
  const delimiters = [",", ";", "\t", "|"];
  let best = ",";
  let max = 0;
  for (const d of delimiters) {
    const n = line.split(d).length;
    if (n > max) { max = n; best = d; }
  }
  return best;
}

function parseCsvRow(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = line[i + 1];
    if (ch === '"') {
      if (inQuotes && next === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.trim()); current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result.map((s) => s.replace(/^['"]|['"]$/g, ""));
}

function parseAmount(input: string | undefined): number {
  if (!input) return 0;
  let s = String(input).trim();
  const neg = /[(\-)]/.test(s);
  s = s.replace(/[()\s]/g, "");
  s = s.replace(/[$€£¥]/g, "");
  if (s.includes(",") && s.includes(".")) {
    s = s.replace(/\./g, "").replace(/,/g, ".");
  } else if (s.includes(",") && !s.includes(".")) {
    const parts = s.split(",");
    if (parts.length === 2 && parts[1].length <= 2) s = s.replace(/,/g, ".");
    else s = s.replace(/,/g, "");
  }
  const val = parseFloat(s);
  return neg ? -Math.abs(val) : val;
}

function parseDateLoose(input: string): string {
  const s = String(input).trim();
  // ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s).toISOString();
  // YYYY/MM/DD
  let m = s.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
  if (m) return new Date(`${m[1]}-${m[2]}-${m[3]}`).toISOString();
  // MM/DD/YYYY or DD/MM/YYYY -> try both
  m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (m) {
    const a = parseInt(m[1]);
    const b = parseInt(m[2]);
    const c = m[3];
    if (a <= 12) return new Date(`${a}/${b}/${c}`).toISOString(); // US
    return new Date(`${b}/${a}/${c}`).toISOString(); // EU
  }
  // OFX DTPOSTED like 20240115 or 20240115120000
  m = s.match(/^(\d{8})(\d{6})?/);
  if (m) {
    const y = m[1].slice(0,4); const mo = m[1].slice(4,6); const d = m[1].slice(6,8);
    return new Date(`${y}-${mo}-${d}`).toISOString();
  }
  // fallback now
  return new Date().toISOString();
}

function extractVendor(description: string): string | null {
  const words = normalizeWhitespace(description).split(/\s+/).slice(0, 4);
  const name = words.join(" ").replace(/[^a-zA-Z0-9\s]/g, "").trim();
  return name || null;
}

function parseCsvStatement(csvText: string) {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [] as any[];
  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCsvRow(lines[0], delimiter);
  const map: Record<string,string> = {};
  for (const h of headers) {
    const lower = h.toLowerCase();
    if (!map.date && /(date|posted|posting|transaction date|trans date)/.test(lower)) map.date = h;
    if (!map.description && /(description|memo|details|payee|merchant)/.test(lower)) map.description = h;
    if (!map.amount && /^amount$|transaction amount/.test(lower)) map.amount = h;
    if (!map.debit && /(debit|withdrawals)/.test(lower)) map.debit = h;
    if (!map.credit && /(credit|deposits)/.test(lower)) map.credit = h;
  }
  const txs: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvRow(lines[i], delimiter);
    const rowData: Record<string,string> = {};
    headers.forEach((h, idx) => rowData[h] = row[idx] ?? "");
    const dateStr = rowData[map.date];
    if (!dateStr) continue;
    let amount = 0;
    if (map.debit && map.credit) {
      amount = parseAmount(rowData[map.credit]) - parseAmount(rowData[map.debit]);
    } else if (map.amount) {
      amount = parseAmount(rowData[map.amount]);
    }
    if (!amount || isNaN(amount)) continue;
    const description = rowData[map.description] || "Unknown Transaction";
    const posted_at = parseDateLoose(dateStr);
    txs.push({
      posted_at,
      description,
      amount,
      vendor: extractVendor(description),
      source: "bank" as const,
      raw: rowData,
    });
  }
  return txs;
}

function parseOfxQfx(text: string) {
  // Very light-weight parser for <STMTTRN> blocks
  const txs: any[] = [];
  const blocks = text.split(/<STMTTRN>/i).slice(1);
  for (const b of blocks) {
    const get = (tag: string) => {
      const m = b.match(new RegExp(`<${tag}>([^<\n\r]+)`, 'i'));
      return m?.[1]?.trim() ?? "";
    };
    const amt = parseAmount(get("TRNAMT"));
    if (!amt || isNaN(amt)) continue;
    const dateStr = get("DTPOSTED") || get("DTUSER") || get("DTAVAIL");
    const desc = get("NAME") || get("MEMO") || "Unknown Transaction";
    const posted_at = parseDateLoose(dateStr);
    txs.push({
      posted_at,
      description: desc,
      amount: amt,
      vendor: extractVendor(desc),
      source: "bank" as const,
      raw: { TRNAMT: get("TRNAMT"), DTPOSTED: dateStr, NAME: get("NAME"), MEMO: get("MEMO") },
    });
  }
  return txs;
}

async function performOcrStub(_bytes: Uint8Array): Promise<string> {
  // Stub to indicate OCR configuration required
  throw new Error("OCR required: No OCR provider configured");
}

function parseReceiptTextStub(text: string) {
  // Minimal heuristic: first non-empty line vendor, find total, date today if not found
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const vendor = lines[0] || "Unknown Vendor";
  let total = 0;
  for (const line of lines) {
    if (/total/i.test(line)) {
      const m = line.match(/([\d\.,]+)\s*$/);
      if (m) { total = parseAmount(m[1]); break; }
    }
  }
  if (!total) {
    // fallback: look for a money number
    for (const line of lines) {
      const m = line.match(/\$?([\d]{1,3}(?:[\.,][\d]{3})*(?:[\.,][\d]{2}))/);
      if (m) { total = parseAmount(m[1]); break; }
    }
  }
  const posted_at = new Date().toISOString();
  return {
    posted_at,
    vendor,
    description: `${vendor} receipt`,
    amount: -Math.abs(total || 0),
    source: "receipt" as const,
    raw: { text },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { fileName, mimeType, fileBase64 } = await req.json();
    if (!fileName || !fileBase64) {
      return new Response(JSON.stringify({ error: "fileName and fileBase64 are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
    const bytes = Uint8Array.from(atob(fileBase64), (c) => c.charCodeAt(0));

    // Save file to Storage
    const docUuid = crypto.randomUUID();
    const storagePath = `documents/${userId}/${docUuid}/${fileName}`;
    const uploadRes = await supabaseAdmin.storage
      .from("documents")
      .upload(storagePath, bytes, { contentType: mimeType || "application/octet-stream", upsert: false });

    if (uploadRes.error) {
      return new Response(JSON.stringify({ error: `Storage upload failed: ${uploadRes.error.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert document row
    const { data: docRow, error: docErr } = await supabaseAdmin
      .from("documents")
      .insert({ user_id: userId, storage_path: storagePath, file_name: fileName, mime_type: mimeType || null, kind: "unknown", parse_status: "pending" })
      .select("id")
      .single();

    if (docErr) {
      return new Response(JSON.stringify({ error: `Failed to create document record: ${docErr.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let kind: "bank" | "receipt" | "unknown" = "unknown";
    let inserted = 0;
    let skipped = 0;
    let updated = 0;

    const lowerName = fileName.toLowerCase();
    const isCsv = lowerName.endsWith(".csv") || mimeType === "text/csv";
    const isOfx = lowerName.endsWith(".ofx") || lowerName.endsWith(".qfx") || /ofx|qfx/i.test(mimeType || "");
    const isPdf = lowerName.endsWith(".pdf") || mimeType === "application/pdf";
    const isImage = /^image\//.test(mimeType || "") || /(\.png|\.jpe?g|\.webp|\.heic)$/i.test(lowerName);

    try {
      if (isCsv) {
        kind = "bank";
        const csvText = uint8ToText(bytes);
        const txs = parseCsvStatement(csvText);
        // Load user rules for categorization
        const { data: rules } = await supabaseAdmin
          .from('rules')
          .select('pattern, category_id')
          .eq('user_id', userId);
        const rows = await Promise.all(
          txs.map(async (tx) => ({
            user_id: userId,
            posted_at: tx.posted_at,
            date: new Date(tx.posted_at).toISOString().slice(0,10),
            description: tx.description,
            amount: tx.amount,
            vendor: tx.vendor ?? null,
            source: "bank",
            // Default to 'other' to satisfy NOT NULL constraint in some schemas
            category: 'other',
            category_id: (() => {
              const norm = normalizeWhitespace(tx.description).toUpperCase();
              for (const r of rules || []) {
                const pat = String(r.pattern || '').toUpperCase();
                if (pat && norm.includes(pat)) return r.category_id || null;
              }
              return null;
            })(),
            currency: null,
            confidence: null,
            raw: tx.raw ?? null,
            document_id: docRow.id,
            hash: await computeTxHash(userId, tx.posted_at, tx.description, tx.amount, "bank"),
          }))
        );
        ({ inserted, updated, skipped } = await upsertWithCounts(supabaseAdmin, userId, rows, docRow.id));
      } else if (isOfx) {
        kind = "bank";
        const text = uint8ToText(bytes);
        const txs = parseOfxQfx(text);
        const { data: rules } = await supabaseAdmin
          .from('rules')
          .select('pattern, category_id')
          .eq('user_id', userId);
        const rows = await Promise.all(
          txs.map(async (tx) => ({
            user_id: userId,
            posted_at: tx.posted_at,
            date: new Date(tx.posted_at).toISOString().slice(0,10),
            description: tx.description,
            amount: tx.amount,
            vendor: tx.vendor ?? null,
            source: "bank",
            category: 'other',
            category_id: (() => {
              const norm = normalizeWhitespace(tx.description).toUpperCase();
              for (const r of rules || []) {
                const pat = String(r.pattern || '').toUpperCase();
                if (pat && norm.includes(pat)) return r.category_id || null;
              }
              return null;
            })(),
            currency: null,
            confidence: null,
            raw: tx.raw ?? null,
            document_id: docRow.id,
            hash: await computeTxHash(userId, tx.posted_at, tx.description, tx.amount, "bank"),
          }))
        );
        ({ inserted, updated, skipped } = await upsertWithCounts(supabaseAdmin, userId, rows, docRow.id));
      } else if (isPdf) {
        // Try PDF text extraction via pdfjs; if no parsed transactions, require OCR
        const parsed = await parsePdfBank(bytes);
        if ((parsed?.length || 0) >= 1) {
          kind = 'bank';
          const { data: rules } = await supabaseAdmin
            .from('rules')
            .select('pattern, category_id')
            .eq('user_id', userId);
          const rows = await Promise.all(parsed.map(async (tx) => ({
            user_id: userId,
            posted_at: tx.posted_at,
            date: new Date(tx.posted_at).toISOString().slice(0,10),
            description: tx.description,
            amount: tx.amount,
            vendor: tx.vendor ?? null,
            source: 'bank' as const,
            category: 'other',
            category_id: (() => {
              const norm = normalizeWhitespace(tx.description).toUpperCase();
              for (const r of rules || []) {
                const pat = String(r.pattern || '').toUpperCase();
                if (pat && norm.includes(pat)) return r.category_id || null;
              }
              return null;
            })(),
            currency: null,
            confidence: null,
            raw: tx.raw ?? null,
            document_id: docRow.id,
            hash: await computeTxHash(userId, tx.posted_at, tx.description, tx.amount, 'bank'),
          })));
          ({ inserted, updated, skipped } = await upsertWithCounts(supabaseAdmin, userId, rows, docRow.id));
        } else {
          await supabaseAdmin
            .from('documents')
            .update({ parse_status: 'error', parse_message: 'OCR required', kind: 'receipt' })
            .eq('id', docRow.id);
          return new Response(JSON.stringify({ error: 'OCR required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      } else if (isImage) {
        // OCR is required for images; not configured -> return 400
        await supabaseAdmin
          .from("documents")
          .update({ parse_status: "error", parse_message: 'OCR required', kind: "receipt" })
          .eq("id", docRow.id);
        return new Response(JSON.stringify({ error: 'OCR required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } else {
        throw new Error(`Unsupported file type: ${mimeType || "unknown"}`);
      }

      await supabaseAdmin
        .from("documents")
        .update({ parse_status: "parsed", kind })
        .eq("id", docRow.id);

      return new Response(JSON.stringify({ kind, inserted, updated, skipped }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } catch (e) {
      await supabaseAdmin
        .from("documents")
        .update({ parse_status: "error", parse_message: String(e), kind })
        .eq("id", docRow.id);

      return new Response(JSON.stringify({ error: String(e) }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function parsePdfBank(fileContent: Uint8Array): Promise<any[]> {
  const pdfjsLib = await import('https://esm.sh/pdfjs-dist@4.6.82/build/pdf.mjs');
  const loadingTask = pdfjsLib.getDocument({ data: fileContent });
  const pdf = await loadingTask.promise;
  let fullText = '';
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const strings = content.items.map((it: any) => it.str);
    fullText += strings.join(' ') + '\n';
  }
  const text = fullText.replace(/\s+/g, ' ').trim();
  const txs: any[] = [];
  const re = /(\d{4}-\d{2}-\d{2}|\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{8})\s+(.+?)\s+([\-\(\)]?\$?\d{1,3}(?:[\.,]\d{3})*(?:[\.,]\d{2}))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const dateRaw = m[1];
    const desc = m[2].trim();
    const amountRaw = m[3];
    const posted_at = parseDateLoose(dateRaw);
    const amount = parseAmount(amountRaw);
    if (!amount || isNaN(amount)) continue;
    if (/^total$/i.test(desc)) continue;
    txs.push({
      posted_at,
      description: desc,
      amount,
      vendor: extractVendor(desc),
      source: 'bank',
      raw: { date: dateRaw, description: desc, amount: amountRaw },
    });
  }
  return txs;
}

async function upsertWithCounts(supabaseAdmin: any, userId: string, rows: any[], documentId: string) {
  const hashes = rows.map((r) => r.hash);
  const { data: existing } = await supabaseAdmin
    .from('transactions')
    .select('id, hash, document_id')
    .eq('user_id', userId)
    .in('hash', hashes);

  const byHash = new Map((existing || []).map((e: any) => [e.hash, e]));
  const toUpdateIds: string[] = [];
  let existingCount = 0;
  for (const h of hashes) {
    const ex = byHash.get(h);
    if (ex) {
      existingCount++;
      if (!ex.document_id) toUpdateIds.push(ex.id);
    }
  }

  const newRows = rows.filter((r) => !byHash.has(r.hash));
  let inserted = 0;
  if (newRows.length) {
    const { data: insData, error: insErr } = await supabaseAdmin
      .from('transactions')
      .upsert(newRows, { onConflict: 'hash', ignoreDuplicates: false, returning: 'representation' });
    if (insErr) throw insErr;
    inserted = insData?.length ?? 0;
  }

  let updated = 0;
  if (toUpdateIds.length) {
    const { data: updData, error: updErr } = await supabaseAdmin
      .from('transactions')
      .update({ document_id: documentId })
      .in('id', toUpdateIds)
      .select('id');
    if (updErr) throw updErr;
    updated = updData?.length ?? 0;
  }

  const skipped = existingCount - updated;
  return { inserted, updated, skipped };
}
