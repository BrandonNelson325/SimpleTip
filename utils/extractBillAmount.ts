/**
 * Extracts the bill total from OCR-recognized text.
 * Prioritizes amounts on lines containing "total" keywords,
 * falls back to the largest dollar amount found.
 */
export function extractBillAmount(ocrText: string): string | null {
  const lines = ocrText.split("\n");
  const amountPattern = /\$?\s?([\d,]+\.\d{2})/g;

  // Keywords that indicate a total line (ordered by priority)
  const totalKeywords = [
    /grand\s*total/i,
    /dine\s*in\s*total/i,
    /take\s*out\s*total/i,
    /order\s*total/i,
    /amount\s*due/i,
    /balance\s*due/i,
    /total\s*due/i,
    /\btotal\b/i,
    /\bdue\b/i,
    /\bbalance\b/i,
  ];

  // Pass 1: Find amounts on lines matching total keywords (highest priority keyword wins)
  for (const keyword of totalKeywords) {
    const matchingLines = lines.filter((line) => keyword.test(line));
    const amounts: number[] = [];

    for (const line of matchingLines) {
      let match: RegExpExecArray | null;
      amountPattern.lastIndex = 0;
      while ((match = amountPattern.exec(line)) !== null) {
        const cleaned = match[1].replace(/,/g, "");
        const value = parseFloat(cleaned);
        if (!isNaN(value) && value > 0) {
          amounts.push(value);
        }
      }
    }

    if (amounts.length > 0) {
      // If a line has "subtotal", skip it unless it's the only match
      const nonSubtotalLines = matchingLines.filter(
        (line) => !/sub\s*total/i.test(line)
      );
      if (nonSubtotalLines.length > 0 && keyword.source === "\\btotal\\b") {
        // Re-extract from non-subtotal lines only
        const filteredAmounts: number[] = [];
        for (const line of nonSubtotalLines) {
          let match: RegExpExecArray | null;
          amountPattern.lastIndex = 0;
          while ((match = amountPattern.exec(line)) !== null) {
            const cleaned = match[1].replace(/,/g, "");
            const value = parseFloat(cleaned);
            if (!isNaN(value) && value > 0) {
              filteredAmounts.push(value);
            }
          }
        }
        if (filteredAmounts.length > 0) {
          return Math.max(...filteredAmounts).toFixed(2);
        }
      }
      return Math.max(...amounts).toFixed(2);
    }
  }

  // Pass 2: Fallback — find all dollar amounts and return the largest
  const allAmounts: number[] = [];
  let match: RegExpExecArray | null;
  amountPattern.lastIndex = 0;
  while ((match = amountPattern.exec(ocrText)) !== null) {
    const cleaned = match[1].replace(/,/g, "");
    const value = parseFloat(cleaned);
    if (!isNaN(value) && value > 0) {
      allAmounts.push(value);
    }
  }

  if (allAmounts.length === 0) return null;
  return Math.max(...allAmounts).toFixed(2);
}
