// Placeholder: PDF parsing typically needs a text extraction service.
export async function parsePdfStatement(_bytes: Uint8Array): Promise<{ error: string } & any[]> {
  throw new Error("PDF parsing not configured. Please export CSV/OFX/QFX from your bank instead.");
}
