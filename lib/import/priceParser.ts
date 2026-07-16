// Price parsing — tolerant of the many ways a selling price appears in real
// spreadsheets: "₹1,299", "Rs. 1299.00", "1,299", "$12.50", plain numbers,
// or numeric cells. Returns undefined when there is no usable number.

export const parsePrice = (value: unknown): number | undefined => {
  if (value == null || value === "") {
    return undefined;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  const text = String(value).trim();
  if (!text) {
    return undefined;
  }
  // Drop thousands separators, then extract the first numeric token. This
  // tolerates currency prefixes/suffixes incl. ones with periods ("Rs.",
  // "₹", "$", "MRP") without mistaking the abbreviation dot for a decimal.
  const match = text.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  if (!match) {
    return undefined;
  }
  const parsed = Number.parseFloat(match[0]);
  return Number.isFinite(parsed) ? parsed : undefined;
};
