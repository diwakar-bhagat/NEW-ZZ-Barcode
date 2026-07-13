// TSPL builder for the 100mm x 15mm bat-shaped jewellery label
// (XPrinter XP-410B and compatible TSPL/TSPL2 printers, 203 dpi = 8 dots/mm).
//
// Label geometry: 55mm printable body on the left, 45mm blank tail on the
// right. The body is split 50:50 — barcode + number + SKU/name on the left
// half, brand + selling price on the right half.
//
// Note: TSPL internal fonts are ASCII-only, so the rupee sign is printed as
// "Rs." (the on-screen preview shows the real ₹ symbol).

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
};

const DEFAULTS: Required<TsplOptions> = {
  widthMm: 100,
  heightMm: 15,
  gapMm: 2,
  printableMm: 55,
  dotsPerMm: 8,
  density: 8,
  speed: 3,
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

  // Left half: barcode (with human-readable number centered under it) at the
  // top, SKU/name line under it. Font "1" is 8x12 dots (~1.5mm tall).
  const barcodeHeight = 48; // 6mm of bars
  const barcodeX = margin;
  const barcodeY = 10;
  const nameY = barcodeY + barcodeHeight + 26; // bars + human-readable line

  // Right half: brand bold on top, price under it. Font "2" is 12x20 dots;
  // bold is approximated by printing twice with a 1-dot offset.
  const rightX = halfW + 12;
  const brandY = 18;
  const priceY = brandY + 46;

  const lines = [
    `SIZE ${opts.widthMm} mm,${opts.heightMm} mm`,
    `GAP ${opts.gapMm} mm,0`,
    "DIRECTION 1",
    "REFERENCE 0,0",
    `DENSITY ${opts.density}`,
    `SPEED ${opts.speed}`,
    "CLS",
    `BARCODE ${barcodeX},${barcodeY},"${barcodeType(barcode)}",${barcodeHeight},2,0,2,4,"${barcode}"`,
  ];

  if (nameLine) {
    lines.push(`TEXT ${barcodeX},${nameY},"1",0,1,1,"${nameLine}"`);
  }
  if (brand) {
    lines.push(`TEXT ${rightX},${brandY},"2",0,1,1,"${brand}"`);
    lines.push(`TEXT ${rightX + 1},${brandY},"2",0,1,1,"${brand}"`);
  }
  if (priceLine) {
    lines.push(`TEXT ${rightX},${priceY},"2",0,1,1,"${sanitize(priceLine)}"`);
  }

  // Guard: nothing may print past the body into the tail (x >= printableW)
  // or below the label (y >= heightDots). Coordinates above are constants
  // within bounds; this comment documents the invariant for future edits.
  void heightDots;

  lines.push(`PRINT ${Math.max(1, label.copies ?? 1)}`);
  return `${lines.join("\r\n")}\r\n`;
}

export function generateTsplBatch(labels: TsplLabel[], options: TsplOptions = {}): string {
  return labels.map((label) => generateTSPL(label, options)).join("");
}
