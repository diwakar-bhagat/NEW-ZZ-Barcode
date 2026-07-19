// Adaptive label layout engine — the single source of truth for how a label
// arranges itself given the barcode and the available width. Both the on-screen
// preview (React) and the TSPL/QZ printer path consult this so every output
// stays in sync.
//
//   Auto (default): short/dense-enough barcode → Split (barcode + brand + SP,
//                   today's look). Long barcode → Full Width (barcode spans the
//                   label, brand collapses, SP + name stay).
//   Split:          always today's split layout.
//   Full Width:     always full-width barcode, brand hidden.
//
// The decision is driven by the ESTIMATED MODULE COUNT of the barcode (its real
// density), not raw character count — so a 13-digit EAN-13 and a 6-digit
// numeric code are judged correctly even though both are "short" by length.

export type LabelLayoutMode = "auto" | "split" | "fullWidth";

/**
 * Estimate how many unit-width modules a barcode symbol needs. Used to decide
 * whether it can fit the narrow "split" half at a scannable module width.
 * - EAN-13 / UPC-A: 95 modules; EAN-8: 67 (fixed by the symbology).
 * - CODE128: numeric data uses code C (~5.5 modules/digit); anything else uses
 *   code B (~11 modules/char); plus ~35 modules of start/checksum/stop.
 */
export const estimateBarcodeModules = (value: string): number => {
  const v = value.trim();
  if (/^\d{13}$/.test(v) || /^\d{12}$/.test(v)) {
    return 95;
  }
  if (/^\d{8}$/.test(v)) {
    return 67;
  }
  const isNumeric = /^\d+$/.test(v);
  const dataModules = isNumeric ? v.length * 5.5 : v.length * 11;
  return Math.round(dataModules + 35);
};

// A barcode is kept in Split only if its bars fit ~45% of the label width at a
// reliable module width (~0.3 mm). In module terms that is labelWidthMm × 1.5.
export const SPLIT_FIT_MODULES_PER_MM = 1.5;

export type ResolvedLabelLayout = {
  mode: "split" | "fullWidth";
  showBrand: boolean;
};

/**
 * Resolve the effective layout for one label. `labelWidthMm` is the printable
 * label width (labelWidthCm × 10) — wider labels keep more codes in Split.
 */
export const resolveLabelLayout = (
  mode: LabelLayoutMode | undefined,
  barcode: string,
  labelWidthMm: number,
): ResolvedLabelLayout => {
  if (mode === "split") {
    return { mode: "split", showBrand: true };
  }
  if (mode === "fullWidth") {
    return { mode: "fullWidth", showBrand: false };
  }
  // auto
  const fitsSplit =
    estimateBarcodeModules(barcode) <= Math.max(1, labelWidthMm) * SPLIT_FIT_MODULES_PER_MM;
  return fitsSplit ? { mode: "split", showBrand: true } : { mode: "fullWidth", showBrand: false };
};
