import { describe, expect, it } from "vitest";

import { generateTSPL, generateTsplBatch } from "@/lib/tspl";

describe("generateTSPL", () => {
  const label = {
    barcode: "101860",
    name: "Thor Keychain",
    sku: "ZZ001",
    price: 1200,
    brand: "ZenZebra",
  };

  it("emits a 100x15mm label with correct header", () => {
    const tspl = generateTSPL(label);
    expect(tspl).toContain("SIZE 100 mm,15 mm");
    expect(tspl).toContain("GAP 2 mm,0");
    expect(tspl).toContain("CLS");
    expect(tspl).toMatch(/PRINT 1\r\n$/);
  });

  it("includes the barcode, sku+name, brand and rupee price", () => {
    const tspl = generateTSPL(label);
    expect(tspl).toContain('"101860"');
    expect(tspl).toContain("ZZ001 Thor Keychain");
    expect(tspl).toContain("ZenZebra");
    expect(tspl).toContain("SP = Rs.1200");
  });

  it("keeps all X coordinates inside the 55mm printable body (<=440 dots)", () => {
    const tspl = generateTSPL(label);
    const xs = [...tspl.matchAll(/^(?:TEXT|BARCODE) (\d+),/gm)].map((m) => Number(m[1]));
    expect(xs.length).toBeGreaterThan(0);
    for (const x of xs) {
      expect(x).toBeLessThan(440);
    }
  });

  it("omits the price line when no price is set", () => {
    const tspl = generateTSPL({ barcode: "123", name: "No Price" });
    expect(tspl).not.toContain("SP =");
  });

  it("drops non-ASCII and double quotes from text", () => {
    const tspl = generateTSPL({ barcode: "123", name: 'Ring "Gold" ₹', brand: "Zén" });
    expect(tspl).not.toContain("₹");
    expect(tspl).not.toMatch(/"Ring "Gold""/);
  });

  it("batches multiple labels into repeated commands", () => {
    const batch = generateTsplBatch([label, label]);
    expect((batch.match(/SIZE 100 mm,15 mm/g) ?? []).length).toBe(2);
    expect((batch.match(/PRINT 1/g) ?? []).length).toBe(2);
  });

  it("auto layout drops the brand and spans full width for a long barcode", () => {
    // EAN13 doesn't fit the 55mm split half → full width, no brand.
    const tspl = generateTSPL({
      barcode: "9555028703736",
      name: "Perfume",
      price: 1200,
      brand: "ZenZebra",
    });
    expect(tspl).toContain('"9555028703736"');
    expect(tspl).not.toContain("ZenZebra"); // brand collapses
    expect(tspl).toContain("SP = Rs.1200"); // price stays
    // Full-width EAN uses a wider module (narrow 3).
    expect(tspl).toMatch(/BARCODE \d+,\d+,"EAN13",\d+,2,0,3,3,/);
  });

  it("keeps the split layout (brand present) for a short code", () => {
    const tspl = generateTSPL(label); // "101860" → 68 modules → split
    expect(tspl).toContain("ZenZebra");
  });

  it("respects an explicit full-width mode even for a short code", () => {
    const tspl = generateTSPL(label, { layoutMode: "fullWidth" });
    expect(tspl).not.toContain("ZenZebra");
  });
});
