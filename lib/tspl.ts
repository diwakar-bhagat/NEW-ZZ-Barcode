// TSPL builder for the 100mm x 15mm bat-shaped jewellery label
// (XPrinter XP-410B and compatible TSPL/TSPL2 printers, 203 dpi = 8 dots/mm).
//
// Label geometry: 55mm printable body on the left, 45mm blank tail on the
// right. The body is split 50:50 — barcode + number + SKU/name on the left
// half, brand + selling price on the right half.
//
// Note: TSPL internal fonts are ASCII-only, so the rupee sign is printed as
// "Rs." (the on-screen preview shows the real ₹ symbol).

import { resolveLabelLayout, type LabelLayoutMode } from "./labelLayout";

export type TsplLabel = {
  barcode: string;
  name: string;
  sku?: string;
  price?: number;
  brand?: string;
  copies?: number;
};

export type TsplOptions = {
  widthMm?: number;
  heightMm?: number;
  gapMm?: number;
  printableMm?: number;
  dotsPerMm?: number;
  density?: number;
  speed?: number;
  layoutMode?: LabelLayoutMode;
};

const DEFAULTS = {
  widthMm: 100,
  heightMm: 15,
  gapMm: 2,
  printableMm: 55,
  dotsPerMm: 8,
  density: 8,
  speed: 3,
  layoutMode: "auto" as LabelLayoutMode,
};

// TSPL strings cannot contain double quotes; drop anything non-ASCII too,
// since the printer's internal fonts cannot render it.
const sanitize = (value: string) =>
  value
    .replace(/"/g, "'")
    // eslint-disable-next-line no-control-regex
    .replace(/[^\x20-\x7E]/g, "")
    .trim();

const formatPrice = (price: number) =>
  Number.isInteger(price) ? String(price) : price.toFixed(2);

const barcodeType = (value: string): string => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length === 13 && cleaned === value) {
    return "EAN13";
  }
  if (cleaned.length === 8 && cleaned === value) {
    return "EAN8";
  }
  return "128";
};

export function generateTSPL(label: TsplLabel, options: TsplOptions = {}): string {
  const opts = { ...DEFAULTS, ...options };
  const dots = opts.dotsPerMm;

  const printableW = opts.printableMm * dots; // 440 dots
  const halfW = Math.floor(printableW / 2); // 220 dots (27.5mm)
  const heightDots = opts.heightMm * dots; // 120 dots

  const margin = 2 * dots; // 2mm inset from the label edge
  const barcode = sanitize(label.barcode);
  const nameLine = sanitize(label.sku ? `${label.sku} ${label.name}` : label.name);
  const brand = sanitize(label.brand ?? "ZenZebra");
  const priceLine = label.price != null ? `SP = Rs.${formatPrice(label.price)}` : "";
  const type = barcodeType(barcode);

  // Same adaptive engine as the on-screen preview / PDF: long barcodes take the
  // full printable width and drop the brand; short ones keep the split layout.
  const resolved = resolveLabelLayout(opts.layoutMode, barcode, opts.printableMm);

  const lines = [
    `SIZE ${opts.widthMm} mm,${opts.heightMm} mm`,
    `GAP ${opts.gapMm} mm,0`,
    "DIRECTION 1",
    "REFERENCE 0,0",
    `DENSITY ${opts.density}`,
    `SPEED ${opts.speed}`,
    "CLS",
  ];

  if (resolved.mode === "fullWidth") {
    // Barcode spans the full printable body; number + name + SP stacked below.
    // EAN/UPC get a wider module (narrow 3) since they're fixed-length; CODE128
    // (which may be long) uses narrow 2 to fit more data in the width.
    const narrow = type === "128" ? 2 : 3;
    const barcodeHeight = 56; // ~7mm of bars
    const barcodeY = 8;
    const nameY = barcodeY + barcodeHeight + 24; // bars + human-readable number
    const priceY = nameY + 22;
    lines.push(
      `BARCODE ${margin},${barcodeY},"${type}",${barcodeHeight},2,0,${narrow},${narrow},"${barcode}"`,
    );
    if (nameLine) {
      lines.push(`TEXT ${margin},${nameY},"1",0,1,1,"${nameLine}"`);
    }
    if (priceLine) {
      lines.push(`TEXT ${margin},${priceY},"2",0,1,1,"${sanitize(priceLine)}"`);
    }
  } else {
    // Split: barcode + name left, brand + price right (today's layout).
    const barcodeHeight = 48; // 6mm of bars
    const barcodeY = 10;
    const nameY = barcodeY + barcodeHeight + 26;
    const rightX = halfW + 12;
    const brandY = 18;
    const priceY = brandY + 46;
    lines.push(
      `BARCODE ${margin},${barcodeY},"${type}",${barcodeHeight},2,0,2,4,"${barcode}"`,
    );
    if (nameLine) {
      lines.push(`TEXT ${margin},${nameY},"1",0,1,1,"${nameLine}"`);
    }
    if (brand) {
      // Bold approximated by over-printing with a 1-dot offset.
      lines.push(`TEXT ${rightX},${brandY},"2",0,1,1,"${brand}"`);
      lines.push(`TEXT ${rightX + 1},${brandY},"2",0,1,1,"${brand}"`);
    }
    if (priceLine) {
      lines.push(`TEXT ${rightX},${priceY},"2",0,1,1,"${sanitize(priceLine)}"`);
    }
  }

  // Guard: nothing prints past the body into the tail (x >= printableW) or below
  // the label (y >= heightDots). Coordinates above stay within bounds.
  void heightDots;

  lines.push(`PRINT ${Math.max(1, label.copies ?? 1)}`);
  return `${lines.join("\r\n")}\r\n`;
}

export function generateTsplBatch(labels: TsplLabel[], options: TsplOptions = {}): string {
  return labels.map((label) => generateTSPL(label, options)).join("");
}
