// Lightweight PDF text extraction using pdfjs-dist via esm.sh
// Note: Works for text-based PDFs. Scanned images require OCR and will be rejected upstream.
export type NormalizedTransaction = {
  posted_at: string;
  description: string;
  amount: number;
  vendor: string | null;
  source: 'bank';
  raw: Record<string, string>;
};

export async function parsePdfStatement(bytes: Uint8Array): Promise<NormalizedTransaction[]> {
  // Dynamically import pdfjs
  const pdfjsLib = await import('https://esm.sh/pdfjs-dist@4.6.82/build/pdf.mjs');
  const data = new Uint8Array(bytes);
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  let fullText = '';
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const strings = content.items.map((it: any) => it.str);
    fullText += strings.join(' ') + '\n';
  }
  const text = fullText.replace(/\s+/g, ' ').trim();

  // Very generic regex parsing for lines containing date + amount
  // Date formats: YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY, or 8-digit yyyymmdd
  const candidates: NormalizedTransaction[] = [];
  const lineRe = /(\d{4}-\d{2}-\d{2}|\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{8})\s+(.+?)\s+([\-\(\)]?\$?\d{1,3}(?:[\.,]\d{3})*(?:[\.,]\d{2}))/g;
  let match: RegExpExecArray | null;
  while ((match = lineRe.exec(text)) !== null) {
    const dateRaw = match[1];
    const desc = match[2].trim();
    const amountRaw = match[3];
    const posted_at = parseDateLoose(dateRaw);
    const amount = parseAmount(amountRaw);
    if (!amount || isNaN(amount)) continue;
    if (/^total$/i.test(desc)) continue;
    candidates.push({
      posted_at,
      description: desc,
      amount,
      vendor: extractVendor(desc),
      source: 'bank',
      raw: { date: dateRaw, description: desc, amount: amountRaw },
    });
  }
  return candidates;
}

function parseAmount(val?: string): number {
  if (!val) return 0;
  let s = String(val).trim();
  const negative = /(\(|\)|^-)/.test(s);
  s = s.replace(/[()\s]/g, '');
  s = s.replace(/[$€£¥]/g, '');
  if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '').replace(/,/g, '.');
  else if (s.includes(',') && !s.includes('.')) {
    const parts = s.split(',');
    if (parts.length === 2 && parts[1].length <= 2) s = s.replace(/,/g, '.');
    else s = s.replace(/,/g, '');
  }
  const n = parseFloat(s);
  return negative ? -Math.abs(n) : n;
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
  const name = words.join(' ').replace(/[^a-zA-Z0-9\s]/g, '').trim();
  return name || null;
}
