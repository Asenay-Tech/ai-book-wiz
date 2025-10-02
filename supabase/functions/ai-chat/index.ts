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
    const { message, userId } = await req.json();

    // Initialize Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Fetch user transactions (context)
    const { data: transactions } = await supabaseClient
      .from("transactions")
      .select("date, amount, category, description")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(50);

    // Fetch profile info
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("subscription_tier, monthly_uploads_used")
      .eq("id", userId)
      .single();

    // Fetch chat history
    const { data: chatHistory } = await supabaseClient
      .from("chat_history")
      .select("role, content")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(10);

    // Build financial context
    const context = {
      totalTransactions: transactions?.length || 0,
      totalSpent: transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0,
      topCategories: transactions?.reduce((acc: any, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
        return acc;
      }, {}),
      subscription: profile?.subscription_tier || "free",
      uploadsUsed: profile?.monthly_uploads_used || 0,
    };

   // 🧠 Dynamic System Prompt — Adapts to Business Type
const businessType = profile?.business_type || "small"; // Optional: add this to your Supabase profile table

let tonePrompt = "";
if (businessType === "personal") {
  tonePrompt = `
  You are a friendly AI financial assistant for individual users managing personal budgets.
  Focus on simplicity, daily spending, savings goals, and practical advice.
  Avoid heavy accounting jargon. Use examples like groceries, rent, and subscriptions.
  `;
} else if (businessType === "small") {
  tonePrompt = `
  You are a friendly and professional AI bookkeeping assistant for small businesses.
  Emphasize expense tracking, monthly summaries, and cash flow health.
  Provide insights to improve budgeting and reduce unnecessary expenses.
  `;
} else {
  tonePrompt = `
  You are a professional AI financial analyst for medium-to-large businesses.
  Use a data-driven and executive tone. Provide insights about trends, departmental expenses,
  and operational efficiency. Include percentages and comparisons.
  Avoid casual phrasing. Focus on decision-making and performance improvement.
  `;
}

const systemPrompt = `
${tonePrompt}

The user has ${context.totalTransactions} transactions totaling $${context.totalSpent.toFixed(2)}.
Their top spending categories are: ${JSON.stringify(context.topCategories)}.
They are on the "${context.subscription}" plan and have used ${context.uploadsUsed} uploads this month.

When answering questions:
- Be concise but insightful.
- Include totals, percentages, or trends where relevant.
- If overspending is detected, suggest 1–2 actionable improvements.
- Always use friendly, professional business English (adjust tone based on business type).

Example user queries you handle:
- "How much did I spend on travel this month?"
- "Which category grew the most this month?"
- "Can you summarize my total income and expenses?"
- "Where can I cut costs?"

Do NOT show raw SQL, JSON, or database structure. Respond naturally and clearly.
`;


    // Combine conversation history
    const messages = [
      { role: "system", content: systemPrompt },
      ...(chatHistory || []).map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    // 🔗 Call AI Model
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error("AI chat failed");
    }

    const aiData = await aiResponse.json();
    const response = aiData.choices?.[0]?.message?.content || "Sorry, I couldn’t process that.";

    return new Response(JSON.stringify({ response }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in AI chat:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
