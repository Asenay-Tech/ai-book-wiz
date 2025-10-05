import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { extractFile, insertTransactionsFromParsedText } from "@/lib/api";
import { toast } from "sonner";

// 🧠 1. Parse lines like: 01.04.2025 Lidl -8,90 €
function parseBankText(text: string): {
  date: string;
  description: string;
  amount: string;
}[] {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const transactions = [];

  for (const line of lines) {
    const match = line.match(/^(\d{2}\.\d{2}\.\d{4})\s+(.+?)\s+([+-]?\d{1,6},\d{2}) ?€?$/);
    if (match) {
      transactions.push({
        date: match[1],
        description: match[2],
        amount: match[3],
      });
    }
  }

  return transactions;
}

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);

  const navigate = useNavigate();

  // 🔄 2. Upload, extract text, parse, insert to DB
  const handleProcess = async () => {
    if (!file) {
      setError("Please choose a file first.");
      return;
    }

    setBusy(true);
    setError(null);
    setParsedRows([]);

    try {
      // ✅ Correct: extract text field from response
      const { text: extractedText } = await extractFile(file);
      if (!extractedText) throw new Error("❌ Extraction failed or returned empty text");

      const rows = parseBankText(extractedText);
      setParsedRows(rows);

      const result = await insertTransactionsFromParsedText(rows);
      if (!result.ok) {
        throw new Error(`❌ Failed to save to database: ${result.error}`);
      }

      toast.success("✅ Transactions uploaded and saved!");
      navigate("/ledger?tab=review");
    } catch (e: any) {
      setError(e.message || "Failed to process file");
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Upload AI Receipt</h1>

      <input
        type="file"
        accept=".pdf,.csv,.docx,.png,.jpg,.jpeg,.webp"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="text-sm text-white mb-4"
      />

      <button
        onClick={handleProcess}
        disabled={busy}
        className="mt-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        {busy ? "Processing..." : "Upload and Process"}
      </button>

      {error && <p className="text-red-400 mt-3">{error}</p>}

      {/* 📊 Parsed Table Preview */}
      {parsedRows.length > 0 && (
        <table className="mt-6 w-full text-left border-collapse border border-gray-700 text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-2 border border-gray-700">Date</th>
              <th className="p-2 border border-gray-700">Description</th>
              <th className="p-2 border border-gray-700">Amount</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {parsedRows.map((tx, i) => (
              <tr key={i} className="hover:bg-gray-900">
                <td className="p-2 border border-gray-700">{tx.date}</td>
                <td className="p-2 border border-gray-700">{tx.description}</td>
                <td className="p-2 border border-gray-700">{tx.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
