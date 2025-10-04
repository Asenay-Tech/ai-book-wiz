export type NormalizedTransaction = {
  posted_at: string;
  description: string;
  amount: number;
  vendor: string | null;
  source: 'bank';
  raw: Record<string, string>;
};

export function parseCsvStatement(csvText: string): NormalizedTransaction[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCsvRow(lines[0], delimiter);
  const map: Record<string,string> = {};
  for (const h of headers) {
    const lower = h.toLowerCase();
    if (!map.date && /(date|posted|posting|transaction\s*date|trans\s*date|valuta|buchungstag)/.test(lower)) map.date = h;
    if (!map.description && /(description|memo|details|payee|merchant|narrative|text|beschreibung)/.test(lower)) map.description = h;
    if (!map.amount && /^amount$|transaction amount/.test(lower)) map.amount = h;
    if (!map.debit && /(debit|withdrawals|lastschrift|soll)/.test(lower)) map.debit = h;
    if (!map.credit && /(credit|deposits|gutschrift|haben)/.test(lower)) map.credit = h;
  }
  const txs: NormalizedTransaction[] = [];
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
    const description = rowData[map.description] || rowData['Description'] || "Unknown Transaction";
    if (/^total$/i.test(description)) continue;
    const posted_at = parseDateLoose(dateStr);
    txs.push({
      posted_at,
      description,
      amount,
      vendor: extractVendor(description),
      source: "bank" as const,
      raw: rowData as Record<string, string>,
    });
  }
  return txs;
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
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s).toISOString();
  let m = s.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
  if (m) return new Date(`${m[1]}-${m[2]}-${m[3]}`).toISOString();
  m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (m) {
    const a = parseInt(m[1]); const b = parseInt(m[2]); const c = m[3];
    if (a <= 12) return new Date(`${a}/${b}/${c}`).toISOString();
    return new Date(`${b}/${a}/${c}`).toISOString();
  }
  m = s.match(/^(\d{8})(\d{6})?/);
  if (m) {
    const y = m[1].slice(0,4); const mo = m[1].slice(4,6); const d = m[1].slice(6,8);
    return new Date(`${y}-${mo}-${d}`).toISOString();
  }
  return new Date().toISOString();
}

function extractVendor(description: string): string | null {
  const words = description.replace(/\s+/g, ' ').trim().split(/\s+/).slice(0, 4);
  const name = words.join(" ").replace(/[^a-zA-Z0-9\s]/g, "").trim();
  return name || null;
}
