export function parseReceiptText(text: string) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const vendor = lines[0] || 'Unknown Vendor';
  let total = 0;
  for (const line of lines) {
    if (/total/i.test(line)) {
      const m = line.match(/([\d\.,]+)\s*$/);
      if (m) { total = parseAmount(m[1]); break; }
    }
  }
  if (!total) {
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
    source: 'receipt' as const,
    raw: { text },
  };
}

function parseAmount(input: string | undefined): number {
  if (!input) return 0;
  let s = String(input).trim();
  const neg = /[(\-)]/.test(s);
  s = s.replace(/[()\s]/g, '');
  s = s.replace(/[$€£¥]/g, '');
  if (s.includes(',') && s.includes('.')) {
    s = s.replace(/\./g, '').replace(/,/g, '.');
  } else if (s.includes(',') && !s.includes('.')) {
    const parts = s.split(',');
    if (parts.length === 2 && parts[1].length <= 2) s = s.replace(/,/g, '.');
    else s = s.replace(/,/g, '');
  }
  const val = parseFloat(s);
  return neg ? -Math.abs(val) : val;
}
