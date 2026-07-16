// Header detection — maps arbitrary spreadsheet column names to our fields
// using normalized alias sets, so imports are almost zero-configuration.
//
// Matching strategy (deterministic, no heavy deps):
//   1. Normalize the header to lowercase alphanumerics ("Product Name" ->
//      "productname", "QTY." -> "qty", "Selling Price" -> "sellingprice").
//   2. Exact alias hit wins.
//   3. Otherwise a lightweight "contains a strong token" fallback (e.g.
//      "available quantity" contains "quantity").
//   4. If no name column is found, fall back to the first unmapped column.

export type ImportFieldKey = "name" | "sku" | "quantity" | "price" | "brand";

export const normalizeHeader = (header: string): string =>
  header.toLowerCase().replace(/[^a-z0-9]/g, "");

// Alias sets are stored normalized (see normalizeHeader).
const ALIASES: Record<ImportFieldKey, string[]> = {
  name: ["name", "productname", "product", "item", "itemname", "description", "itemdescription", "title", "label"],
  sku: ["sku", "itemcode", "productcode", "code", "reference", "internalreference", "defaultcode", "barcode"],
  quantity: [
    "qty",
    "quantity",
    "quantityordered",
    "qtyordered",
    "stock",
    "stockqty",
    "availableqty",
    "units",
    "pieces",
    "pcs",
    "nos",
    "count",
    "amount",
  ],
  price: [
    "price",
    "sp",
    "sellingprice",
    "saleprice",
    "salesprice",
    "mrp",
    "retailprice",
    "listprice",
    "rate",
  ],
  brand: ["brand", "manufacturer", "company", "vendor", "make"],
};

// Strong tokens for the substring fallback (order = specificity).
const TOKENS: Record<ImportFieldKey, string[]> = {
  sku: ["sku", "itemcode", "productcode", "reference", "defaultcode"],
  quantity: ["quantity", "qty"],
  price: ["sellingprice", "price", "mrp"],
  brand: ["brand", "manufacturer", "vendor"],
  name: ["productname", "itemname", "description", "name"],
};

const FIELD_PRIORITY: ImportFieldKey[] = ["sku", "quantity", "price", "brand", "name"];

const aliasLookup = ((): Map<string, ImportFieldKey> => {
  const map = new Map<string, ImportFieldKey>();
  // Insert in priority order so a header that appears in two sets keeps the
  // higher-priority field (e.g. "barcode" -> sku, not name).
  for (const field of FIELD_PRIORITY) {
    for (const alias of ALIASES[field]) {
      if (!map.has(alias)) {
        map.set(alias, field);
      }
    }
  }
  return map;
})();

export type DetectedHeaders = Partial<Record<ImportFieldKey, string>>;

/**
 * Detect which original header key maps to each field.
 * Returns the ORIGINAL (un-normalized) keys so callers can read cell values.
 */
export const detectHeaders = (keys: string[]): DetectedHeaders => {
  const result: DetectedHeaders = {};
  const used = new Set<string>();

  // Pass 1: exact alias matches.
  for (const key of keys) {
    const norm = normalizeHeader(key);
    const field = aliasLookup.get(norm);
    if (field && !result[field]) {
      result[field] = key;
      used.add(key);
    }
  }

  // Pass 2: substring/token fallback for still-unmapped fields.
  for (const field of FIELD_PRIORITY) {
    if (result[field]) {
      continue;
    }
    for (const key of keys) {
      if (used.has(key)) {
        continue;
      }
      const norm = normalizeHeader(key);
      if (TOKENS[field].some((token) => norm.includes(token))) {
        result[field] = key;
        used.add(key);
        break;
      }
    }
  }

  // Pass 3: if no name column matched, use the first unmapped column.
  if (!result.name) {
    const fallback = keys.find((key) => !used.has(key));
    if (fallback) {
      result.name = fallback;
    }
  }

  return result;
};
