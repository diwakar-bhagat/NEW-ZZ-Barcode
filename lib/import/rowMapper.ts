// Row mapping — turn raw sheet records into typed, normalized rows using the
// detected header columns and the field parsers. No identity/barcode logic
// here (that belongs to identityResolver + barcodeGenerator).

import { detectHeaders, type DetectedHeaders } from "./headerDetection";
import { parsePrice } from "./priceParser";
import { parseQuantity } from "./quantityParser";

export type MappedRow = {
  name: string;
  sku?: string;
  quantity: number;
  price?: number;
  brand?: string;
};

const cell = (record: Record<string, unknown>, key: string | undefined): string => {
  if (!key) {
    return "";
  }
  const value = record[key];
  return value == null ? "" : String(value).trim();
};

/** Map already-parsed sheet records to normalized rows using detected headers. */
export const mapRows = (
  records: Record<string, unknown>[],
  headers: DetectedHeaders = detectHeaders(records[0] ? Object.keys(records[0]) : []),
): MappedRow[] => {
  const rows: MappedRow[] = [];
  for (const record of records) {
    const name = cell(record, headers.name);
    const sku = cell(record, headers.sku);
    // A row needs an identity source: a name or an explicit SKU.
    if (!name && !sku) {
      continue;
    }
    rows.push({
      name,
      sku: sku || undefined,
      quantity: parseQuantity(headers.quantity ? record[headers.quantity] : undefined),
      price: parsePrice(headers.price ? record[headers.price] : undefined),
      brand: cell(record, headers.brand) || undefined,
    });
  }
  return rows;
};
