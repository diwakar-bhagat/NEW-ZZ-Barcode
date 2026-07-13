export type LayoutSettings = {
  paperWidthCm: number;
  paperHeightCm: number;
  marginCm: number;
  labelWidthCm: number;
  labelHeightCm: number;
  gapXCm?: number;
  gapYCm?: number;
  barcodeHeightMm?: number;
  fontSizePt?: number;
  cellPaddingCm?: number;
  offsetXCm?: number;
  offsetYCm?: number;
  labelTemplate?: "default" | "jewellery-split";
  brandText?: string;
};

export type GridMetrics = {
  usableWidthCm: number;
  usableHeightCm: number;
  columns: number;
  rows: number;
  labelsPerPage: number;
  cellWidthCm: number;
  cellHeightCm: number;
};

const clampNonNegative = (value: number) => (Number.isFinite(value) ? Math.max(0, value) : 0);

export function computeGrid(layout: LayoutSettings): GridMetrics {
  const gapX = clampNonNegative(layout.gapXCm ?? 0);
  const gapY = clampNonNegative(layout.gapYCm ?? 0);
  const margin = clampNonNegative(layout.marginCm);
  const offsetX = clampNonNegative(layout.offsetXCm ?? 0);
  const offsetY = clampNonNegative(layout.offsetYCm ?? 0);

  const usableWidthCm = clampNonNegative(layout.paperWidthCm - margin * 2 - offsetX);
  const usableHeightCm = clampNonNegative(layout.paperHeightCm - margin * 2 - offsetY);

  const cellWidthCm = clampNonNegative(layout.labelWidthCm + gapX);
  const cellHeightCm = clampNonNegative(layout.labelHeightCm + gapY);

  const columns = cellWidthCm === 0 ? 0 : Math.floor(usableWidthCm / cellWidthCm);
  const rows = cellHeightCm === 0 ? 0 : Math.floor(usableHeightCm / cellHeightCm);
  const labelsPerPage = Math.max(0, columns * rows);

  return {
    usableWidthCm,
    usableHeightCm,
    columns,
    rows,
    labelsPerPage,
    cellWidthCm,
    cellHeightCm,
  };
}
