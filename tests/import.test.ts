import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

import {
  createSequence,
  extractZzNumber,
  formatBarcode,
  highestZzNumber,
} from "@/lib/import/barcodeGenerator";
import { detectHeaders, normalizeHeader } from "@/lib/import/headerDetection";
import { parsePrice } from "@/lib/import/priceParser";
import { parseQuantity } from "@/lib/import/quantityParser";
import { mapRows } from "@/lib/import/rowMapper";
import { resolveIdentities } from "@/lib/import/identityResolver";
import { buildProducts } from "@/lib/import/importPipeline";

describe("barcodeGenerator", () => {
  it("formats 7-digit ZZ codes and grows past the width", () => {
    expect(formatBarcode(1)).toBe("ZZ0000001");
    expect(formatBarcode(10567)).toBe("ZZ0010567");
    expect(formatBarcode(9999999)).toBe("ZZ9999999");
    expect(formatBarcode(10000000)).toBe("ZZ10000000");
  });

  it("extracts and finds the highest ZZ number", () => {
    expect(extractZzNumber("ZZ0000234")).toBe(234);
    expect(extractZzNumber("AQ-001")).toBeNull();
    expect(highestZzNumber(["ZZ0000004", "AQ-1", "ZZ0000231", undefined])).toBe(231);
  });

  it("reserves codes continuing after the seed", () => {
    const seq = createSequence(231);
    expect(seq.peekNext()).toBe(232);
    expect(seq.reserve()).toBe("ZZ0000232");
    expect(seq.reserve()).toBe("ZZ0000233");
    expect(seq.last()).toBe(233);
  });
});

describe("headerDetection", () => {
  it("normalizes headers to compact alphanumerics", () => {
    expect(normalizeHeader("Product Name")).toBe("productname");
    expect(normalizeHeader("QTY.")).toBe("qty");
    expect(normalizeHeader("Selling_Price")).toBe("sellingprice");
  });

  it("maps common header variants", () => {
    const h = detectHeaders(["Item Description", "Available Qty", "Item Code", "MRP", "Manufacturer"]);
    expect(h.name).toBe("Item Description");
    expect(h.quantity).toBe("Available Qty");
    expect(h.sku).toBe("Item Code");
    expect(h.price).toBe("MRP");
    expect(h.brand).toBe("Manufacturer");
  });

  it("prefers SKU over name for the ambiguous 'Barcode' header", () => {
    const h = detectHeaders(["Barcode", "Name", "Qty"]);
    expect(h.sku).toBe("Barcode");
    expect(h.name).toBe("Name");
  });

  it("falls back to the first column for the name when nothing matches", () => {
    const h = detectHeaders(["Widget Column", "Quantity"]);
    expect(h.name).toBe("Widget Column");
    expect(h.quantity).toBe("Quantity");
  });
});

describe("parsers", () => {
  it("parses messy prices", () => {
    expect(parsePrice("₹1,299")).toBe(1299);
    expect(parsePrice("Rs. 1299.50")).toBe(1299.5);
    expect(parsePrice("1,299.00")).toBe(1299);
    expect(parsePrice(1200)).toBe(1200);
    expect(parsePrice("abc")).toBeUndefined();
    expect(parsePrice("")).toBeUndefined();
  });

  it("parses quantities (blank=1, floor, clamp)", () => {
    expect(parseQuantity("")).toBe(1);
    expect(parseQuantity(undefined)).toBe(1);
    expect(parseQuantity("4")).toBe(4);
    expect(parseQuantity(1.9)).toBe(1);
    expect(parseQuantity(-3)).toBe(0);
  });
});

describe("identity resolution (Rule 1 + Rule 4)", () => {
  it("merges same-name rows without SKU into one product with summed copies", () => {
    const rows = mapRows([
      { Name: "Adil Oud Black", Qty: 2 },
      { Name: "Adil Oud Black", Qty: 5 },
    ]);
    const identities = resolveIdentities(rows);
    expect(identities).toHaveLength(1);
    expect(identities[0].copies).toBe(7);
    expect(identities[0].sku).toBeUndefined();
  });

  it("keeps different names as separate identities", () => {
    const identities = resolveIdentities(
      mapRows([
        { Name: "Adil Oud Black", Qty: 1 },
        { Name: "Adil Oud White", Qty: 1 },
      ]),
    );
    expect(identities).toHaveLength(2);
  });

  it("uses SKU as identity when present and merges by SKU", () => {
    const identities = resolveIdentities(
      mapRows([
        { Name: "Wallet", SKU: "AQ-001", Qty: 3 },
        { Name: "Wallet (dup label)", SKU: "AQ-001", Qty: 2 },
      ]),
    );
    expect(identities).toHaveLength(1);
    expect(identities[0].sku).toBe("AQ-001");
    expect(identities[0].copies).toBe(5);
  });
});

describe("buildProducts pipeline", () => {
  it("uses provided SKU as the barcode and never generates for it", () => {
    const seq = createSequence(0);
    const { products, generatedCount } = buildProducts([{ Name: "Wallet", SKU: "AQ-001", Qty: 3 }], seq);
    expect(products[0].barcode).toBe("AQ-001");
    expect(products[0].sku).toBe("AQ-001");
    expect(products[0].copies).toBe(3);
    expect(generatedCount).toBe(0);
  });

  it("generates a ZZ barcode only when SKU is missing", () => {
    const seq = createSequence(230);
    const { products, generatedCount, totalCopies } = buildProducts(
      [
        { Name: "Bag", SKU: "", Qty: 2 },
        { Name: "Belt", SKU: "B-9", Qty: 1 },
      ],
      seq,
    );
    const bag = products.find((p) => p.name === "Bag");
    const belt = products.find((p) => p.name === "Belt");
    expect(bag?.barcode).toBe("ZZ0000231");
    expect(bag?.sku).toBeUndefined();
    expect(belt?.barcode).toBe("B-9");
    expect(generatedCount).toBe(1);
    expect(totalCopies).toBe(3);
  });

  it("imports Selling Price and Brand", () => {
    const { products } = buildProducts(
      [{ Name: "Ring", "Selling Price": "₹1,299", Brand: "Adil Qadri", Qty: 1 }],
      createSequence(0),
    );
    expect(products[0].price).toBe(1299);
    expect(products[0].brand).toBe("Adil Qadri");
  });
});

describe("real workbook round-trip (SheetJS)", () => {
  it("parses a written .xlsx and applies every rule end-to-end", () => {
    // Build a real workbook, serialize, and read it back exactly as an upload
    // would, then run the full pipeline.
    const rows = [
      { NAME: "Adil Qadri Glamour Oudh", QTY: 2 },
      { NAME: "Abnorml Monalisa Pop XL", QTY: 1 },
      { NAME: "Kalankit Round Box Sling Bag", QTY: 1 },
      { NAME: "Adil Qadri Glamour Oudh", QTY: 3 }, // merges with row 1
      { NAME: "Wallet With Code", QTY: 2, SKU: "AQ-1001", MRP: "₹1,299" },
    ];
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    const back = XLSX.read(buffer, { type: "array" });
    const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      back.Sheets[back.SheetNames[0]],
      { defval: "" },
    );

    const { products, totalCopies, generatedCount } = buildProducts(records, createSequence(0));

    // 4 distinct identities (the two "Adil Qadri Glamour Oudh" rows merged).
    expect(products.map((p) => p.name)).toEqual([
      "Adil Qadri Glamour Oudh",
      "Abnorml Monalisa Pop XL",
      "Kalankit Round Box Sling Bag",
      "Wallet With Code",
    ]);
    // Merge → copies 2+3 = 5; quantity never created extra products.
    expect(products[0].copies).toBe(5);
    // Generated 7-digit ZZ codes in sequence for the SKU-less products.
    expect(products[0].barcode).toBe("ZZ0000001");
    expect(products[1].barcode).toBe("ZZ0000002");
    expect(products[2].barcode).toBe("ZZ0000003");
    // Provided SKU is authoritative — used as the barcode, never generated.
    expect(products[3].barcode).toBe("AQ-1001");
    expect(products[3].sku).toBe("AQ-1001");
    expect(products[3].price).toBe(1299);
    expect(generatedCount).toBe(3);
    expect(totalCopies).toBe(5 + 1 + 1 + 2);
  });
});
