import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Get user's transactions
    const { data: transactions } = await supabaseClient
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(100);

    if (!transactions || transactions.length === 0) {
      return new Response(
        JSON.stringify({
          trends: "No transaction data available yet.",
          categories: "Upload receipts to see spending breakdown.",
          recommendations: ["Start uploading receipts to get personalized insights"]
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare transaction summary for AI
    const summary = {
      totalTransactions: transactions.length,
      totalAmount: transactions.reduce((sum, t) => sum + Number(t.amount), 0),
      categories: transactions.reduce((acc: any, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
        return acc;
      }, {}),
      recentTransactions: transactions.slice(0, 20).map(t => ({
        date: t.date,
        amount: t.amount,
        category: t.category,
        description: t.description
      }))
    };

    // Generate insights with AI
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
            role: "system",
            content: `You are a financial advisor. Analyze transaction data and provide insights.
Return ONLY valid JSON with this exact structure:
{
  "trends": "2-3 sentence summary of spending trends",
  "categories": "breakdown of top spending categories",
  "recommendations": ["3-5 actionable recommendations as array items"]
}`
          },
          {
            role: "user",
            content: `Analyze this financial data and provide insights:\n${JSON.stringify(summary, null, 2)}`
          }
        ]
      }),
    });

    if (!aiResponse.ok) {
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const insights = JSON.parse(aiData.choices[0].message.content);

    return new Response(
      JSON.stringify(insights),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating insights:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});