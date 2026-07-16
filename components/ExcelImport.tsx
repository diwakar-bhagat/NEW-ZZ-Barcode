"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/lib/editorStore";
import { computeGrid } from "@/lib/labelGrid";
import {
  formatBarcode,
  highestZzNumber,
  loadPersistedHighest,
  resetPersistedHighest,
  savePersistedHighest,
  seedSequence,
} from "@/lib/import/barcodeGenerator";
import { buildProducts, parseWorkbook } from "@/lib/import/importPipeline";

export default function ExcelImport() {
  const importProducts = useEditorStore((state) => state.importProducts);
  const layout = useEditorStore((state) => state.layout);
  const products = useEditorStore((state) => state.products);
  const [busy, setBusy] = useState(false);
  // Re-derived whenever products change or after an import (bump).
  const [bump, setBump] = useState(0);

  const nextNumber = useMemo(() => {
    void bump;
    const existingCodes = products.flatMap((product) => [product.barcode, product.sku]);
    return Math.max(loadPersistedHighest(), highestZzNumber(existingCodes)) + 1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, bump]);

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const records = await parseWorkbook(file);
      if (records.length === 0) {
        toast.error("The sheet looks empty. Expected a header row with at least a Name column.");
        return;
      }
      const existingCodes = products.flatMap((product) => [product.barcode, product.sku]);
      const sequence = seedSequence(existingCodes);
      const { products: items, totalCopies, generatedCount } = buildProducts(records, sequence);
      if (items.length === 0) {
        toast.error("No products found. Check that the sheet has a Name (or SKU) column.");
        return;
      }
      const grid = computeGrid(layout);
      importProducts(items, Math.max(1, grid.labelsPerPage));
      savePersistedHighest(sequence.last());
      setBump((value) => value + 1);
      toast.success(
        `Imported ${items.length} product${items.length === 1 ? "" : "s"} → ${totalCopies} label${
          totalCopies === 1 ? "" : "s"
        }${generatedCount > 0 ? ` · ${generatedCount} barcode${generatedCount === 1 ? "" : "s"} generated` : ""}.`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read the file.");
    } finally {
      setBusy(false);
    }
  };

  const onReset = () => {
    resetPersistedHighest();
    setBump((value) => value + 1);
    toast.success("Barcode counter reset.");
  };

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        Import from Excel
      </p>
      <p className="text-[11px] text-slate-500">
        Upload a sheet with a <span className="font-medium">Name</span> column (Qty, SKU, Price,
        Brand auto-detected). Quantity sets how many labels print; a barcode is generated only when
        no SKU is given.
      </p>
      <input
        type="file"
        accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleFile(file);
          }
          event.target.value = "";
        }}
        className="block w-full text-[11px] text-slate-500 file:mr-2 file:rounded-md file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-[11px] disabled:opacity-60"
      />
      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span>
          Next generated: <span className="font-mono">{formatBarcode(nextNumber)}</span>
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[11px]"
          disabled={busy || nextNumber <= 1}
          onClick={onReset}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
