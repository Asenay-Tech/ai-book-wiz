import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// SHA-256 hash function
async function sha256(str: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== Import Statement Function Started ===');
  const startTime = Date.now();
  
  try {
    const body = await req.json();
    const { fileName, mimeType, fileBase64 } = body;
    
    console.log(`Processing: ${fileName}, type: ${mimeType}`);
    
    if (!fileName || !fileBase64) {
      return new Response(
        JSON.stringify({ error: 'fileName and fileBase64 are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader! } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    console.log(`User ID: ${userId}`);

    // Decode base64 file content
    const fileContent = Uint8Array.from(atob(fileBase64), c => c.charCodeAt(0));
    
    // Determine file type and parse
    let transactions: any[];
    
    if (mimeType === 'text/csv' || fileName.endsWith('.csv')) {
      console.log('Parsing CSV...');
      const csvText = new TextDecoder().decode(fileContent);
      transactions = await parseCsvBank(csvText);
    } else if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return new Response(
        JSON.stringify({ error: 'PDF parsing not yet implemented. Please use CSV format.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: `Unsupported file type: ${mimeType}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Parsed ${transactions.length} transactions`);
    
    // Use service role for inserts
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Check for existing user rules
    const { data: userRules } = await supabase
      .from('rules')
      .select('pattern, category')
      .eq('user_id', userId);

    const rules = userRules || [];

    const results = {
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[]
    };

    // Process each transaction
    for (const tx of transactions) {
      try {
        const normalizedDesc = tx.description.toUpperCase().replace(/\s+/g, ' ').trim();
        
        // Generate hash for deduplication
        const hashInput = `${userId}|${tx.posted_at}|${normalizedDesc}|${tx.amount.toFixed(2)}`;
        const hash = await sha256(hashInput);

        // Check if transaction exists
        const { data: existing } = await supabase
          .from('transactions')
          .select('id')
          .eq('hash', hash)
          .maybeSingle();

        if (existing) {
          results.skipped++;
          continue;
        }

        // Apply categorization rules
        let category = null;
        let confidence = null;
        
        for (const rule of rules) {
          if (normalizedDesc.includes(rule.pattern.toUpperCase())) {
            category = rule.category;
            confidence = 1.0;
            break;
          }
        }

        // Insert transaction
        const { error: insertError } = await supabase
          .from('transactions')
          .insert({
            user_id: userId,
            posted_at: tx.posted_at,
            date: new Date(tx.posted_at).toISOString().split('T')[0],
            description: tx.description,
            amount: tx.amount,
            vendor: tx.vendor || null,
            category: category as any,
            source: 'bank',
            confidence: confidence,
            needs_review: category === null,
            hash: hash,
            meta_json: tx.raw || null
          });

        if (insertError) {
          console.error('Insert error:', insertError);
          results.errors.push(`${tx.description}: ${insertError.message}`);
          continue;
        }

        results.inserted++;
      } catch (txError) {
        console.error('Transaction processing error:', txError);
        results.errors.push(txError instanceof Error ? txError.message : 'Unknown error');
      }
    }

    console.log(`=== Results: ${results.inserted} inserted, ${results.skipped} skipped, ${results.errors.length} errors ===`);

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== Import Error ===', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Parse CSV bank statement
async function parseCsvBank(csvText: string): Promise<any[]> {
  const lines = csvText.split('\n').filter(l => l.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV file is empty or has no data rows');
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCsvRow(lines[0], delimiter).map(h => h.trim());
  
  console.log(`CSV headers: ${headers.join(', ')}`);
  
  const mapping = autoDetectMapping(headers);
  console.log('Column mapping:', mapping);
  
  if (!mapping.date || (!mapping.amount && !mapping.debit && !mapping.credit)) {
    throw new Error('Could not detect required columns (date and amount/debit/credit)');
  }

  const transactions: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    try {
      const row = parseCsvRow(lines[i], delimiter);
      if (row.length < 2) continue; // Skip empty rows

      const rowData: any = {};
      headers.forEach((header, idx) => {
        rowData[header] = row[idx]?.trim() || '';
      });

      const dateStr = rowData[mapping.date];
      if (!dateStr) continue;

      // Parse amount (handle debit/credit columns or single amount column)
      let amount = 0;
      if (mapping.debit && mapping.credit) {
        const debit = parseAmount(rowData[mapping.debit]);
        const credit = parseAmount(rowData[mapping.credit]);
        amount = credit - debit; // Credit is positive, debit is negative
      } else if (mapping.amount) {
        amount = parseAmount(rowData[mapping.amount]);
      }

      if (isNaN(amount) || amount === 0) continue;

      const description = rowData[mapping.description] || 'Unknown Transaction';
      const posted_at = parseDate(dateStr);

      transactions.push({
        posted_at,
        description,
        amount,
        vendor: extractVendor(description),
        source: 'bank',
        raw: rowData
      });
    } catch (rowError) {
      console.error(`Error parsing row ${i}:`, rowError);
    }
  }

  return transactions;
}

function detectDelimiter(line: string): string {
  const delimiters = [',', ';', '\t', '|'];
  let maxCount = 0;
  let bestDelimiter = ',';
  
  for (const d of delimiters) {
    const count = line.split(d).length;
    if (count > maxCount) {
      maxCount = count;
      bestDelimiter = d;
    }
  }
  
  return bestDelimiter;
}

function autoDetectMapping(headers: string[]): any {
  const mapping: any = {};
  
  for (const h of headers) {
    const lower = h.toLowerCase();
    
    if (['date', 'posted', 'transaction date', 'posting date', 'trans date'].some(k => lower.includes(k))) {
      mapping.date = h;
    }
    if (['amount', 'transaction amount'].some(k => lower === k.replace(/\s+/g, ' '))) {
      mapping.amount = h;
    }
    if (lower.includes('debit') || lower === 'withdrawals') {
      mapping.debit = h;
    }
    if (lower.includes('credit') || lower === 'deposits') {
      mapping.credit = h;
    }
    if (['description', 'memo', 'details', 'payee', 'merchant'].some(k => lower.includes(k))) {
      mapping.description = h;
    }
  }

  return mapping;
}

function parseCsvRow(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'; // Escaped quote
        i++; // Skip next char
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  return result.map(s => s.replace(/^["']|["']$/g, ''));
}

function parseAmount(amountStr: string): number {
  if (!amountStr) return 0;
  
  // Remove currency symbols, spaces, and handle parentheses (negative)
  let cleaned = amountStr.replace(/[$€£¥\s]/g, '');
  
  const isNegative = cleaned.includes('(') || cleaned.includes(')') || cleaned.startsWith('-');
  cleaned = cleaned.replace(/[()]/g, '').replace('-', '');
  
  // Handle European format (comma as decimal separator)
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // e.g., 1.234,56 -> remove thousand separator
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',') && !cleaned.includes('.')) {
    // Could be European or thousands separator
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      // Likely decimal: 123,45
      cleaned = cleaned.replace(',', '.');
    } else {
      // Likely thousands: 1,234
      cleaned = cleaned.replace(/,/g, '');
    }
  }
  
  const amount = parseFloat(cleaned);
  return isNegative ? -Math.abs(amount) : amount;
}

function parseDate(dateStr: string): string {
  // Try ISO format
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return new Date(dateStr).toISOString();
  }
  
  // Try various formats
  const patterns = [
    /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/,  // MM/DD/YYYY or DD/MM/YYYY
    /^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/,  // YYYY/MM/DD
  ];
  
  for (const pattern of patterns) {
    const match = dateStr.match(pattern);
    if (match) {
      const [_, a, b, c] = match;
      
      // Try MM/DD/YYYY (US format)
      const usDate = new Date(`${a}/${b}/${c}`);
      if (!isNaN(usDate.getTime()) && parseInt(a) <= 12) {
        return usDate.toISOString();
      }
      
      // Try DD/MM/YYYY (European format)
      const euDate = new Date(`${b}/${a}/${c}`);
      if (!isNaN(euDate.getTime())) {
        return euDate.toISOString();
      }
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
