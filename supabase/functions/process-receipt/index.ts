// curl -X POST $BASE/process-receipt -H "Authorization: Bearer JWT" -H "Content-Type: application/json" -d '{"userId":"<uuid>","imageUrl":"https://...","qrPayload":"{...}"}'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface ProcessReceiptRequest {
  userId: string;
  imageUrl?: string;
  qrPayload?: string;
}

interface ProcessReceiptResponse {
  merchant: string;
  date: string;
  total: number;
  tax?: number;
  currency: string;
  category: string;
  confidence: number;
  explanation: string;
  flags: string[];
  needs_review: boolean;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const normalizeVendor = (vendor: string): string => {
  return vendor
    .replace(/\*.*/, '') // Remove * and everything after
    .replace(/\d+$/, '') // Remove trailing numbers
    .trim()
    .toLowerCase();
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log("[process-receipt] Start");

  try {
    const { userId, imageUrl, qrPayload }: ProcessReceiptRequest = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    let qrData: any = null;
    if (qrPayload) {
      try {
        qrData = JSON.parse(qrPayload);
      } catch {
        qrData = { raw: qrPayload };
      }
    }

    // OCR the image if provided
    let ocrData: any = null;
    let flags: string[] = [];

    if (imageUrl) {
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
              content: `Extract receipt data. Return JSON: {"date":"YYYY-MM-DD","vendor":"name","amount":0.00,"tax":0.00,"currency":"USD","items":[],"quality":"clear|blurry"}`,
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Extract all data from this receipt." },
                { type: "image_url", image_url: { url: imageUrl } }
              ]
            }
          ]
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        ocrData = JSON.parse(aiData.choices[0].message.content);
        if (ocrData.quality === 'blurry') flags.push('blurry');
      }
    }

    // Prefer QR data, cross-check with OCR
    const merchant = qrData?.vendor || ocrData?.vendor || "Unknown";
    const date = qrData?.date || ocrData?.date || new Date().toISOString().split('T')[0];
    const total = qrData?.amount || ocrData?.amount || 0;
    const tax = qrData?.tax || ocrData?.tax || 0;
    const currency = qrData?.currency || ocrData?.currency || "USD";

    // Check for mismatches
    if (qrData && ocrData) {
      const diff = Math.abs(qrData.amount - ocrData.amount);
      if (diff > Math.max(1, qrData.amount * 0.01)) {
        flags.push('mismatch-total');
      }
    }

    // Check for duplicates
    const { data: existing } = await supabaseClient
      .from("receipts")
      .select("id")
      .eq("user_id", userId)
      .eq("vendor", merchant)
      .eq("total", total)
      .gte("uploaded_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    if (existing && existing.length > 0) flags.push('duplicate');

    // AI categorization
    const catResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `Categorize expense. Return JSON: {"category":"food_dining|transportation|utilities|rent_mortgage|office_supplies|equipment|services|travel|entertainment|healthcare|insurance|taxes|other","confidence":0.0-1.0,"explanation":"why"}`,
          },
          {
            role: "user",
            content: `Vendor: ${merchant}, Amount: ${total}, Items: ${ocrData?.items?.join(', ') || 'none'}`
          }
        ]
      }),
    });

    const catData = await catResponse.json();
    const { category, confidence, explanation } = JSON.parse(catData.choices[0].message.content);

    const needs_review = confidence < 0.7 || flags.includes('mismatch-total');

    // Upsert vendor
    const normalizedName = normalizeVendor(merchant);
    await supabaseClient
      .from("vendors")
      .upsert({ user_id: userId, name: merchant, normalized_name: normalizedName }, { onConflict: 'user_id,name' });

    const duration = Date.now() - startTime;
    console.log(`[process-receipt] Done in ${duration}ms, flags: ${flags.join(',')}`);

    const response: ProcessReceiptResponse = {
      merchant,
      date,
      total,
      tax,
      currency,
      category,
      confidence,
      explanation,
      flags,
      needs_review
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[process-receipt] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
