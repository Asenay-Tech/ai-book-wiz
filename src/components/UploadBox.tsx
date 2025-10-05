import React, { useState } from "react";
import { extractFile } from "../lib/api";

export default function UploadBox() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setError(null); setResult(null);
    const out = await extractFile(file);
    setBusy(false);
    if (!out.ok) setError(out.error || "Failed");
    else setResult(out);
  };

  return (
    <div className="p-6 border rounded-2xl bg-white/5">
      <input type="file" onChange={onChange} accept=".pdf,.csv,.docx,.png,.jpg,.jpeg,.webp" />
      {busy && <p className="mt-2 text-sm opacity-70">Extracting…</p>}
      {error && <p className="mt-2 text-red-400">{error}</p>}
      {result && (
        <pre className="mt-4 p-3 bg-black/40 rounded text-xs overflow-auto max-h-80">
{JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
