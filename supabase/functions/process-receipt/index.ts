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
    const { receiptId, fileUrl } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Use AI to analyze the receipt
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
            content: `You are a receipt parser. Extract structured data from receipt images.
Return ONLY valid JSON with this exact structure:
{
  "date": "YYYY-MM-DD",
  "vendor": "vendor name",
  "amount": 0.00,
  "category": "one of: food_dining, transportation, utilities, rent_mortgage, office_supplies, equipment, services, travel, entertainment, healthcare, insurance, taxes, other",
  "description": "brief description",
  "items": ["item1", "item2"]
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this receipt and extract the key information."
              },
              {
                type: "image_url",
                image_url: {
                  url: fileUrl
                }
              }
            ]
          }
        ]
      }),
    });

    if (!aiResponse.ok) {
      throw new Error("AI processing failed");
    }

    const aiData = await aiResponse.json();
    const parsedData = JSON.parse(aiData.choices[0].message.content);

    // Update receipt record
    await supabaseClient
      .from("receipts")
      .update({
        status: "processed",
        parsed_data: parsedData,
        ocr_text: JSON.stringify(parsedData)
      })
      .eq("id", receiptId);

    // Create transaction from parsed data
    const { data: receipt } = await supabaseClient
      .from("receipts")
      .select("user_id")
      .eq("id", receiptId)
      .single();

    if (receipt) {
      await supabaseClient.from("transactions").insert({
        user_id: receipt.user_id,
        receipt_id: receiptId,
        date: parsedData.date,
        description: parsedData.description,
        amount: parsedData.amount,
        category: parsedData.category,
        vendor: parsedData.vendor
      });

      // Increment upload count
      await supabaseClient.rpc("increment_upload_count", {
        user_id: receipt.user_id
      });
    }

    return new Response(
      JSON.stringify({ success: true, data: parsedData }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing receipt:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});