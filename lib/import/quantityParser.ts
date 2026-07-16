// Quantity parsing — quantity controls PRINT COPIES only, never identity.
//
// Rules:
// - Blank cell (or no quantity column) → 1 (assume at least one label).
// - Decimals are floored (1.9 → 1).
// - Negative or zero → 0 (the row contributes no copies; if every row for a
//   product is 0 the product is dropped downstream).

export const parseQuantity = (value: unknown): number => {
  if (value == null || value === "") {
    return 1;
  }
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(n)) {
    return 1;
  }
  return Math.max(0, Math.floor(n));
};
