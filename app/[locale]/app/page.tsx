"use client";

import { useQuery } from "@tanstack/react-query";
import {
  memo,
  type MouseEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Github, Trash2 } from "lucide-react";
import { toast } from "sonner";

import BarcodeSvg from "@/components/BarcodeSvg";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PrintPageStyle from "@/components/PrintPageStyle";
import PrinterSelector from "@/components/PrinterSelector";
import ExcelImport from "@/components/ExcelImport";
import { getSavedPrinter } from "@/hooks/useQZ";
import { printRaw, QzError } from "@/services/qz";
import { generateTsplBatch, type TsplLabel } from "@/lib/tspl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  type Page,
  type Product,
  useEditorStore,
} from "@/lib/editorStore";
import { computeGrid, type LayoutSettings } from "@/lib/labelGrid";
import { trackPageView, trackStartPrint } from "@/lib/analytics";

type SearchResult = {
  id: number;
  name?: string;
  display_name?: string;
  barcode?: string;
  default_code?: string;
  list_price?: number;
};

const PRESET_LAYOUTS: { id: string; labelKey: string; values: Partial<LayoutSettings> }[] = [
  {
    id: "a4-4x13",
    labelKey: "layoutPresetA4_4x13",
    values: {
      paperWidthCm: 21,
      paperHeightCm: 29.7,
      marginCm: 1,
      labelWidthCm: 3.8,
      labelHeightCm: 2.12,
      gapXCm: 0,
      gapYCm: 0,
      cellPaddingCm: 0.2,
      offsetXCm: 0,
      offsetYCm: 0,
      barcodeHeightMm: 12,
      fontSizePt: 7,
      labelTemplate: "default",
    },
  },
  {
    id: "a4-3x8",
    labelKey: "layoutPresetA4_3x8",
    values: {
      paperWidthCm: 21,
      paperHeightCm: 29.7,
      marginCm: 1,
      labelWidthCm: 7,
      labelHeightCm: 3.5,
      gapXCm: 0,
      gapYCm: 0,
      barcodeHeightMm: 12,
      fontSizePt: 7,
      labelTemplate: "default",
    },
  },
  {
    id: "a4-2x7",
    labelKey: "layoutPresetA4_2x7",
    values: {
      paperWidthCm: 21,
      paperHeightCm: 29.7,
      marginCm: 1,
      labelWidthCm: 9.9,
      labelHeightCm: 3.8,
      gapXCm: 0,
      gapYCm: 0,
      barcodeHeightMm: 12,
      fontSizePt: 7,
      labelTemplate: "default",
    },
  },
  {
    id: "roll-jewellery-100x15",
    labelKey: "layoutPresetRollJewellery",
    values: {
      paperWidthCm: 10,
      paperHeightCm: 1.5,
      marginCm: 0,
      // 55mm printable body; the 45mm tail stays blank
      labelWidthCm: 5.5,
      labelHeightCm: 1.5,
      gapXCm: 0,
      gapYCm: 0,
      cellPaddingCm: 0.05,
      offsetXCm: 0,
      offsetYCm: 0,
      barcodeHeightMm: 6,
      fontSizePt: 5,
      labelTemplate: "jewellery-split",
      brandText: "ZenZebra",
    },
  },
];

const useDebouncedValue = (value: string, delayMs: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
};

export default function AppPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("App");
  const tCommon = useTranslations("Common");
  const isMobile = useIsMobile();
  const previewScale = isMobile ? 0.6 : 1;
  const logoSrc = "/brand/labbely-logo.png";
  
  const layout = useEditorStore((state) => state.layout);
  const pages = useEditorStore((state) => state.pages);
  const pagesToRender = useEditorStore((state) => state.pagesToRender);
  const products = useEditorStore((state) => state.products);
  const selectedCellIds = useEditorStore((state) => state.selectedCellIds);
  const activeProductId = useEditorStore((state) => state.activeProductId);
  const lastSelectedCellId = useEditorStore((state) => state.lastSelectedCellId);
  const setLayout = useEditorStore((state) => state.setLayout);
  const setPagesToRender = useEditorStore((state) => state.setPagesToRender);
  const syncPages = useEditorStore((state) => state.syncPages);
  const addProduct = useEditorStore((state) => state.addProduct);
  const setActiveProductId = useEditorStore((state) => state.setActiveProductId);
  const setSelectedCellIds = useEditorStore((state) => state.setSelectedCellIds);
  const toggleCellSelection = useEditorStore((state) => state.toggleCellSelection);
  const clearSelection = useEditorStore((state) => state.clearSelection);
  const clearSelected = useEditorStore((state) => state.clearSelected);
  const clearAll = useEditorStore((state) => state.clearAll);
  const removeProduct = useEditorStore((state) => state.removeProduct);
  const updateProduct = useEditorStore((state) => state.updateProduct);
  const assignToSelected = useEditorStore((state) => state.assignToSelected);
  const fillNextAvailable = useEditorStore((state) => state.fillNextAvailable);
  const fillNextAvailableCount = useEditorStore((state) => state.fillNextAvailableCount);
  const fillAllPages = useEditorStore((state) => state.fillAllPages);
  const clearCell = useEditorStore((state) => state.clearCell);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);

  const [manualName, setManualName] = useState("");
  const [manualBarcode, setManualBarcode] = useState("");
  const [manualSku, setManualSku] = useState("");
  const [manualError, setManualError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState<"odoo" | "manual">("manual");
  const [odooStatus, setOdooStatus] = useState<"checking" | "connected" | "disconnected">(
    "checking",
  );
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [hasAutoModeSync, setHasAutoModeSync] = useState(false);
  const [recentOdooResults, setRecentOdooResults] = useState<SearchResult[]>([]);
  const [showGuides, setShowGuides] = useState(false);
  const [showGuideBanner, setShowGuideBanner] = useState(false);
  const [layoutOpen, setLayoutOpen] = useState(true);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [showAllPages, setShowAllPages] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [mobileFillCount, setMobileFillCount] = useState("");
  const [dragSelectState, setDragSelectState] = useState<{
    active: boolean;
    pageIndex: number;
    startIndex: number;
    shouldSelect: boolean;
  } | null>(null);
  const longPressRef = useRef<{
    timer: number | null;
    startX: number;
    startY: number;
    pageIndex: number;
    cellIndex: number;
    cellId: string;
    shouldSelect: boolean;
    triggered: boolean;
  } | null>(null);

  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const grid = useMemo(() => computeGrid(layout), [layout]);
  const selectedCellCount = selectedCellIds.length;
  const barcodeHeightPx = useMemo(
    () => (layout.barcodeHeightMm ?? 12) * 3.78,
    [layout.barcodeHeightMm],
  );
  const barcodeMaxHeightPx = useMemo(() => {
    const labelHeightPx = layout.labelHeightCm * 37.8;
    const paddingPx = (layout.cellPaddingCm ?? 0) * 2 * 37.8;
    const nameLinePx = (layout.fontSizePt ?? 7) * 1.33 + 4;
    return Math.max(labelHeightPx - paddingPx - nameLinePx, 10);
  }, [layout.labelHeightCm, layout.cellPaddingCm, layout.fontSizePt]);
  const cellPaddingCm = layout.cellPaddingCm ?? 0;
  const offsetX = layout.offsetXCm ?? 0;
  const offsetY = layout.offsetYCm ?? 0;
  const selectedCellSet = useMemo(() => new Set(selectedCellIds), [selectedCellIds]);
  const activeProduct = useMemo(
    () => products.find((product) => product.id === activeProductId) ?? null,
    [activeProductId, products],
  );
  const productById = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((product) => map.set(product.id, product));
    return map;
  }, [products]);
  const pageIndexById = useMemo(() => {
    const indexById = new Map<string, number>();
    pages.forEach((page, index) => {
      indexById.set(page.id, index);
    });
    return indexById;
  }, [pages]);
  const pageCellIds = useMemo(() => {
    const map = new Map<number, string[]>();
    pages.forEach((page, index) => {
      map.set(index, page.cells.map((cell) => cell.id));
    });
    return map;
  }, [pages]);
  const cellLocations = useMemo(() => {
    const map = new Map<
      string,
      {
        pageIndex: number;
        cellIndex: number;
      }
    >();
    pages.forEach((page, pageIndex) => {
      for (let i = 0; i < page.cells.length; i += 1) {
        map.set(page.cells[i].id, {
          pageIndex,
          cellIndex: i,
        });
      }
    });
    return map;
  }, [pages]);

  useEffect(() => {
    syncPages(grid.labelsPerPage, pagesToRender);
  }, [grid.labelsPerPage, pagesToRender, syncPages]);

  useEffect(() => {
    let isActive = true;
    const checkSession = async () => {
      setOdooStatus("checking");
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "include",
        });
        if (!response.ok) {
          if (isActive) {
            setOdooStatus("disconnected");
          }
          return;
        }
        const payload = (await response.json()) as { authenticated?: boolean };
        if (isActive) {
          setOdooStatus(payload.authenticated ? "connected" : "disconnected");
        }
      } catch {
        if (isActive) {
          setOdooStatus("disconnected");
        }
      } finally {
        if (isActive) {
          setIsSessionLoading(false);
        }
      }
    };

    void checkSession();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (isSessionLoading || hasAutoModeSync) {
      return;
    }
    if (odooStatus === "connected") {
      setMode("odoo");
    }
    setHasAutoModeSync(true);
  }, [hasAutoModeSync, isSessionLoading, odooStatus]);

  useEffect(() => {
    setPreviewPage((current) => Math.min(Math.max(1, current), pagesToRender));
  }, [pagesToRender]);

  useEffect(() => {
    if (isMobile) {
      setShowAllPages(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (selectedCellCount === 0) {
      setPopoverOpen(false);
    }
  }, [selectedCellCount]);

  useEffect(() => {
    const path = `/${locale}/app`;
    trackPageView(locale, path, "view_app", {
      page_location: path,
      page_title: "Editor - Labbely",
    });
  }, [locale]);

  useEffect(() => {
    const handleMouseUp = () => {
      if (!isMobile) {
        setDragSelectState(null);
      }
    };
    const handlePointerUp = () => {
      if (isMobile) {
        setDragSelectState(null);
      }
      if (longPressRef.current?.timer) {
        window.clearTimeout(longPressRef.current.timer);
      }
      longPressRef.current = null;
    };
    const handlePointerMove = (event: globalThis.PointerEvent) => {
      if (!longPressRef.current || longPressRef.current.triggered) {
        return;
      }
      const dx = Math.abs(event.clientX - longPressRef.current.startX);
      const dy = Math.abs(event.clientY - longPressRef.current.startY);
      if (dx > 8 || dy > 8) {
        if (longPressRef.current.timer) {
          window.clearTimeout(longPressRef.current.timer);
        }
        longPressRef.current = null;
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          (target as HTMLElement).isContentEditable)
      ) {
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
        event.preventDefault();
        const allIds = pages.flatMap((page) => page.cells.map((cell) => cell.id));
        setSelectedCellIds(allIds);
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedCellIds.length > 0) {
          event.preventDefault();
          clearSelected();
        }
        return;
      }
      if (event.key === "Escape") {
        clearSelection();
        setDragSelectState(null);
      }
    };
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [clearSelection, clearSelected, isMobile, pages, redo, selectedCellIds.length, setSelectedCellIds, undo]);

  const handleCellPointerDown = (
    event: PointerEvent,
    pageIndex: number,
    cellIndex: number,
    cellId: string,
    isSelected: boolean
  ) => {
    if (!isMobile || event.pointerType === "mouse") {
      return;
    }
    if (longPressRef.current?.timer) {
      window.clearTimeout(longPressRef.current.timer);
    }
    const shouldSelect = !isSelected;
    const timer = window.setTimeout(() => {
      setDragSelectState({
        active: true,
        pageIndex,
        startIndex: cellIndex,
        shouldSelect,
      });
      toggleCellSelection(cellId);
      if (longPressRef.current) {
        longPressRef.current.triggered = true;
      }
    }, 220);
    longPressRef.current = {
      timer,
      startX: event.clientX,
      startY: event.clientY,
      pageIndex,
      cellIndex,
      cellId,
      shouldSelect,
      triggered: false,
    };
  };

  const handleCellPointerUp = (cellId: string) => {
    if (!isMobile) {
      return;
    }
    const current = longPressRef.current;
    if (current?.timer) {
      window.clearTimeout(current.timer);
    }
    if (current && !current.triggered) {
      toggleCellSelection(cellId);
    }
    longPressRef.current = null;
    setDragSelectState(null);
  };

  const fetchProducts = useCallback(
    async (query: string): Promise<SearchResult[]> => {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const errorCode = payload?.errorCode ?? payload?.error;
        if (errorCode === "rate_limited" || errorCode === "Rate limit exceeded") {
          throw new Error(t("searchRateLimit"));
        }
        if (errorCode === "unauthorized" || errorCode === "Unauthorized") {
          throw new Error(t("searchUnauthorized"));
        }
        throw new Error(t("searchError"));
      }
      return response.json();
    },
    [t],
  );

  const {
    data: searchResults = [],
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["products", debouncedSearch],
    queryFn: () => fetchProducts(debouncedSearch),
    enabled: debouncedSearch.length > 1,
    staleTime: 30_000,
  });

  const previewPages = useMemo(
    () =>
      showAllPages ? pages : pages.filter((_, index) => index === Math.max(0, previewPage - 1)),
    [pages, previewPage, showAllPages],
  );
  const assignedCounts = useMemo(() => {
    const map = new Map<string, number>();
    pages.forEach((page) => {
      page.cells.forEach((cell) => {
        if (!cell.productId) {
          return;
        }
        map.set(cell.productId, (map.get(cell.productId) ?? 0) + 1);
      });
    });

    return map;
  }, [pages]);

  const isDuplicateProduct = useCallback(
    (product: Product) =>
      products.some(
        (item) =>
          item.id === product.id ||
          (item.barcode && product.barcode && item.barcode === product.barcode),
      ),
    [products],
  );

  const addManualProduct = useCallback(() => {
    setManualError("");
    if (!manualName.trim() || !manualBarcode.trim()) {
      setManualError(t("manualRequired"));
      return;
    }
    if (!/^[\x20-\x7E]+$/.test(manualBarcode.trim())) {
      setManualError(t("manualBarcodeAscii"));
      return;
    }
    const newProduct: Product = {
      id: `manual-${Date.now()}`,
      name: manualName.trim(),
      barcode: manualBarcode.trim(),
      sku: manualSku.trim() || undefined,
      source: "manual",
    };
    if (isDuplicateProduct(newProduct)) {
      toast.info(t("productAlreadyAdded"));
      return;
    }
    addProduct(newProduct);
    toast.success(t("productAdded", { name: newProduct.name }));
    setManualName("");
    setManualBarcode("");
    setManualSku("");
  }, [addProduct, isDuplicateProduct, manualBarcode, manualName, manualSku, t]);

  const addOdooProduct = useCallback(
    (result: SearchResult) => {
      const displayName = result.display_name ?? result.name ?? t("unnamedProduct");
      const newProduct: Product = {
        id: `odoo-${result.id}`,
        name: displayName,
        barcode: result.barcode ?? "",
        sku: result.default_code ?? undefined,
        price: typeof result.list_price === "number" ? result.list_price : undefined,
        source: "odoo",
      };
      if (isDuplicateProduct(newProduct)) {
        toast.info(t("productAlreadyAdded"));
        return;
      }
      addProduct(newProduct);
      toast.success(t("productAdded", { name: newProduct.name }));
      setRecentOdooResults((current) => {
        const deduped = current.filter((item) => item.id !== result.id);
        return [result, ...deduped].slice(0, 5);
      });
    },
    [addProduct, isDuplicateProduct, t],
  );

  const addSampleProduct = useCallback(() => {
    const sampleProduct: Product = {
      id: `sample-${Date.now()}`,
      name: t("sampleProductName"),
      barcode: t("sampleProductBarcode"),
      sku: t("sampleProductSku"),
      source: "manual",
    };
    if (isDuplicateProduct(sampleProduct)) {
      toast.info(t("productAlreadyAdded"));
      return;
    }
    addProduct(sampleProduct);
    toast.success(t("productAdded", { name: sampleProduct.name }));
  }, [addProduct, isDuplicateProduct, t]);

  const handlePrint = useCallback(() => {
    // Roll printers emit one label per page, so long runs are normal there.
    const confirmThreshold = grid.labelsPerPage === 1 ? 100 : 3;
    if (pagesToRender > confirmThreshold) {
      const confirmed = window.confirm(t("printConfirm", { count: pagesToRender }));
      if (!confirmed) {
        return;
      }
    }
    trackStartPrint(locale, pagesToRender);
    window.print();
  }, [grid.labelsPerPage, locale, pagesToRender, t]);

  const [qzPrinting, setQzPrinting] = useState(false);

  const handleQzPrint = useCallback(async () => {
    const printer = getSavedPrinter();
    if (!printer) {
      toast.error(t("qzNoPrinter"));
      return;
    }
    // Collect filled cells in page/cell order → one TSPL label each.
    const labels: TsplLabel[] = [];
    for (const page of pages) {
      for (const cell of page.cells) {
        const product = cell.productId ? productById.get(cell.productId) : null;
        if (product) {
          labels.push({
            barcode: product.barcode,
            name: product.name,
            sku: product.sku,
            price: product.price,
            brand: product.brand ?? layout.brandText,
          });
        }
      }
    }
    if (labels.length === 0) {
      toast.error(t("qzNoLabels"));
      return;
    }
    setQzPrinting(true);
    const toastId = toast.loading(t("qzPrinting"));
    try {
      const tspl = generateTsplBatch(labels, {
        widthMm: layout.paperWidthCm * 10,
        heightMm: layout.paperHeightCm * 10,
      });
      await printRaw(printer, tspl);
      toast.success(t("qzPrintDone", { count: labels.length }), { id: toastId });
    } catch (error) {
      const message =
        error instanceof QzError || error instanceof Error ? error.message : String(error);
      toast.error(t("qzPrintFailed", { message }), { id: toastId });
    } finally {
      setQzPrinting(false);
    }
  }, [layout.brandText, layout.paperWidthCm, layout.paperHeightCm, pages, productById, t]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const seen = window.localStorage.getItem("labbely:guide");
    if (!seen) {
      setShowGuideBanner(true);
    }
  }, []);

  const dismissGuide = useCallback(() => {
    setShowGuideBanner(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("labbely:guide", "true");
    }
  }, []);

  const getRangeCellIds = useCallback(
    (pageIndex: number, startIndex: number, endIndex: number) => {
      const ids = pageCellIds.get(pageIndex);
      if (!ids) {
        return [];
      }
      const [start, end] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
      return ids.slice(start, end + 1);
    },
    [pageCellIds],
  );

  const handleCellMouseDown = useCallback(
    (
      event: MouseEvent,
      pageIndex: number,
      cellIndex: number,
      cellId: string,
    ) => {
      event.stopPropagation();
      if (isMobile) {
        const isSelected = selectedCellSet.has(cellId);
        if (isSelected) {
          setSelectedCellIds(selectedCellIds.filter((id) => id !== cellId));
        } else {
          setSelectedCellIds([cellId]);
        }
        setDragSelectState(null);
        return;
      }
      // No hacer nada si es clic derecho
      if (event.button === 2) {
        return;
      }
      if (event.shiftKey && lastSelectedCellId) {
        const startLocation = cellLocations.get(lastSelectedCellId);
        if (!startLocation || startLocation.pageIndex !== pageIndex) {
          toggleCellSelection(cellId);
          return;
        }
        const range = getRangeCellIds(pageIndex, startLocation.cellIndex, cellIndex);
        toggleCellSelection(cellId, range);
        return;
      }

      if (event.metaKey || event.ctrlKey) {
        toggleCellSelection(cellId);
        return;
      }

      const isInitiallySelected = selectedCellSet.has(cellId);
      if (isInitiallySelected) {
        setSelectedCellIds(selectedCellIds.filter((id) => id !== cellId));
      } else {
        toggleCellSelection(cellId, [cellId]);
      }
      setDragSelectState({
        active: true,
        pageIndex,
        startIndex: cellIndex,
        shouldSelect: !isInitiallySelected,
      });
    },
    [
      cellLocations,
      getRangeCellIds,
      isMobile,
      lastSelectedCellId,
      selectedCellIds,
      selectedCellSet,
      setDragSelectState,
      setSelectedCellIds,
      toggleCellSelection,
    ],
  );

  const handleCellMouseEnter = useCallback(
    (pageIndex: number, cellIndex: number) => {
      if (isMobile) {
        return;
      }
      if (!dragSelectState?.active || dragSelectState.pageIndex !== pageIndex) {
        return;
      }
      const range = getRangeCellIds(pageIndex, dragSelectState.startIndex, cellIndex);
      const rangeSet = new Set(range);
      if (dragSelectState.shouldSelect) {
        setSelectedCellIds(Array.from(new Set([...selectedCellIds, ...range])));
      } else {
        setSelectedCellIds(selectedCellIds.filter((id) => !rangeSet.has(id)));
      }
    },
    [dragSelectState, getRangeCellIds, isMobile, selectedCellIds, setSelectedCellIds],
  );

  const handleModeChange = useCallback(
    async (value: string) => {
      if (value === "odoo") {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "include",
        });
        if (!response.ok) {
          router.push(`/${locale}/login`);
          return;
        }
        const payload = (await response.json()) as { authenticated?: boolean };
        if (!payload.authenticated) {
          router.push(`/${locale}/login`);
          return;
        }
      }
      setMode(value as "odoo" | "manual");
    },
    [locale, router],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {isSessionLoading ? (
        <div className="fixed inset-0 z-[900] bg-white">
          <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
            <Image
              src="/brand/labbely-icon.png"
              alt="Labbely"
              width={56}
              height={56}
              className="h-14 w-14"
              priority
              sizes="56px"
            />
            <div className="space-y-2">
              <div className="mx-auto h-4 w-56 rounded-full bg-slate-200/90 animate-pulse" />
              <div className="mx-auto h-3 w-40 rounded-full bg-slate-100 animate-pulse" />
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Spinner className="h-4 w-4" />
              <span>{t("loading")}</span>
            </div>
          </div>
        </div>
      ) : null}
      <div
        className={`transition-opacity duration-150 ${isSessionLoading ? "opacity-0" : "opacity-100"}`}
      >
        <header className="no-print border-b border-slate-200 bg-white px-6 py-4 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-3">
            <Link href={`/${locale}`} aria-label="Labbely home">
              <Image
                src={logoSrc}
                alt="Labbely"
                width={200}
                height={48}
                className="h-8 w-auto"
                sizes="200px"
              />
            </Link>
            <div className="flex items-center gap-2 sm:hidden">
              <LanguageSwitcher />
              <a
                href="https://github.com/dani-mas/labbely"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-100"
                aria-label={tCommon("github")}
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="https://github.com/dani-mas/labbely"
                  target="_blank"
                  rel="noreferrer"
                  className="hidden h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-100 sm:inline-flex"
                  aria-label={tCommon("github")}
                >
                  <Github className="h-4 w-4" />
                </a>
              </TooltipTrigger>
              <TooltipContent>{tCommon("github")}</TooltipContent>
            </Tooltip>
            {isMobile ? (
              <>
                <div className="flex w-full items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                      >
                        {t("mobileProducts")}
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="max-h-[85vh] overflow-hidden">
                      <DrawerHeader>
                        <DrawerTitle>{t("mobileProducts")}</DrawerTitle>
                      </DrawerHeader>
                      <ScrollArea className="h-[65vh] px-4 pb-6">
                        <SidebarContent
                          mode={mode}
                          onModeChange={handleModeChange}
                          odooStatus={odooStatus}
                          locale={locale}
                          recentOdooResults={recentOdooResults}
                          searchQuery={searchQuery}
                          setSearchQuery={setSearchQuery}
                          isFetching={isFetching}
                          isError={isError}
                          error={error}
                          refetch={refetch}
                          searchResults={searchResults}
                          addOdooProduct={addOdooProduct}
                          manualName={manualName}
                          manualBarcode={manualBarcode}
                          manualSku={manualSku}
                          manualError={manualError}
                          setManualName={setManualName}
                          setManualBarcode={setManualBarcode}
                          setManualSku={setManualSku}
                          addManualProduct={addManualProduct}
                          addSampleProduct={addSampleProduct}
                          productById={productById}
                          activeProductId={activeProductId}
                          setActiveProductId={setActiveProductId}
                          fillNextAvailable={fillNextAvailable}
                          fillNextAvailableCount={fillNextAvailableCount}
                          fillAllPages={fillAllPages}
                          removeProduct={removeProduct}
                          updateProduct={updateProduct}
                          selectedCellCount={selectedCellCount}
                          popoverOpen={popoverOpen}
                          setPopoverOpen={setPopoverOpen}
                          assignToSelected={assignToSelected}
                          assignedCounts={assignedCounts}
                          isMobile={true}
                        />
                        <DrawerClose asChild>
                          <Button variant="outline" size="sm" className="mt-4 w-full">
                            {t("close")}
                          </Button>
                        </DrawerClose>
                      </ScrollArea>
                    </DrawerContent>
                  </Drawer>
                  <span className="mx-1 h-5 w-px bg-slate-200" />
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                      >
                        {t("layoutTitle")}
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="max-h-[85vh] overflow-hidden">
                      <DrawerHeader>
                        <DrawerTitle>{t("layoutTitle")}</DrawerTitle>
                      </DrawerHeader>
                      <ScrollArea className="h-[65vh] px-4 pb-6">
                        <LayoutPanel
                          layout={layout}
                          setLayout={setLayout}
                          pagesToRender={pagesToRender}
                          setPagesToRender={setPagesToRender}
                          selectedPresetId={selectedPresetId}
                          setSelectedPresetId={setSelectedPresetId}
                        />
                        <DrawerClose asChild>
                          <Button variant="outline" size="sm" className="mt-4 w-full">
                            {t("close")}
                          </Button>
                        </DrawerClose>
                      </ScrollArea>
                    </DrawerContent>
                  </Drawer>
                </div>
              </>
            ) : null}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <span className="mx-1 hidden h-5 w-px bg-slate-200 sm:inline-flex" />
            <div className="hidden items-center gap-1 sm:flex">
              <Button variant="ghost" size="sm" onClick={undo}>
                {t("undo")}
              </Button>
              <Button variant="ghost" size="sm" onClick={redo}>
                {t("redo")}
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                {t("clearAll")}
              </Button>
            </div>
            <span className="mx-1 hidden h-5 w-px bg-slate-200 sm:inline-flex" />
            {layout.labelTemplate === "jewellery-split" ? (
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
                disabled={qzPrinting}
                onClick={handleQzPrint}
              >
                {qzPrinting ? t("qzPrinting") : t("qzPrintDirect")}
              </Button>
            ) : null}
            <Button size="sm" className="hidden sm:inline-flex" onClick={handlePrint}>
              {t("printLabels")}
            </Button>
          </div>
        </div>
      </header>
      <main className="flex w-full max-w-none flex-col items-stretch gap-0 px-0 py-0 pb-20 lg:pb-0 lg:flex-row">
        <aside className="no-print order-1 hidden w-full lg:block lg:w-96 lg:shrink-0">
          <div className="flex h-full min-h-[calc(100vh-56px)] flex-col space-y-6 border-r border-slate-200 bg-white px-6 py-4">
                        <SidebarContent
                          mode={mode}
                          onModeChange={handleModeChange}
                          odooStatus={odooStatus}
                          locale={locale}
                      recentOdooResults={recentOdooResults}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isFetching={isFetching}
              isError={isError}
              error={error}
              refetch={refetch}
              searchResults={searchResults}
              addOdooProduct={addOdooProduct}
              manualName={manualName}
              manualBarcode={manualBarcode}
              manualSku={manualSku}
              manualError={manualError}
                          setManualName={setManualName}
                          setManualBarcode={setManualBarcode}
                          setManualSku={setManualSku}
                          addManualProduct={addManualProduct}
                          addSampleProduct={addSampleProduct}
                          productById={productById}
                          activeProductId={activeProductId}
              setActiveProductId={setActiveProductId}
              fillNextAvailable={fillNextAvailable}
              fillNextAvailableCount={fillNextAvailableCount}
              fillAllPages={fillAllPages}
              removeProduct={removeProduct}
              updateProduct={updateProduct}
              selectedCellCount={selectedCellCount}
              popoverOpen={popoverOpen}
              setPopoverOpen={setPopoverOpen}
              assignToSelected={assignToSelected}
              assignedCounts={assignedCounts}
              isMobile={isMobile}
            />
          </div>
        </aside>
        <section className="no-print order-2 flex-1 space-y-4 px-6 py-4">
          {showGuideBanner ? (
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{t("guideTitle")}</p>
                  <p className="text-xs text-slate-500">{t("guideDescription")}</p>
                </div>
                <Button variant="outline" size="sm" onClick={dismissGuide}>
                  {t("guideDismiss")}
                </Button>
              </div>
            </div>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                {t("preview")}
              </h2>
              <p className="text-xs text-slate-500">
                {t("gridSummary", {
                  columns: grid.columns,
                  rows: grid.rows,
                  labels: grid.labelsPerPage,
                })}
              </p>
            </div>
            <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center">
              {!isMobile ? (
                <span>
                  {t("layoutSummary", {
                    width: layout.paperWidthCm,
                    height: layout.paperHeightCm,
                  })}
                </span>
              ) : null}
              {!isMobile ? (
                <div className="flex items-center gap-2">
                  <span>{t("showGuides")}</span>
                  <Switch checked={showGuides} onCheckedChange={setShowGuides} />
                </div>
              ) : null}
              {!isMobile ? (
                <div className="flex items-center gap-2">
                  <span>{t("showAllPages")}</span>
                  <Switch checked={showAllPages} onCheckedChange={setShowAllPages} />
                </div>
              ) : null}
              {!showAllPages && !isMobile ? (
                <div className="min-w-[140px]">
                  <Select
                    value={String(previewPage)}
                    onValueChange={(value) => setPreviewPage(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("page")} />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: pagesToRender }).map((_, index) => (
                        <SelectItem key={index + 1} value={String(index + 1)}>
                          {t("page")} {index + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
            </div>
          </div>
          {isMobile ? (
            <div className="space-y-3 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm">
              <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {t("productsAdded")}
              </div>
              {products.length === 0 ? (
                <p className="text-xs text-slate-500">{t("productsAddedEmpty")}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {products.map((product) => (
                    <Button
                      key={product.id}
                      size="sm"
                      variant={activeProductId === product.id ? "default" : "outline"}
                      className="h-8"
                      onClick={() => setActiveProductId(product.id)}
                    >
                      {(product.name || t("unnamedProduct")).slice(0, 12)}
                    </Button>
                  ))}
                </div>
              )}
              {activeProductId ? (
                <div className="space-y-2 border-t border-slate-200 pt-3">
                  <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    {t("quickActions")}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        fillNextAvailableCount(
                          activeProductId,
                          Math.ceil(grid.labelsPerPage / 2)
                        )
                      }
                    >
                      {t("halfPage")} · {Math.ceil(grid.labelsPerPage / 2)}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fillNextAvailableCount(activeProductId, grid.labelsPerPage)}
                    >
                      {t("fullPage")} · {grid.labelsPerPage}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={grid.labelsPerPage}
                      value={mobileFillCount}
                      onChange={(event) => setMobileFillCount(event.target.value)}
                      placeholder={t("customQuantity")}
                      className="h-8 w-24 text-xs"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        const count = Number(mobileFillCount);
                        if (!Number.isNaN(count) && count > 0) {
                          fillNextAvailableCount(activeProductId, count);
                        }
                      }}
                    >
                      {t("applyQuantity")}
                    </Button>
                    <span className="text-xs text-slate-500">
                      {t("labelsCount", {
                        count: mobileFillCount ? Number(mobileFillCount) : 0,
                      })}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
          {!isMobile ? (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{t("hintClick")}</span>
              <Kbd>Shift</Kbd>
              <span>{t("hintRange")}</span>
              <Kbd>Ctrl</Kbd>
              <span>{t("hintToggle")}</span>
              <Kbd>Esc</Kbd>
              <span>{t("hintClear")}</span>
              <span className="text-slate-400">·</span>
              <span>{t("printHint")}</span>
            </div>
          ) : null}
          {selectedCellCount > 0 ? (
            <div className="hidden flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:flex">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-700">
                  {t("selectionCount", { count: selectedCellCount })}
                </span>
                {activeProduct ? (
                  <Badge variant="secondary" title={activeProduct.name}>
                    {t("activeProduct")} · {activeProduct.name}
                  </Badge>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => activeProductId && assignToSelected(activeProductId)}
                  disabled={!activeProductId}
                >
                  {t("assignActiveProduct")}
                </Button>
              </div>
            </div>
          ) : null}
          <div className="space-y-6">
            {previewPages.map((page) => {
              const pageIndex = pageIndexById.get(page.id) ?? 0;
              return (
              <div key={page.id} className="overflow-auto border border-slate-200 bg-white p-4 sm:p-6">
                <div
                  className="relative mx-auto"
                  style={{
                    width: `${layout.paperWidthCm * previewScale}cm`,
                    height: `${layout.paperHeightCm * previewScale}cm`,
                  }}
                >
                  <div
                    className="relative bg-white"
                    style={{
                      width: `${layout.paperWidthCm}cm`,
                      height: `${layout.paperHeightCm}cm`,
                      padding: `${layout.marginCm}cm`,
                      transform: `scale(${previewScale})`,
                      transformOrigin: "top left",
                      boxShadow: showGuides ? "inset 0 0 0 1px rgba(14, 94, 245, 0.25)" : undefined,
                    }}
                  >
                  <div
                    className="grid select-none"
                    onMouseDown={(event) => {
                      // No limpiar selección con clic derecho
                      if (event.button === 2) {
                        return;
                      }
                      if (event.target === event.currentTarget) {
                        clearSelection();
                      }
                    }}
                    style={{
                      columnGap: `${layout.gapXCm ?? 0}cm`,
                      rowGap: `${layout.gapYCm ?? 0}cm`,
                      gridTemplateColumns: `repeat(${grid.columns}, ${layout.labelWidthCm}cm)`,
                      gridAutoRows: `${layout.labelHeightCm}cm`,
                      transform: `translate(${offsetX}cm, ${offsetY}cm)`,
                    }}
                  >
                    {page.cells.map((cell, cellIndex) => {
                      const product = productById.get(cell.productId ?? "") ?? null;
                      const isSelected = selectedCellSet.has(cell.id);
                      return (
                        <LabelCell
                          key={cell.id}
                          labelIndex={cellIndex + 1}
                          product={product}
                          isSelected={isSelected}
                          activeProductId={activeProductId}
                          selectedCount={selectedCellCount}
                          onMouseDown={(event) =>
                            handleCellMouseDown(event, pageIndex, cellIndex, cell.id)
                          }
                          onMouseEnter={() => handleCellMouseEnter(pageIndex, cellIndex)}
                          onPointerDown={(event) =>
                            handleCellPointerDown(event, pageIndex, cellIndex, cell.id, isSelected)
                          }
                          onPointerEnter={() =>
                            isMobile && dragSelectState?.active
                              ? handleCellMouseEnter(pageIndex, cellIndex)
                              : null
                          }
                          onPointerUp={() => handleCellPointerUp(cell.id)}
                          onClear={() => clearCell(cell.id)}
                          onAssignSelected={() =>
                            activeProductId && assignToSelected(activeProductId)
                          }
                          onDuplicate={() =>
                            product?.id ? fillNextAvailable(product.id) : undefined
                          }
                          barcodeHeightPx={barcodeHeightPx}
                          barcodeMaxHeightPx={barcodeMaxHeightPx}
                          fontSizePt={layout.fontSizePt ?? 7}
                          paddingCm={cellPaddingCm}
                          labelTemplate={layout.labelTemplate}
                          brandText={layout.brandText}
                        />
                      );
                    })}
                  </div>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </section>
        <aside className="no-print order-3 hidden w-full lg:block lg:w-80 lg:shrink-0">
          <div className="flex h-full min-h-[calc(100vh-56px)] flex-col space-y-6 border-l border-slate-200 bg-white px-6 py-4">
            <Collapsible open={layoutOpen} onOpenChange={setLayoutOpen}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  {t("layoutTitle")}
                </h3>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={t("toggleLayout")}>
                    <ChevronDown className={`h-4 w-4 transition ${layoutOpen ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="pt-3">
                <LayoutPanel
                  layout={layout}
                  setLayout={setLayout}
                  pagesToRender={pagesToRender}
                  setPagesToRender={setPagesToRender}
                  selectedPresetId={selectedPresetId}
                  setSelectedPresetId={setSelectedPresetId}
                />
              </CollapsibleContent>
            </Collapsible>
          </div>
        </aside>
      </main>
      <div className="no-print lg:hidden fixed bottom-0 inset-x-0 border-t border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={clearAll}>
            {t("clearAll")}
          </Button>
          <Button
            size="sm"
            className="hidden flex-1 sm:inline-flex"
            onClick={() => activeProductId && assignToSelected(activeProductId)}
            disabled={!activeProductId || selectedCellCount === 0}
          >
            {t("assignActiveProduct")}
          </Button>
          {layout.labelTemplate === "jewellery-split" ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={qzPrinting}
              onClick={handleQzPrint}
            >
              {qzPrinting ? t("qzPrinting") : t("qzPrintDirect")}
            </Button>
          ) : null}
          <Button size="sm" className="flex-1" onClick={handlePrint}>
            {t("printLabels")}
          </Button>
        </div>
      </div>
      <PrintPageStyle layout={layout} />
      <PrintArea
        layout={layout}
        grid={grid}
        pages={pages}
        productById={productById}
        barcodeHeightPx={barcodeHeightPx}
        barcodeMaxHeightPx={barcodeMaxHeightPx}
        paddingCm={cellPaddingCm}
      />
      <div className="no-print mx-auto max-w-[1600px] px-6 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2">
            <span>{t("selectedLabels")}</span>
            <Badge variant="brand">{selectedCellCount}</Badge>
            <span>{t("activeProduct")}</span>
            <span className="font-semibold text-slate-800">
              {activeProduct ? activeProduct.name : t("none")}
            </span>
            <span className="text-slate-300">•</span>
            <span>{t("selectionHint")}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span>{t("shortcutsTitle")}</span>
            <Kbd>Shift</Kbd>
            <span>{t("shortcutRange")}</span>
            <Kbd>Ctrl</Kbd>
            <span>{t("shortcutToggle")}</span>
            <Kbd>Esc</Kbd>
            <span>{t("shortcutClear")}</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

const ProductCard = memo(function ProductCard({
  product,
  active,
  assignedCount,
  onSelect,
  onFillNext,
  onFillMany,
  onFillAll,
  onRemove,
  onPriceChange,
}: {
  product: Product;
  active: boolean;
  assignedCount: number;
  onSelect: () => void;
  onFillNext: () => void;
  onFillMany: (count: number) => void;
  onFillAll: () => void;
  onRemove: () => void;
  onPriceChange: (price: number | undefined) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const t = useTranslations("App");

  return (
    <div
      className={`relative rounded-lg border px-3 py-2 text-xs select-none transition-colors hover:border-primary/30 ${
        active ? "border-primary/40 bg-primary/5" : "border-slate-200"
      }`}
      onClick={onSelect}
      onKeyDown={(event) => event.key === "Enter" && onSelect()}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-8 w-8 text-slate-400 hover:text-rose-600"
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
        aria-label={t("removeProduct")}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-slate-800 truncate">{product.name}</p>
        <Badge variant="secondary" title={t("assignedCount", { count: assignedCount })}>
          {assignedCount}
        </Badge>
      </div>
      <p className="text-slate-500 text-[10px] font-mono">
        {t("barcodeLabel")} {product.barcode || t("notAvailable")}
      </p>
      <div
        className="mt-1 flex items-center gap-1"
        onClick={(event) => event.stopPropagation()}
      >
        <Label htmlFor={`price-${product.id}`} className="text-[10px] text-slate-500">
          {t("sellingPrice")} ₹
        </Label>
        <Input
          id={`price-${product.id}`}
          type="number"
          min={0}
          step="0.01"
          value={product.price ?? ""}
          placeholder="0"
          className="h-7 w-24 text-[11px]"
          onChange={(event) => {
            const raw = event.target.value;
            const parsed = Number(raw);
            onPriceChange(raw === "" || !Number.isFinite(parsed) ? undefined : parsed);
          }}
        />
      </div>
      <div className="mt-2 space-y-2">
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-[10px] h-9"
                onClick={(event) => {
                  event.stopPropagation();
                  onFillNext();
                }}
              >
                {t("fillNext")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("fillNextHint")}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-[10px] h-9"
                onClick={(event) => {
                  event.stopPropagation();
                  onFillAll();
                }}
              >
                {t("fillAllPages")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("fillAllHint")}</TooltipContent>
          </Tooltip>
        </div>
        <div className="flex gap-2">
          <Input
            className="h-9 w-16 text-[10px]"
            type="number"
            min={1}
            value={quantity}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => setQuantity(Number(event.target.value) || 1)}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-[10px] h-9"
                onClick={(event) => {
                  event.stopPropagation();
                  const safeQty = Number.isFinite(quantity) ? Math.max(1, quantity) : 1;
                  onFillMany(safeQty);
                }}
              >
                {t("fillCount", { count: quantity })}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("fillCountHint")}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
});

type SidebarContentProps = {
  mode: "odoo" | "manual";
  onModeChange: (value: string) => void;
  odooStatus: "checking" | "connected" | "disconnected";
  locale: string;
  recentOdooResults: SearchResult[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
  searchResults: SearchResult[];
  addOdooProduct: (result: SearchResult) => void;
  manualName: string;
  manualBarcode: string;
  manualSku: string;
  manualError: string;
  setManualName: (value: string) => void;
  setManualBarcode: (value: string) => void;
  setManualSku: (value: string) => void;
  addManualProduct: () => void;
  addSampleProduct: () => void;
  productById: Map<string, Product>;
  assignedCounts: Map<string, number>;
  activeProductId: string | null;
  setActiveProductId: (value: string | null) => void;
  fillNextAvailable: (productId: string) => void;
  fillNextAvailableCount: (productId: string, count: number) => void;
  fillAllPages: (productId: string) => void;
  removeProduct: (productId: string) => void;
  updateProduct: (productId: string, patch: Partial<Omit<Product, "id" | "source">>) => void;
  selectedCellCount: number;
  popoverOpen: boolean;
  setPopoverOpen: (value: boolean) => void;
  assignToSelected: (productId: string) => void;
  isMobile: boolean;
};

const SidebarContent = memo(function SidebarContent({
  mode,
  onModeChange,
  odooStatus,
  locale,
  recentOdooResults,
  searchQuery,
  setSearchQuery,
  isFetching,
  isError,
  error,
  refetch,
  searchResults,
  addOdooProduct,
  manualName,
  manualBarcode,
  manualSku,
  manualError,
  setManualName,
  setManualBarcode,
  setManualSku,
  addManualProduct,
  addSampleProduct,
  productById,
  assignedCounts,
  activeProductId,
  setActiveProductId,
  fillNextAvailable,
  fillNextAvailableCount,
  fillAllPages,
  removeProduct,
  updateProduct,
  selectedCellCount,
  popoverOpen,
  setPopoverOpen,
  assignToSelected,
  isMobile,
}: SidebarContentProps) {
  const t = useTranslations("App");
  const products = useMemo(() => Array.from(productById.values()), [productById]);

  return (
    <>
      <Tabs value={mode} onValueChange={onModeChange}>
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("mode")}
          </h2>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="odoo" className="cursor-pointer">
              {t("modeOdoo")}
            </TabsTrigger>
            <TabsTrigger value="manual" className="cursor-pointer">
              {t("modeManual")}
            </TabsTrigger>
          </TabsList>
          <p className="text-xs text-muted-foreground">
            {mode === "odoo" ? t("modeOdooHelp") : t("modeManualHelp")}
          </p>
        </div>
        <TabsContent value="odoo" className="mt-4 space-y-2">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-2 text-xs">
              <span className="text-slate-600">{t("odooConnection")}</span>
              <div className="flex items-center gap-2">
                <Badge variant={odooStatus === "connected" ? "brand" : "secondary"}>
                  {odooStatus === "connected"
                    ? t("odooStatusConnected")
                    : odooStatus === "checking"
                      ? t("odooStatusChecking")
                      : t("odooStatusDisconnected")}
                </Badge>
                {odooStatus === "disconnected" ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/${locale}/login`}>{t("odooLoginCta")}</Link>
                  </Button>
                ) : null}
              </div>
            </div>
            {odooStatus === "disconnected" ? (
              <p className="text-xs text-muted-foreground">{t("odooLoginHelp")}</p>
            ) : null}
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("searchTitle")}
            </div>
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("searchPlaceholder")}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {t("results")} <Badge variant="secondary">{searchResults.length}</Badge>
              </span>
              {isFetching ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  {t("searching")}
                </span>
              ) : null}
            </div>
            <ScrollArea className="h-56 rounded-md border">
              <div className="space-y-2 p-2">
                {searchQuery.trim().length <= 1 ? (
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>{t("searchHintMinChars")}</p>
                    {recentOdooResults.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                          {t("recentProducts")}
                        </p>
                        {recentOdooResults.map((result) => (
                          <div
                            key={result.id}
                            className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-2 py-2 hover:bg-slate-50"
                          >
                            <div>
                              <p className="text-xs font-semibold text-slate-700">
                                {result.display_name ?? result.name ?? t("unnamedProduct")}
                              </p>
                              <p className="text-[11px] font-mono text-muted-foreground">
                                {result.barcode || t("noBarcode")}
                              </p>
                            </div>
                            <Button size="sm" variant="secondary" onClick={() => addOdooProduct(result)}>
                              {t("addProduct")}
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : isError ? (
                  <div className="space-y-2 text-xs text-destructive">
                    <p>{(error as Error)?.message ?? t("searchError")}</p>
                    <Button size="sm" variant="outline" onClick={() => refetch()}>
                      {t("searchRetry")}
                    </Button>
                  </div>
                ) : isFetching && searchResults.length === 0 ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={`skeleton-${index}`}
                        className="h-12 rounded-md border border-slate-200 bg-slate-50 animate-pulse"
                      />
                    ))}
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>{t("searchEmpty")}</p>
                    <p>{t("searchEmptyHint")}</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-[1fr_auto] gap-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      <span>{t("searchHeaderName")}</span>
                      <span>{t("searchHeaderCode")}</span>
                    </div>
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-2 py-2 hover:bg-slate-50"
                      >
                        <div>
                          <p className="text-xs font-semibold">
                            {result.display_name ?? result.name ?? t("unnamedProduct")}
                          </p>
                          <p className="text-[11px] font-mono text-muted-foreground">
                            {result.barcode || t("noBarcode")} ·{" "}
                            {result.default_code || t("noSku")}
                          </p>
                        </div>
                        <Button size="sm" variant="secondary" onClick={() => addOdooProduct(result)}>
                          {t("addProduct")}
                        </Button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
        <TabsContent value="manual" className="mt-4 space-y-2">
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("manualTitle")}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("manualHelp")}
            </p>
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="manual-name">{t("manualName")}</Label>
              <Input
                id="manual-name"
                value={manualName}
                onChange={(event) => setManualName(event.target.value)}
                placeholder={t("manualNamePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-barcode">{t("manualBarcode")}</Label>
              <Input
                id="manual-barcode"
                value={manualBarcode}
                onChange={(event) => setManualBarcode(event.target.value)}
                placeholder={t("manualBarcodePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-sku">{t("manualSkuOptional")}</Label>
              <Input
                id="manual-sku"
                value={manualSku}
                onChange={(event) => setManualSku(event.target.value)}
                placeholder={t("manualSkuPlaceholder")}
              />
            </div>
            <Button onClick={addManualProduct}>{t("addManual")}</Button>
            {manualError ? <p className="text-xs text-destructive">{manualError}</p> : null}
          </div>
        </TabsContent>
      </Tabs>
      <ExcelImport />
      {!isMobile ? (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            {t("products")}
          </h3>
          <div className="space-y-2">
            {products.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">{t("productsEmptyTitle")}</p>
                <p className="mt-1 text-slate-500">{t("productsEmptyHelp")}</p>
                <Button variant="outline" size="sm" className="mt-3 w-full" onClick={addSampleProduct}>
                  {t("productsEmptyCta")}
                </Button>
              </div>
            ) : (
              products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  active={product.id === activeProductId}
                  assignedCount={assignedCounts.get(product.id) ?? 0}
                  onSelect={() => setActiveProductId(product.id)}
                  onFillNext={() => fillNextAvailable(product.id)}
                  onFillMany={(count) => fillNextAvailableCount(product.id, count)}
                  onFillAll={() => fillAllPages(product.id)}
                  onRemove={() => removeProduct(product.id)}
                  onPriceChange={(price) => updateProduct(product.id, { price })}
                />
              ))
            )}
          </div>
        </div>
      ) : null}
      {!isMobile && selectedCellCount > 0 && products.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              {t("assignToSelected")}
            </h3>
                <Badge variant="brand">{selectedCellCount}</Badge>
          </div>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="default" size="sm" className="w-full">
                {t("assignSelectProduct")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="start">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  {t("assignToCount", { count: selectedCellCount })}
                </p>
                <ScrollArea className="h-48">
                  <div className="space-y-1">
                    {products.map((product) => (
                      <Button
                        key={product.id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left h-auto py-2 px-2 hover:bg-slate-100"
                        onClick={() => {
                          assignToSelected(product.id);
                          setPopoverOpen(false);
                        }}
                      >
                        <div className="flex flex-col items-start w-full">
                          <span className="text-xs font-semibold text-slate-800 truncate w-full">
                            {product.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {product.barcode || t("noBarcode")}
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      ) : null}
    </>
  );
});

type LayoutPanelProps = {
  layout: LayoutSettings;
  setLayout: (layout: LayoutSettings) => void;
  pagesToRender: number;
  setPagesToRender: (count: number) => void;
  selectedPresetId: string | null;
  setSelectedPresetId: (value: string | null) => void;
};

const LayoutPanel = memo(function LayoutPanel({
  layout,
  setLayout,
  pagesToRender,
  setPagesToRender,
  selectedPresetId,
  setSelectedPresetId,
}: LayoutPanelProps) {
  const t = useTranslations("App");
  const activePreset = selectedPresetId
    ? PRESET_LAYOUTS.find((item) => item.id === selectedPresetId)
    : null;

  return (
    <div className="space-y-4 text-xs">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>{t("layoutPresets")}</Label>
          <Button
            variant="ghost"
            size="sm"
            disabled={!activePreset}
            onClick={() => {
              if (activePreset) {
                setLayout({ ...layout, ...activePreset.values });
              }
            }}
          >
            {t("resetPreset")}
          </Button>
        </div>
        <Select
          value={selectedPresetId ?? ""}
          onValueChange={(value) => {
            const preset = PRESET_LAYOUTS.find((item) => item.id === value);
            if (preset) {
              setSelectedPresetId(preset.id);
              setLayout({ ...layout, ...preset.values });
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("layoutPresetPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {PRESET_LAYOUTS.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                <div className="flex w-full items-center justify-between gap-2">
                  <span>{t(preset.labelKey)}</span>
                  {preset.id === "a4-4x13" ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {t("recommended")}
                    </span>
                  ) : null}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {layout.labelTemplate === "jewellery-split" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="brand-text">{t("brandText")}</Label>
            <Input
              id="brand-text"
              value={layout.brandText ?? ""}
              placeholder="ZenZebra"
              onChange={(event) => setLayout({ ...layout, brandText: event.target.value })}
            />
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <PrinterSelector />
          </div>
        </>
      ) : null}

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          {t("layoutSectionPaper")}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="paper-width">{t("layoutPaperWidth")} (cm)</Label>
            <Input
              id="paper-width"
              type="number"
              step="0.1"
              value={layout.paperWidthCm}
              onChange={(event) => setLayout({ ...layout, paperWidthCm: Number(event.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paper-height">{t("layoutPaperHeight")} (cm)</Label>
            <Input
              id="paper-height"
              type="number"
              step="0.1"
              value={layout.paperHeightCm}
              onChange={(event) => setLayout({ ...layout, paperHeightCm: Number(event.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="margin">{t("layoutMargin")} (cm)</Label>
            <Input
              id="margin"
              type="number"
              step="0.1"
              value={layout.marginCm}
              onChange={(event) => setLayout({ ...layout, marginCm: Number(event.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          {t("layoutSectionLabel")}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="label-width">{t("layoutLabelWidth")} (cm)</Label>
            <Input
              id="label-width"
              type="number"
              step="0.1"
              value={layout.labelWidthCm}
              onChange={(event) => setLayout({ ...layout, labelWidthCm: Number(event.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="label-height">{t("layoutLabelHeight")} (cm)</Label>
            <Input
              id="label-height"
              type="number"
              step="0.1"
              value={layout.labelHeightCm}
              onChange={(event) => setLayout({ ...layout, labelHeightCm: Number(event.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cell-padding">{t("layoutPadding")} (cm)</Label>
            <Input
              id="cell-padding"
              type="number"
              step="0.05"
              value={layout.cellPaddingCm ?? 0}
              onChange={(event) =>
                setLayout({ ...layout, cellPaddingCm: Number(event.target.value) })
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          {t("layoutSectionGaps")}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="gap-x">{t("layoutGapX")} (cm)</Label>
            <Input
              id="gap-x"
              type="number"
              step="0.1"
              value={layout.gapXCm ?? 0}
              onChange={(event) => setLayout({ ...layout, gapXCm: Number(event.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gap-y">{t("layoutGapY")} (cm)</Label>
            <Input
              id="gap-y"
              type="number"
              step="0.1"
              value={layout.gapYCm ?? 0}
              onChange={(event) => setLayout({ ...layout, gapYCm: Number(event.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          {t("layoutSectionOffsets")}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="offset-x">{t("layoutOffsetX")} (cm)</Label>
            <Input
              id="offset-x"
              type="number"
              step="0.05"
              value={layout.offsetXCm ?? 0}
              onChange={(event) => setLayout({ ...layout, offsetXCm: Number(event.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="offset-y">{t("layoutOffsetY")} (cm)</Label>
            <Input
              id="offset-y"
              type="number"
              step="0.05"
              value={layout.offsetYCm ?? 0}
              onChange={(event) => setLayout({ ...layout, offsetYCm: Number(event.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          {t("layoutSectionText")}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="barcode-height">{t("layoutBarcodeHeight")} (mm)</Label>
            <Input
              id="barcode-height"
              type="number"
              step="1"
              value={layout.barcodeHeightMm ?? 12}
              onChange={(event) =>
                setLayout({ ...layout, barcodeHeightMm: Number(event.target.value) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="font-size">{t("layoutFontSize")} (pt)</Label>
            <Input
              id="font-size"
              type="number"
              step="0.5"
              value={layout.fontSizePt ?? 7}
              onChange={(event) => setLayout({ ...layout, fontSizePt: Number(event.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          {t("layoutSectionPages")}
        </p>
        <Input
          id="pages"
          type="number"
          min={1}
          value={pagesToRender}
          onChange={(event) => setPagesToRender(Number(event.target.value))}
        />
      </div>
    </div>
  );
});

const formatPrice = (price: number) =>
  Number.isInteger(price) ? String(price) : price.toFixed(2);

function JewellerySplitContent({
  product,
  barcodeHeightPx,
  barcodeMaxHeightPx,
  fontSizePt,
  brandText,
}: {
  product: Product;
  barcodeHeightPx: number;
  barcodeMaxHeightPx: number;
  fontSizePt: number;
  brandText: string;
}) {
  return (
    <div className="flex h-full w-full items-stretch">
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center overflow-hidden">
        <BarcodeSvg
          value={product.barcode}
          height={barcodeHeightPx}
          maxHeightPx={barcodeMaxHeightPx}
        />
        <p
          className="w-full truncate text-center text-slate-900"
          style={{ fontSize: `${fontSizePt}pt`, lineHeight: 1.2 }}
        >
          {product.sku ? `${product.sku} ${product.name}` : product.name}
        </p>
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-start justify-center overflow-hidden pl-1 text-left">
        <p
          className="w-full truncate font-bold text-slate-900"
          style={{ fontSize: `${fontSizePt * 1.5}pt`, lineHeight: 1.3 }}
        >
          {product.brand ?? brandText}
        </p>
        {product.price != null ? (
          <p
            className="w-full truncate text-slate-900"
            style={{ fontSize: `${fontSizePt * 1.3}pt`, lineHeight: 1.3 }}
          >
            {`SP = ₹${formatPrice(product.price)}`}
          </p>
        ) : null}
      </div>
    </div>
  );
}

const LabelCell = memo(function LabelCell({
  labelIndex,
  product,
  isSelected,
  activeProductId,
  selectedCount,
  onMouseDown,
  onMouseEnter,
  onPointerDown,
  onPointerEnter,
  onPointerUp,
  onClear,
  onAssignSelected,
  onDuplicate,
  barcodeHeightPx,
  barcodeMaxHeightPx,
  fontSizePt,
  paddingCm,
  labelTemplate,
  brandText,
}: {
  labelIndex: number;
  product: Product | null;
  isSelected: boolean;
  activeProductId: string | null;
  selectedCount: number;
  onMouseDown: (event: MouseEvent) => void;
  onMouseEnter: () => void;
  onPointerDown: (event: PointerEvent) => void;
  onPointerEnter: () => void;
  onPointerUp: () => void;
  onClear: () => void;
  onAssignSelected: () => void;
  onDuplicate: () => void;
  barcodeHeightPx: number;
  barcodeMaxHeightPx: number;
  fontSizePt: number;
  paddingCm: number;
  labelTemplate?: "default" | "jewellery-split";
  brandText?: string;
}) {
  const t = useTranslations("App");

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={`group relative flex h-full flex-col items-center justify-center border p-1 text-center select-none transition-colors hover:border-primary/30 ${
        isSelected ? "border-primary/50 bg-primary/10" : "border-slate-200"
      }`}
          onMouseDown={onMouseDown}
          onMouseEnter={onMouseEnter}
          onPointerDown={onPointerDown}
          onPointerEnter={onPointerEnter}
          onPointerUp={onPointerUp}
          style={{ padding: `${paddingCm}cm`, boxSizing: "border-box" }}
        >
          <span className="pointer-events-none absolute left-1 top-1 rounded bg-white/80 px-1 text-[9px] text-slate-400 opacity-0 transition group-hover:opacity-100">
            {labelIndex}
          </span>
          {product ? (
            <div
              className="flex w-full flex-col items-center"
            >
              {labelTemplate === "jewellery-split" ? (
                <JewellerySplitContent
                  product={product}
                  barcodeHeightPx={barcodeHeightPx}
                  barcodeMaxHeightPx={barcodeMaxHeightPx}
                  fontSizePt={fontSizePt}
                  brandText={brandText ?? "ZenZebra"}
                />
              ) : (
                <>
                  <BarcodeSvg
                    value={product.barcode}
                    height={barcodeHeightPx}
                    maxHeightPx={barcodeMaxHeightPx}
                  />
                  <p
                    className="mt-1 w-full truncate text-slate-700"
                    style={{ fontSize: `${fontSizePt}pt` }}
                  >
                    {product.name}
                  </p>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 hidden h-auto px-2 py-0 text-[9px] text-slate-400 group-hover:inline"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  onClear();
                }}
              >
                {t("clear")}
              </Button>
            </div>
          ) : (
            <span className="text-[9px] text-slate-300">{t("emptyCell")}</span>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onClear}>{t("clearCell")}</ContextMenuItem>
        <ContextMenuItem onClick={onDuplicate} disabled={!product}>
          {t("duplicateNextEmpty")}
        </ContextMenuItem>
        <ContextMenuItem onClick={onAssignSelected} disabled={!activeProductId || selectedCount === 0}>
          {t("fillSelectionWithActive")}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
});

const PrintArea = memo(function PrintArea({
  layout,
  grid,
  pages,
  productById,
  barcodeHeightPx,
  barcodeMaxHeightPx,
  paddingCm,
}: {
  layout: LayoutSettings;
  grid: ReturnType<typeof computeGrid>;
  pages: Page[];
  productById: Map<string, Product>;
  barcodeHeightPx: number;
  barcodeMaxHeightPx: number;
  paddingCm: number;
}) {
  return (
    <div className="print-only">
      {pages.map((page) => (
        <div
          key={page.id}
          className="print-page"
          style={{
            width: `${layout.paperWidthCm}cm`,
            height: `${layout.paperHeightCm}cm`,
            padding: `${layout.marginCm}cm`,
            boxSizing: "border-box",
          }}
        >
          <div
            className="grid"
            style={{
              columnGap: `${layout.gapXCm ?? 0}cm`,
              rowGap: `${layout.gapYCm ?? 0}cm`,
              gridTemplateColumns: `repeat(${grid.columns}, ${layout.labelWidthCm}cm)`,
              gridAutoRows: `${layout.labelHeightCm}cm`,
              transform: `translate(${layout.offsetXCm ?? 0}cm, ${layout.offsetYCm ?? 0}cm)`,
            }}
          >
            {page.cells.map((cell) => {
              const product = productById.get(cell.productId ?? "") ?? null;
              return (
                <div
                  key={cell.id}
                  className="flex h-full flex-col items-center justify-center text-center"
                  style={{ padding: `${paddingCm}cm`, boxSizing: "border-box" }}
                >
                  {product ? (
                    layout.labelTemplate === "jewellery-split" ? (
                      <JewellerySplitContent
                        product={product}
                        barcodeHeightPx={barcodeHeightPx}
                        barcodeMaxHeightPx={barcodeMaxHeightPx}
                        fontSizePt={layout.fontSizePt ?? 7}
                        brandText={layout.brandText ?? "ZenZebra"}
                      />
                    ) : (
                      <>
                        <BarcodeSvg
                          value={product.barcode}
                          height={barcodeHeightPx}
                          maxHeightPx={barcodeMaxHeightPx}
                        />
                        <p
                          className="mt-1 w-full truncate text-slate-700"
                          style={{ fontSize: `${layout.fontSizePt ?? 7}pt` }}
                        >
                          {product.name}
                        </p>
                      </>
                    )
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
});
