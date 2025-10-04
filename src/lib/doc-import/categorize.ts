export type CategorizeResult = {
  category_id: string | null;
  confidence: number | null;
  suggestions?: string[];
};

export async function categorize(_description: string, _amount: number): Promise<CategorizeResult> {
  // Stub: return unknown needing review
  return { category_id: null, confidence: null };
}
