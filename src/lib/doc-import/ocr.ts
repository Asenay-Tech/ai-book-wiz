export async function ocr(bytes: Uint8Array): Promise<string> {
  throw new Error('OCR required: No OCR provider configured');
}
