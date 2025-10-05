// src/admin/debug/modules.ts

export const MODULES = [
  {
    name: "Document Upload & OCR",
    status: "done",
    tests: ["PDF", "JPG", "CSV", "DOCX"]
  },
  {
    name: "Bank Statement Line Parser",
    status: "done",
    supportedFormats: ["DD.MM.YYYY Description -8,90 €"],
  },
  {
    name: "AI Document Classifier",
    status: "planned",
    description: "Classify uploaded documents into categories (Invoice, Receipt, Bank Statement, etc.) using OpenAI.",
  },
  {
    name: "Category Auto-Suggestion",
    status: "planned",
    engine: "GPT or local model",
    confidenceThreshold: 0.7
  },
  {
    name: "Multi-user Ledger View",
    status: "done"
  },
  {
    name: "Needs Review Tab (Low Confidence)",
    status: "done"
  },
];
