export type CategorizeResult = {
  category_id: string | null;
  confidence: number | null;
};

// In the edge function we don't have direct DB types; this helper is meant for client env.
// But rule application is implemented in the edge function using admin client for performance.
// This file provides a client-side fallback if needed elsewhere.
export async function categorize(
  supabase: any,
  userId: string,
  description: string,
): Promise<CategorizeResult> {
  const { data, error } = await supabase
    .from('rules')
    .select('id, pattern, category_id')
    .eq('user_id', userId);

  if (error || !data) return { category_id: null, confidence: null };
  const norm = description.toUpperCase();
  for (const r of data) {
    const pat = String(r.pattern || '').toUpperCase();
    if (!pat) continue;
    if (norm.includes(pat)) {
      return { category_id: r.category_id || null, confidence: 1 };
    }
  }
  return { category_id: null, confidence: null };
}
