export function collapseDescription(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

export function txHashInput(params: {
  userId: string;
  postedAtIso: string;
  description: string;
  amount: number;
  source: 'bank' | 'receipt';
}): string {
  const collapsed = collapseDescription(params.description).toUpperCase();
  const iso = new Date(params.postedAtIso).toISOString();
  const amt = params.amount.toFixed(2);
  return `${params.userId}|${iso}|${collapsed}|${amt}|${params.source}`;
}
