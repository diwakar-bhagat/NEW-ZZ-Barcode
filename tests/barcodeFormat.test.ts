import { describe, expect, it } from "vitest";

import { detectBarcodeFormat } from "@/components/BarcodeSvg";

describe("detectBarcodeFormat", () => {
  it("uses CODE128 for alphanumeric values (regression for KNITAHDBG88979570)", () => {
    expect(detectBarcodeFormat("KNITAHDBG88979570")).toBe("CODE128");
    expect(detectBarcodeFormat("AQ-1001")).toBe("CODE128");
    expect(detectBarcodeFormat("ZZ0000001")).toBe("CODE128");
  });

  it("only picks EAN/UPC when the WHOLE value is digits of the exact length", () => {
    expect(detectBarcodeFormat("1234567890128")).toBe("EAN13");
    expect(detectBarcodeFormat("123456789012")).toBe("UPC");
    expect(detectBarcodeFormat("12345670")).toBe("EAN8");
    // Digit counts that don't match a symbology fall back to CODE128.
    expect(detectBarcodeFormat("12345")).toBe("CODE128");
    expect(detectBarcodeFormat("880000")).toBe("CODE128");
  });
});
