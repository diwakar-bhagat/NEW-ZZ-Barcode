"use client";

import JsBarcode from "jsbarcode";
import { useEffect, useRef } from "react";

const detectBarcodeFormat = (value: string): string => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length === 13) {
    return "EAN13";
  }
  if (cleaned.length === 8) {
    return "EAN8";
  }
  if (cleaned.length === 12) {
    return "UPC";
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
    if (!svgRef.current || !value) {
      return;
    }
    try {
      const format = detectBarcodeFormat(value);
      const svg = svgRef.current;
      JsBarcode(svg, value, {
        format,
        displayValue: true,
        height,
        margin: 2,
        width: format === "EAN13" || format === "EAN8" || format === "UPC" ? 1.5 : 2,
        // Bold, larger human-readable number so it scans and reads clearly at
        // small physical sizes (was thin/light at fontSize 10).
        fontSize: 18,
        fontOptions: "bold",
        textAlign: "center",
        textPosition: "bottom",
        textMargin: 2,
        background: "transparent",
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
    } catch {
      svgRef.current.innerHTML = "";
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
