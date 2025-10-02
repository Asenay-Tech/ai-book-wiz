// curl -X POST $BASE/reconcile-banks -H "Authorization: Bearer SERVICE_ROLE" -H "Content-Type: application/json" -d '{"userId":"<uuid>","days":30,"commit":false}'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface ReconcileRequest {
  userId: string;
  days?: number;
  commit?: boolean;
  maxResults?: number;
}

interface Match {
  transaction_id: string;
  receipt_id: string;
  score: number;
  reason?: string;
}

interface ReconcileResponse {
  matched: Match[];
  review: Match[];
  counts: {
    checked: number;
    matched: number;
    review: number;
  };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stringSimilarity = (a: string, b: string): number => {
  const s1 = a.toLowerCase();
  const s2 = b.toLowerCase();
  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Simple Jaro-Winkler approximation
  const matches = s1.split('').filter(c => s2.includes(c)).length;
  return matches / Math.max(s1.length, s2.length);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log("[reconcile-banks] Start");

  try {
    const { userId, days = 30, commit = false, maxResults = 200 }: ReconcileRequest = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Load transactions without receipts
    const { data: transactions } = await supabaseClient
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .is("receipt_id", null)
      .gte("date", cutoff)
      .limit(maxResults);

    // Load receipts
    const { data: receipts } = await supabaseClient
      .from("receipts")
      .select("*")
      .eq("user_id", userId)
      .gte("uploaded_at", cutoff)
      .limit(maxResults);

    if (!transactions || !receipts) {
      return new Response(
        JSON.stringify({ error: "Failed to load data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const matched: Match[] = [];
    const review: Match[] = [];
    let checked = 0;

    for (const txn of transactions) {
      checked++;
      
      for (const receipt of receipts) {
        const receiptTotal = receipt.parsed_data?.amount || receipt.ocr_text?.amount || 0;
        const receiptVendor = receipt.vendor || receipt.parsed_data?.vendor || '';
        const receiptDate = receipt.parsed_data?.date || receipt.uploaded_at.split('T')[0];

        // Amount score
        const amountDiff = Math.abs(txn.amount - receiptTotal);
        const amountScore = Math.max(0, 1 - Math.min(amountDiff / Math.max(1, Math.abs(txn.amount)), 0.05) * 20);

        // Date score (±3 days)
        const txnTime = new Date(txn.date).getTime();
        const rcptTime = new Date(receiptDate).getTime();
        const daysDiff = Math.abs(txnTime - rcptTime) / (24 * 60 * 60 * 1000);
        const dateScore = Math.max(0, 1 - daysDiff / 3);

        // Vendor score
        const vendorScore = stringSimilarity(txn.vendor || '', receiptVendor);

        const score = 0.5 * amountScore + 0.3 * dateScore + 0.2 * vendorScore;

        if (score >= 0.85 && commit) {
          // Auto-match
          await supabaseClient
            .from("transactions")
            .update({ receipt_id: receipt.id })
            .eq("id", txn.id);

          await supabaseClient
            .from("reconciliations")
            .insert({
              user_id: userId,
              transaction_id: txn.id,
              receipt_id: receipt.id,
              score: Math.round(score * 100) / 100,
              status: 'matched',
              meta_json: { amount_score: amountScore, date_score: dateScore, vendor_score: vendorScore }
            });

          matched.push({ transaction_id: txn.id, receipt_id: receipt.id, score });
          break;
        } else if (score >= 0.6 && score < 0.85) {
          review.push({
            transaction_id: txn.id,
            receipt_id: receipt.id,
            score,
            reason: `Amount: ${amountScore.toFixed(2)}, Date: ${dateScore.toFixed(2)}, Vendor: ${vendorScore.toFixed(2)}`
          });
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[reconcile-banks] Done in ${duration}ms, matched: ${matched.length}, review: ${review.length}`);

    const response: ReconcileResponse = {
      matched,
      review: review.slice(0, 50), // Limit review suggestions
      counts: {
        checked,
        matched: matched.length,
        review: review.length
      }
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[reconcile-banks] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
