/**
 * Extracts the largest dollar amount from OCR-recognized text.
 * Returns digits and decimal only (e.g. "42.50"), or null if none found.
 */
export function extractBillAmount(ocrText: string): string | null {
  const amounts: number[] = [];

  // Match dollar amounts: $12.34, $1,234.56, etc.
  const dollarPattern = /\$\s?([\d,]+\.?\d{0,2})/g;
  let match: RegExpExecArray | null;
  while ((match = dollarPattern.exec(ocrText)) !== null) {
    const cleaned = match[1].replace(/,/g, "");
    const value = parseFloat(cleaned);
    if (!isNaN(value) && value > 0) {
      amounts.push(value);
    }
  }

  // Match bare numbers near keywords (total, amount due, balance, due, grand total)
  const keywordPattern =
    /(?:total|amount\s*due|balance\s*due|grand\s*total|amount|due)\s*:?\s*\$?\s*([\d,]+\.\d{2})/gi;
  while ((match = keywordPattern.exec(ocrText)) !== null) {
    const cleaned = match[1].replace(/,/g, "");
    const value = parseFloat(cleaned);
    if (!isNaN(value) && value > 0) {
      amounts.push(value);
    }
  }

  if (amounts.length === 0) {
    return null;
  }

  const largest = Math.max(...amounts);
  return largest.toFixed(2);
}
