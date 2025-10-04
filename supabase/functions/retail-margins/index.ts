// curl -X POST $BASE/retail-margins -H "Authorization: Bearer JWT" -H "Content-Type: application/json" -d '{"userId":"<uuid>","period":{"start":"2024-01-01","end":"2024-01-31"},"groupBy":"category"}'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface RetailRequest {
  userId: string;
  period: { start: string; end: string };
  groupBy?: "category" | "sku";
}

interface MarginGroup {
  key: string;
  revenue: number;
  cogs: number;
  margin_pct: number;
  delta_vs_prev: number;
}

interface RetailResponse {
  groups: MarginGroup[];
  alerts: Array<{ key: string; reason: string }>;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log("[retail-margins] Start");

  try {
    const { userId, period, groupBy = "category" }: RetailRequest = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Calculate previous period
    const start = new Date(period.start);
    const end = new Date(period.end);
    const periodDuration = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - periodDuration);
    const prevEnd = new Date(start.getTime() - 1);

    // Get transactions for current period
    const { data: currentTxns } = await supabaseClient
      .from("transactions")
      .select("amount, category")
      .eq("user_id", userId)
      .gte("date", period.start)
      .lte("date", period.end);

    // Get transactions for previous period
    const { data: prevTxns } = await supabaseClient
      .from("transactions")
      .select("amount, category")
      .eq("user_id", userId)
      .gte("date", prevStart.toISOString().split('T')[0])
      .lte("date", prevEnd.toISOString().split('T')[0]);

    const calculateMargins = (transactions: any[]) => {
      const groups: Record<string, { revenue: number; cogs: number }> = {};

      transactions?.forEach(t => {
        const key = t.category;
        if (!groups[key]) groups[key] = { revenue: 0, cogs: 0 };

        // Mock: assume amount is revenue or COGS based on sign
        if (t.amount > 0) {
          groups[key].cogs += Math.abs(Number(t.amount));
        } else {
          groups[key].revenue += Math.abs(Number(t.amount));
        }
      });

      return groups;
    };

    const currentGroups = calculateMargins(currentTxns || []);
    const prevGroups = calculateMargins(prevTxns || []);

    const results: MarginGroup[] = [];
    const alerts: Array<{ key: string; reason: string }> = [];

    for (const [key, data] of Object.entries(currentGroups)) {
      const margin_pct = data.revenue > 0 
        ? ((data.revenue - data.cogs) / data.revenue) * 100 
        : 0;

      const prevMargin = prevGroups[key] && prevGroups[key].revenue > 0
        ? ((prevGroups[key].revenue - prevGroups[key].cogs) / prevGroups[key].revenue) * 100
        : 0;

      const delta_vs_prev = margin_pct - prevMargin;

      if (delta_vs_prev < -5) {
        alerts.push({
          key,
          reason: `Margin dropped ${Math.abs(delta_vs_prev).toFixed(1)}% vs previous period`
        });
      }

      results.push({
        key,
        revenue: Math.round(data.revenue * 100) / 100,
        cogs: Math.round(data.cogs * 100) / 100,
        margin_pct: Math.round(margin_pct * 100) / 100,
        delta_vs_prev: Math.round(delta_vs_prev * 100) / 100
      });
    }

    results.sort((a, b) => b.revenue - a.revenue);

    const duration = Date.now() - startTime;
    console.log(`[retail-margins] Done in ${duration}ms, groups: ${results.length}, alerts: ${alerts.length}`);

    const response: RetailResponse = {
      groups: results,
      alerts
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[retail-margins] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
