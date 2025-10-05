import { createClient } from "@supabase/supabase-js";

// ✅ Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// ✅ Extract text from uploaded file using OCR microservice
export async function extractFile(file: File): Promise<{ ok: boolean; text?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(import.meta.env.VITE_EXTRACT_URL!, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("❌ Failed to extract text from file.");
    }

    const data = await response.json();
    return { ok: true, text: data.text ?? "" };
  } catch (error: any) {
    return { ok: false, error: error.message || "Unexpected error during extraction." };
  }
}

// ✅ Insert parsed rows into Supabase "transactions" table
export async function insertTransactionsFromParsedText(rows: {
  date: string;
  description: string;
  amount: string;
}[]) {
  const user = await supabase.auth.getUser();
  const user_id = user.data.user?.id;

  if (!user_id) {
    return { ok: false, error: "User not authenticated" };
  }

  const formatted = rows.map((row) => ({
    user_id,
    date: row.date.split(".").reverse().join("-"),
    description: row.description,
    amount: parseFloat(row.amount.replace(",", ".").replace("€", "").trim()),
    status: "needs_review",
  }));

  const { error } = await supabase.from("transactions").insert(formatted);
  return { ok: !error, error: error?.message };
}
