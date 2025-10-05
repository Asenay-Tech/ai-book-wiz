// server/index.js
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs/promises";
import path from "path";

// FIXED pdf-parse import for ESM
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

import { createWorker } from "tesseract.js";
import mammoth from "mammoth";
import { parse as csvParse } from "csv-parse/sync";


const app = express();
app.use(cors({ origin: "*"}));

const upload = multer({ dest: "uploads/" });

const ok = (data) => ({ ok: true, ...data });
const fail = (message) => ({ ok: false, error: message });

app.get("/healthz", (_req, res) => res.json(ok({ status: "up" })));

app.post("/extract", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json(fail("No file uploaded"));
  const filePath = req.file.path;
  const ext = (req.file.originalname.split(".").pop() || "").toLowerCase();

  try {
    if (ext === "csv") {
      const raw = await fs.readFile(filePath, "utf8");
      const rows = csvParse(raw, { columns: true, skip_empty_lines: true });
      await fs.unlink(filePath);
      return res.json(ok({ type: "csv", rows, meta: { columns: Object.keys(rows[0] || {}) } }));
    }

    if (ext === "docx") {
      const raw = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer: raw });
      await fs.unlink(filePath);
      return res.json(ok({ type: "docx", text: result.value }));
    }

    if (ext === "pdf") {
      const raw = await fs.readFile(filePath);
      const pdfText = (await pdfParse(raw)).text || "";
      await fs.unlink(filePath);
      if (pdfText.trim().length > 20) {
        return res.json(ok({ type: "pdf", text: pdfText }));
      }
      // Optional: fall back to OCR for scanned PDFs (needs more CPU/time)
      return res.json(fail("PDF contains no extractable text (likely scanned). Enable OCR fallback if needed."));
    }

    // Images → OCR
    if (["png", "jpg", "jpeg", "webp"].includes(ext)) {
      const worker = await createWorker(); // uses bundled traineddata
      await worker.loadLanguage("eng");
      await worker.initialize("eng");
      const { data } = await worker.recognize(filePath);
      await worker.terminate();
      await fs.unlink(filePath);
      return res.json(ok({ type: "image", text: data.text }));
    }

    await fs.unlink(filePath);
    return res.status(415).json(fail(`Unsupported file type: .${ext}`));
  } catch (err) {
    console.error(err);
    try { await fs.unlink(filePath); } catch {}
    return res.status(500).json(fail("Extraction error"));
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Extractor running on http://localhost:${PORT}`));
