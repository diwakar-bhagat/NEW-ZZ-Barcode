"use client";

import JsBarcode from "jsbarcode";
import { useEffect, useRef } from "react";

// Pick a symbology from the WHOLE (trimmed) value. EAN/UPC only accept digits
// of an exact length, so anything with letters/symbols or another length is
// CODE128 — which supports the full ASCII set (e.g. "KNITAHDBG88979570").
//
// Note: the previous version stripped non-digits first and matched on the
// digit count, so "KNITAHDBG88979570" (8 embedded digits) was mis-detected as
// EAN8 and failed to render.
export const detectBarcodeFormat = (value: string): string => {
  if (/^\d{13}$/.test(value)) {
    return "EAN13";
  }
  if (/^\d{12}$/.test(value)) {
    return "UPC";
  }
  if (/^\d{8}$/.test(value)) {
    return "EAN8";
  }
  return "CODE128";
};

export default function BarcodeSvg({
  value,
  height,
  maxHeightPx,
}: {
  value: string;
  height: number;
  maxHeightPx?: number;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const trimmed = value.trim();
    if (!svg || !trimmed) {
      if (svg) {
        svg.innerHTML = "";
      }
      return;
    }

    const render = (format: string) => {
      const moduleWidth = format === "CODE128" ? 2 : 1.5;
      JsBarcode(svg, trimmed, {
        format,
        displayValue: true,
        height,
        // Quiet zone: EAN/UPC need ~11 blank modules on the left (7 on the
        // right) and CODE128 ~10, or scanners can't lock onto the edges and a
        // perfectly-valid barcode won't scan. The old margin of 2px was ~1
        // module — the root cause of "renders but won't scan".
        margin: Math.round(moduleWidth * 11),
        width: moduleWidth,
        // Bold, larger human-readable number so it reads clearly at small sizes.
        fontSize: 18,
        fontOptions: "bold",
        textAlign: "center",
        textPosition: "bottom",
        textMargin: 2,
        // Solid white background so the quiet zone has real contrast (a
        // transparent quiet zone over any tint degrades scanning).
        background: "#ffffff",
        lineColor: "#000000",
      });
      // JsBarcode sets fixed px width/height; swap them for a viewBox so the
      // barcode scales down to fit the cell while keeping its aspect ratio.
      const generatedWidth = parseFloat(svg.getAttribute("width") ?? "");
      const generatedHeight = parseFloat(svg.getAttribute("height") ?? "");
      if (Number.isFinite(generatedWidth) && Number.isFinite(generatedHeight)) {
        svg.setAttribute("viewBox", `0 0 ${generatedWidth} ${generatedHeight}`);
        svg.removeAttribute("width");
        svg.removeAttribute("height");
      }
    };

    try {
      render(detectBarcodeFormat(trimmed));
    } catch {
      // Fall back to CODE128 (accepts any ASCII) — e.g. a 13-digit value with
      // an invalid EAN checksum would otherwise render blank.
      try {
        render("CODE128");
      } catch {
        svg.innerHTML = "";
      }
    }
  }, [value, height]);

  return (
    <svg
      ref={svgRef}
      className="h-auto w-full"
      style={{ maxWidth: "100%", maxHeight: maxHeightPx }}
    />
  );
}
