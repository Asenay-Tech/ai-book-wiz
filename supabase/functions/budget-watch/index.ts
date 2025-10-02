// Schedule: cron(0 2 * * *) - runs daily at 02:00
// curl -X POST $BASE/budget-watch -H "Authorization: Bearer SERVICE_ROLE" -H "Content-Type: application/json" -d '{"userIds":["<uuid>"]}'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface BudgetWatchRequest {
  userIds?: string[];
}

interface BudgetWatchResponse {
  processedUsers: number;
  warnings: number;
  overs: number;
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
  console.log("[budget-watch] Start");

  try {
    const { userIds }: BudgetWatchRequest = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Get users to process
    let users: any[] = [];
    if (userIds && userIds.length > 0) {
      const { data } = await supabaseClient
        .from("profiles")
        .select("id")
        .in("id", userIds);
      users = data || [];
    } else {
      // Process all users (batch this in production)
      const { data } = await supabaseClient
        .from("profiles")
        .select("id")
        .limit(100);
      users = data || [];
    }

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthStart = `${currentMonth}-01`;
    const nextMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);

    let warnings = 0;
    let overs = 0;

    for (const user of users) {
      // Get budgets for current month
      const { data: budgets } = await supabaseClient
        .from("budget_limits")
        .select("*")
        .eq("user_id", user.id);

      if (!budgets || budgets.length === 0) continue;

      for (const budget of budgets) {
        // Calculate spend for category
        const { data: transactions } = await supabaseClient
          .from("transactions")
          .select("amount")
          .eq("user_id", user.id)
          .eq("category", budget.category)
          .gte("date", monthStart)
          .lt("date", nextMonth.toISOString().split('T')[0]);

        const spend = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
        const percent = (spend / budget.monthly_limit) * 100;

        if (percent >= 90) {
          // Generate tip using AI
          const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                {
                  role: "user",
                  content: `You spent ${spend.toFixed(2)} of ${budget.monthly_limit} budget on ${budget.category} (${percent.toFixed(0)}%). Give 1-2 sentence actionable tip to reduce spending. Professional tone.`
                }
              ]
            }),
          });

          const aiData = await aiResponse.json();
          const tip = aiData.choices[0].message.content;

          const type = percent >= 100 ? "budget_over" : "budget_warning";
          if (type === "budget_over") overs++;
          else warnings++;

          // Create alert
          await supabaseClient
            .from("alerts")
            .insert({
              user_id: user.id,
              type,
              payload_json: {
                category: budget.category,
                budget: budget.monthly_limit,
                spend,
                percent: Math.round(percent),
                tip
              }
            });

          console.log(`[budget-watch] Alert created for user ${user.id}, category ${budget.category}, ${percent.toFixed(0)}%`);
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[budget-watch] Done in ${duration}ms, users: ${users.length}, warnings: ${warnings}, overs: ${overs}`);

    const response: BudgetWatchResponse = {
      processedUsers: users.length,
      warnings,
      overs
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[budget-watch] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
