// Identity resolution — the core business rule.
//
//   Identity = SKU > Name.
//
// - If a row has a SKU, the SKU is the identity (authoritative). Rows sharing a
//   SKU merge and their quantities sum.
// - If a row has no SKU, the NAME is the identity. Rows sharing a name merge
//   and their quantities sum (so "Adil Oud Black x2" + "Adil Oud Black x5"
//   becomes ONE product with copies = 7, never two barcodes).
// - Different names (or different SKUs) stay separate products (variants).
//
// Quantity belongs to the product, not the row. No barcode logic here.

import type { MappedRow } from "./rowMapper";

export type ResolvedProduct = {
  name: string;
  /** Provided SKU (authoritative). Undefined means "generate a barcode". */
  sku?: string;
  price?: number;
  brand?: string;
  /** Total print copies (sum of merged rows' quantities). */
  copies: number;
  identityKey: string;
};

const norm = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

export const resolveIdentities = (rows: MappedRow[]): ResolvedProduct[] => {
  const byKey = new Map<string, ResolvedProduct>();
  const order: string[] = [];

  for (const row of rows) {
    const hasSku = Boolean(row.sku);
    const key = hasSku ? `sku:${norm(row.sku as string)}` : `name:${norm(row.name)}`;
    const existing = byKey.get(key);

    if (existing) {
      existing.copies += row.quantity;
      if (existing.price == null && row.price != null) {
        existing.price = row.price;
      }
      if (!existing.brand && row.brand) {
        existing.brand = row.brand;
      }
      if (!existing.name && row.name) {
        existing.name = row.name;
      }
      continue;
    }

    byKey.set(key, {
      // When a SKU row has no name, show the SKU as the display name.
      name: row.name || (row.sku as string),
      sku: row.sku,
      price: row.price,
      brand: row.brand,
      copies: row.quantity,
      identityKey: key,
    });
    order.push(key);
  }

  // Drop identities that ended up with no copies (all rows were 0/negative qty).
  return order.map((key) => byKey.get(key) as ResolvedProduct).filter((p) => p.copies > 0);
};
