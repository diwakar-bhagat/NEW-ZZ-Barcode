import { describe, expect, it } from "vitest";

import { estimateBarcodeModules, resolveLabelLayout } from "@/lib/labelLayout";

describe("estimateBarcodeModules", () => {
  it("uses symbology-fixed counts for EAN/UPC", () => {
    expect(estimateBarcodeModules("9555028703736")).toBe(95); // EAN13
    expect(estimateBarcodeModules("123456789012")).toBe(95); // UPC-A
    expect(estimateBarcodeModules("12345678")).toBe(67); // EAN8
  });

  it("packs numeric CODE128 denser than alphanumeric", () => {
    // 6 digits via code C: 6*5.5 + 35 = 68
    expect(estimateBarcodeModules("101860")).toBe(68);
    // 17 alphanumeric via code B: 17*11 + 35 = 222
    expect(estimateBarcodeModules("KNITAHDBG88979570")).toBe(222);
  });
});

describe("resolveLabelLayout — explicit modes", () => {
  it("split/fullWidth are honored regardless of barcode", () => {
    expect(resolveLabelLayout("split", "KNITAHDBG88979570", 55)).toEqual({
      mode: "split",
      showBrand: true,
    });
    expect(resolveLabelLayout("fullWidth", "12345678", 55)).toEqual({
      mode: "fullWidth",
      showBrand: false,
    });
  });
});

describe("resolveLabelLayout — auto", () => {
  it("sends long/dense barcodes to full width on the narrow jewellery roll (55mm)", () => {
    const codes = [
      "9555028703736",
      "8901234567897",
      "ZZ000000001",
      "KNITAHDBG88979570",
      "SHIRTBLACKXL2026",
    ];
    for (const code of codes) {
      const resolved = resolveLabelLayout("auto", code, 55);
      expect(resolved.mode, `${code} should be full width on 55mm`).toBe("fullWidth");
      expect(resolved.showBrand).toBe(false);
    }
  });

  it("keeps genuinely short codes in split (brand visible)", () => {
    expect(resolveLabelLayout("auto", "12345678", 55).mode).toBe("split"); // EAN8
    expect(resolveLabelLayout("auto", "101860", 55).mode).toBe("split"); // 6-digit numeric
  });

  it("adapts to width — a wider label keeps more codes in split", () => {
    // EAN13 doesn't fit the 55mm roll's split half, but does on a 100mm label.
    expect(resolveLabelLayout("auto", "9555028703736", 55).mode).toBe("fullWidth");
    expect(resolveLabelLayout("auto", "9555028703736", 100).mode).toBe("split");
  });
});
