// curl -X POST $BASE/restaurant-prime-cost -H "Authorization: Bearer JWT" -H "Content-Type: application/json" -d '{"userId":"<uuid>","week_start":"2024-01-01"}'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface RestaurantRequest {
  userId: string;
  week_start: string;
}

interface RestaurantResponse {
  net_sales: number;
  cogs: number;
  labor: number;
  prime_pct: number;
  variance_vs_target: number;
  top_vendors: Array<{ name: string; delta_pct: number }>;
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
  console.log("[restaurant-prime-cost] Start");

  try {
    const { userId, week_start }: RestaurantRequest = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const weekEnd = new Date(week_start);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    // Get POS sales for week
    const { data: posDays } = await supabaseClient
      .from("pos_days")
      .select("*")
      .eq("user_id", userId)
      .gte("date", week_start)
      .lte("date", weekEndStr);

    const net_sales = posDays?.reduce((sum, d) => sum + Number(d.net_sales), 0) || 0;

    // Get COGS
    const { data: cogsTransactions } = await supabaseClient
      .from("transactions")
      .select("amount")
      .eq("user_id", userId)
      .in("category", ['food_dining', 'other']) // Mock: use proper COGS categories
      .gte("date", week_start)
      .lte("date", weekEndStr);

    const cogs = cogsTransactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    // Get Labor
    const { data: laborTransactions } = await supabaseClient
      .from("transactions")
      .select("amount")
      .eq("user_id", userId)
      .ilike("category", "services%") // Mock: use proper payroll categories
      .gte("date", week_start)
      .lte("date", weekEndStr);

    const labor = laborTransactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    // Calculate Prime Cost %
    const primeCost = cogs + labor;
    const prime_pct = net_sales > 0 ? (primeCost / net_sales) * 100 : 0;

    const target = 65; // Industry standard ~65%
    const variance_vs_target = prime_pct - target;

    // Get top vendors with price increases (mock)
    const { data: vendors } = await supabaseClient
      .from("transactions")
      .select("vendor, amount")
      .eq("user_id", userId)
      .gte("date", week_start)
      .lte("date", weekEndStr)
      .limit(100);

    const vendorTotals: Record<string, number> = {};
    vendors?.forEach(v => {
      vendorTotals[v.vendor] = (vendorTotals[v.vendor] || 0) + Number(v.amount);
    });

    const top_vendors = Object.entries(vendorTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([name, amount]) => ({
        name,
        delta_pct: 5.0 // Mock: calculate real price variance
      }));

    const duration = Date.now() - startTime;
    console.log(`[restaurant-prime-cost] Done in ${duration}ms, prime_pct: ${prime_pct.toFixed(1)}%`);

    const response: RestaurantResponse = {
      net_sales: Math.round(net_sales * 100) / 100,
      cogs: Math.round(cogs * 100) / 100,
      labor: Math.round(labor * 100) / 100,
      prime_pct: Math.round(prime_pct * 100) / 100,
      variance_vs_target: Math.round(variance_vs_target * 100) / 100,
      top_vendors
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[restaurant-prime-cost] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
