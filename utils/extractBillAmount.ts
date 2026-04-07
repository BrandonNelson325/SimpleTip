/**
 * Extracts the bill total from OCR-recognized text.
 * Prioritizes amounts on lines containing "total" keywords,
 * filters out non-total lines (tax, tip, subtotal, etc.),
 * falls back to the largest dollar amount found.
 */
export function extractBillAmount(ocrText: string): string | null {
  // Normalize common OCR misreads before parsing
  const normalized = ocrText
    .replace(/[O]/g, (ch, idx, str) => {
      // Replace O with 0 only when surrounded by digits or decimal points
      const prev = str[idx - 1];
      const next = str[idx + 1];
      const isDigitContext =
        (prev && /[\d.$,]/.test(prev)) || (next && /[\d.$,]/.test(next));
      return isDigitContext ? "0" : ch;
    })
    .replace(/(\d):(\d)/g, "$1.$2"); // Fix colon misread as decimal

  const lines = normalized.split("\n");

  // Match amounts: $27.08, 27.08, S27.08 (OCR misread $), 1,234.56
  const amountPattern = /[$S]?\s?([\d,]+\.\d{2})\b/g;

  // Lines containing these keywords are NOT the tippable total
  const excludePattern =
    /sub\s*-?\s*total|sales?\s*tax|state\s*tax|local\s*tax|county\s*tax|hst|gst|vat|\btax\b|\btip\b|gratuity|auto\s*grat|service\s*(fee|charge|chrg)|delivery\s*fee|tendered|change\s*due|\bchange\b|\bdiscount\b|\bcoupon\b|\bauth\b|authorized|suggested\s*tip/i;

  // Keywords that indicate a total line, ordered by specificity
  const totalKeywords = [
    /total\s*before\s*tip/i,
    /check\s*total/i,
    /tab\s*total/i,
    /guest\s*(check\s*)?total/i,
    /dine\s*-?\s*in\s*total/i,
    /take\s*-?\s*out\s*total/i,
    /carry\s*-?\s*out\s*total/i,
    /order\s*total/i,
    /sale\s*total|total\s*sale/i,
    /purchase\s*total/i,
    /transaction\s*total/i,
    /meal\s*total/i,
    /bill\s*total/i,
    /net\s*total/i,
    /charge\s*total|total\s*charge[ds]?/i,
    /grand\s*total/i,
    /amount\s*due/i,
    /balance\s*due/i,
    /total\s*due/i,
    /amt\s*due/i,
    /payment\s*due/i,
    /please\s*pay/i,
    /you\s*owe/i,
    /amount\s*charged|total\s*charged/i,
    /\btotal\b/i,
    /\bdue\b/i,
    /\bbalance\b/i,
    /\bamount\b/i,
    /\bcharged?\b/i,
  ];

  function extractAmounts(line: string): number[] {
    const amounts: number[] = [];
    let match: RegExpExecArray | null;
    amountPattern.lastIndex = 0;
    while ((match = amountPattern.exec(line)) !== null) {
      const cleaned = match[1].replace(/,/g, "");
      const value = parseFloat(cleaned);
      if (!isNaN(value) && value > 0) {
        amounts.push(value);
      }
    }
    return amounts;
  }

  // Pass 1: Find amounts on keyword lines, excluding non-total lines
  for (const keyword of totalKeywords) {
    const matchingLines = lines.filter(
      (line) => keyword.test(line) && !excludePattern.test(line)
    );

    const amounts: number[] = [];
    for (const line of matchingLines) {
      amounts.push(...extractAmounts(line));
    }

    if (amounts.length > 0) {
      return Math.max(...amounts).toFixed(2);
    }
  }

  // Pass 2: Fallback — largest dollar amount on any non-excluded line
  const allAmounts: number[] = [];
  for (const line of lines) {
    if (excludePattern.test(line)) continue;
    allAmounts.push(...extractAmounts(line));
  }

  if (allAmounts.length === 0) {
    // Pass 3: Last resort — any amount anywhere
    for (const line of lines) {
      allAmounts.push(...extractAmounts(line));
    }
  }

  if (allAmounts.length === 0) return null;
  return Math.max(...allAmounts).toFixed(2);
}
