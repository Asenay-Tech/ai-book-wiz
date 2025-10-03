import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Import CSV bank statement and auto-categorize transactions
 * 
 * Example curl:
 * curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/import-statement \
 *   -H "Authorization: Bearer YOUR_TOKEN" \
 *   -H "Content-Type: application/json" \
 *   -d '{"userId":"uuid","filePath":"statements/userId/file.csv","currency":"USD"}'
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const { userId, bankAccountId, filePath, mapping, dateFormat, currency = 'USD', delimiter } = await req.json();
    
    if (!userId || !filePath) {
      return new Response(
        JSON.stringify({ error: 'userId and filePath are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create import batch
    const { data: batch, error: batchError } = await supabase
      .from('import_batches')
      .insert({
        user_id: userId,
        source: 'csv_upload',
        file_path: filePath,
        status: 'processing'
      })
      .select()
      .single();

    if (batchError) throw batchError;

    // Download CSV file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('statements')
      .download(filePath.replace('statements/', ''));

    if (downloadError) throw downloadError;

    const csvText = await fileData.text();
    const lines = csvText.split('\n').filter(l => l.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV file is empty or has no data rows');
    }

    // Detect delimiter
    const detectedDelimiter = delimiter || detectDelimiter(lines[0]);
    const headers = lines[0].split(detectedDelimiter).map(h => h.trim().replace(/['"]/g, ''));
    
    // Auto-detect column mapping if not provided
    const columnMapping = mapping || autoDetectMapping(headers);
    
    if (!columnMapping.date || !columnMapping.amount) {
      throw new Error('Could not detect date and amount columns. Please provide manual mapping.');
    }

    console.log(`Processing ${lines.length - 1} rows with mapping:`, columnMapping);

    const results = {
      read: lines.length - 1,
      inserted: 0,
      skipped_duplicates: 0,
      auto_categorized: 0,
      needs_review: 0,
      bad_rows: [] as Array<{ line: number; reason: string; data?: any }>
    };

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      try {
        const row = parseCsvRow(lines[i], detectedDelimiter);
        if (row.length < headers.length) continue;

        const rowData: any = {};
        headers.forEach((header, idx) => {
          rowData[header] = row[idx]?.trim();
        });

        // Extract transaction data
        const dateStr = rowData[columnMapping.date];
        const amountStr = rowData[columnMapping.amount] || 
                         (columnMapping.credit && columnMapping.debit 
                           ? (parseFloat(rowData[columnMapping.credit] || '0') - parseFloat(rowData[columnMapping.debit] || '0')).toString()
                           : null);
        const description = rowData[columnMapping.description] || '';
        const externalId = rowData[columnMapping.external_id] || 
                          `${userId}-${hashString(`${dateStr}|${amountStr}|${description}|${currency}`)}`;

        if (!dateStr || !amountStr) continue;

        const date = parseDate(dateStr, dateFormat);
        const amount = parseFloat(amountStr);

        if (isNaN(amount)) {
          results.bad_rows.push({ line: i + 1, reason: 'Invalid amount', data: rowData });
          continue;
        }

        // Check for duplicates
        const { data: existing } = await supabase
          .from('transactions')
          .select('id')
          .eq('user_id', userId)
          .eq('external_id', externalId)
          .maybeSingle();

        if (existing) {
          results.skipped_duplicates++;
          continue;
        }

        // Normalize vendor
        const vendorName = extractVendor(description);
        let vendorId = null;
        
        if (vendorName) {
          const { data: vendor } = await supabase
            .from('vendors')
            .select('id')
            .eq('user_id', userId)
            .eq('normalized_name', vendorName.toLowerCase())
            .maybeSingle();

          if (vendor) {
            vendorId = vendor.id;
          } else {
            const { data: newVendor } = await supabase
              .from('vendors')
              .insert({
                user_id: userId,
                name: vendorName,
                normalized_name: vendorName.toLowerCase()
              })
              .select()
              .single();
            if (newVendor) vendorId = newVendor.id;
          }
        }

        // Auto-categorize using AI
        const categorization = await categorizeTransaction(description, amount);
        const needsReview = categorization.confidence < 0.9;

        // Insert transaction
        const { error: insertError } = await supabase
          .from('transactions')
          .insert({
            user_id: userId,
            date,
            amount,
            description: description.substring(0, 500),
            memo: description,
            currency,
            source: 'bank',
            external_id: externalId,
            import_batch_id: batch.id,
            vendor_id: vendorId,
            category: needsReview ? null : categorization.category,
            confidence: categorization.confidence,
            needs_review: needsReview,
            meta_json: needsReview ? { suggestions: categorization.suggestions } : null
          });

        if (insertError) {
          console.error('Insert error:', insertError);
          results.bad_rows.push({ line: i + 1, reason: insertError.message, data: rowData });
          continue;
        }

        results.inserted++;
        if (needsReview) {
          results.needs_review++;
        } else {
          results.auto_categorized++;
        }

      } catch (rowError) {
        console.error(`Error processing row ${i}:`, rowError);
        const errorMessage = rowError instanceof Error ? rowError.message : 'Unknown error';
        results.bad_rows.push({ line: i + 1, reason: errorMessage });
      }
    }

    const finishedAt = new Date().toISOString();

    // Update batch status
    await supabase
      .from('import_batches')
      .update({
        status: 'completed',
        rows_total: results.read,
        rows_imported: results.inserted,
        finished_at: finishedAt,
        meta_json: { bad_rows: results.bad_rows }
      })
      .eq('id', batch.id);

    // Trigger reconciliation in background (non-blocking)
    try {
      await supabase.functions.invoke('reconcile-banks', {
        body: { userId, commit: false }
      });
    } catch (e) {
      console.log('Reconciliation trigger failed (non-critical):', e);
    }

    // Trigger insights refresh in background (non-blocking)
    try {
      await supabase.functions.invoke('generate-insights', {
        body: { userId }
      });
    } catch (e) {
      console.log('Insights refresh failed (non-critical):', e);
    }

    return new Response(
      JSON.stringify({
        batchId: batch.id,
        totals: results,
        started_at: batch.started_at,
        finished_at: finishedAt,
        duration_ms: Date.now() - startTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Import error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper functions
function detectDelimiter(line: string): string {
  const delimiters = [',', ';', '\t'];
  const counts = delimiters.map(d => line.split(d).length);
  const maxIdx = counts.indexOf(Math.max(...counts));
  return delimiters[maxIdx];
}

function autoDetectMapping(headers: string[]): any {
  const mapping: any = {};
  
  headers.forEach((h, idx) => {
    const lower = h.toLowerCase();
    if (['date', 'posted', 'transaction date', 'posting date'].some(k => lower.includes(k))) {
      mapping.date = h;
    }
    if (['amount', 'transaction amount'].some(k => lower === k)) {
      mapping.amount = h;
    }
    if (lower.includes('debit')) mapping.debit = h;
    if (lower.includes('credit')) mapping.credit = h;
    if (['description', 'memo', 'details', 'payee'].some(k => lower.includes(k))) {
      mapping.description = h;
    }
    if (['balance', 'running balance'].some(k => lower.includes(k))) {
      mapping.balance = h;
    }
    if (['id', 'fitid', 'transaction id', 'reference'].some(k => lower.includes(k))) {
      mapping.external_id = h;
    }
  });

  return mapping;
}

function parseCsvRow(line: string, delimiter: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  
  return result.map(s => s.replace(/^"|"$/g, ''));
}

function parseDate(dateStr: string, format?: string): string {
  // Try ISO format first
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.split('T')[0];
  }
  
  // Try MM/DD/YYYY or DD/MM/YYYY
  const parts = dateStr.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const [a, b, c] = parts;
    // Assume MM/DD/YYYY if no format specified
    if (c.length === 4) {
      return `${c}-${a.padStart(2, '0')}-${b.padStart(2, '0')}`;
    }
  }
  
  throw new Error(`Could not parse date: ${dateStr}`);
}

function extractVendor(description: string): string {
  // Extract vendor name (simple heuristic: first 3-4 words)
  const words = description.trim().split(/\s+/).slice(0, 4);
  return words.join(' ').replace(/[^a-zA-Z0-9\s]/g, '').trim();
}

async function categorizeTransaction(description: string, amount: number) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: `Categorize this transaction:
Description: ${description}
Amount: ${amount}

Return JSON with: 
{
  "category": "food_dining|transportation|utilities|rent_mortgage|office_supplies|equipment|services|travel|entertainment|healthcare|insurance|taxes|other",
  "confidence": 0.0-1.0,
  "suggestions": ["category1", "category2", "category3"]
}`
        }],
        tools: [{
          type: "function",
          function: {
            name: "categorize",
            parameters: {
              type: "object",
              properties: {
                category: { type: "string" },
                confidence: { type: "number" },
                suggestions: { type: "array", items: { type: "string" } }
              },
              required: ["category", "confidence", "suggestions"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "categorize" } }
      }),
    });

    const data = await response.json();
    const args = JSON.parse(data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments || '{}');
    
    return {
      category: args.category || 'other',
      confidence: args.confidence || 0.5,
      suggestions: args.suggestions || []
    };
  } catch (e) {
    console.error('AI categorization failed:', e);
    return { category: 'other', confidence: 0.3, suggestions: [] };
  }
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
