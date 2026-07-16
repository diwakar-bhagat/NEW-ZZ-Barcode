// Import pipeline — orchestrates the pure layers into finished products.
//
//   Workbook → records → header detection → row mapping → identity resolution
//   → barcode assignment (SKU authoritative, else reserve() from the sequence)
//   → ImportedProduct[]
//
// `buildProducts` is pure given a sequence, so the whole pipeline is unit
// testable without a real file. `parseWorkbook` isolates the SheetJS I/O.

import * as XLSX from "xlsx";

import type { BarcodeSequence } from "./barcodeGenerator";
import { detectHeaders } from "./headerDetection";
import { resolveIdentities } from "./identityResolver";
import { mapRows } from "./rowMapper";

export type ImportedProduct = {
  name: string;
  /** Provided SKU only. Generated codes live on `barcode`, not here, to avoid
   *  a redundant "ZZ… <name>" line on the label. */
  sku?: string;
  barcode: string;
  price?: number;
  brand?: string;
  copies: number;
  /** True when the barcode was auto-generated (no SKU in the sheet). */
  generated: boolean;
};

export type ImportResult = {
  products: ImportedProduct[];
  totalCopies: number;
  generatedCount: number;
};

/** Pure: records + a barcode sequence → finished products. */
export const buildProducts = (
  records: Record<string, unknown>[],
  sequence: BarcodeSequence,
): ImportResult => {
  const headers = detectHeaders(records[0] ? Object.keys(records[0]) : []);
  const identities = resolveIdentities(mapRows(records, headers));

  let generatedCount = 0;
  const products: ImportedProduct[] = identities.map((identity) => {
    const hasSku = Boolean(identity.sku);
    const barcode = hasSku ? (identity.sku as string) : sequence.reserve();
    if (!hasSku) {
      generatedCount += 1;
    }
    return {
      name: identity.name,
      sku: identity.sku,
      barcode,
      price: identity.price,
      brand: identity.brand,
      copies: identity.copies,
      generated: !hasSku,
    };
  });

  return {
    products,
    totalCopies: products.reduce((sum, product) => sum + product.copies, 0),
    generatedCount,
  };
};

/** Read an uploaded .xlsx/.xls/.csv file into raw sheet records. */
export const parseWorkbook = async (file: File): Promise<Record<string, unknown>[]> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = sheetName ? workbook.Sheets[sheetName] : undefined;
  if (!sheet) {
    return [];
  }
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
};
