export function collapseDescription(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

export async function txHash(params: {
  userId: string;
  postedAtIso: string;
  description: string;
  amount: number;
  source: 'bank' | 'receipt';
}): Promise<string> {
  const collapsed = collapseDescription(params.description).toUpperCase();
  const iso = new Date(params.postedAtIso).toISOString();
  const amt = params.amount.toFixed(2);
  const input = `${params.userId}|${iso}|${collapsed}|${amt}|${params.source}`;
  const enc = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
