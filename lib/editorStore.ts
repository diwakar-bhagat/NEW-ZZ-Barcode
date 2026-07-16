import { create } from "zustand";

import type { LayoutSettings } from "@/lib/labelGrid";

export type Product = {
  id: string;
  name: string;
  barcode: string;
  sku?: string;
  price?: number;
  /** Per-product brand override; the jewellery template falls back to layout.brandText. */
  brand?: string;
  source: "manual" | "odoo" | "import";
};

export type Cell = {
  id: string;
  productId: string | null;
};

export type Page = {
  id: string;
  cells: Cell[];
};

type EditorState = {
  layout: LayoutSettings;
  pagesToRender: number;
  pages: Page[];
  history: Page[][];
  future: Page[][];
  products: Product[];
  selectedCellIds: string[];
  activeProductId: string | null;
  lastSelectedCellId: string | null;
  setLayout: (layout: LayoutSettings) => void;
  setPagesToRender: (count: number) => void;
  syncPages: (labelsPerPage: number, pagesToRender?: number) => void;
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, patch: Partial<Omit<Product, "id" | "source">>) => void;
  importProducts: (
    items: {
      name: string;
      sku?: string;
      barcode: string;
      price?: number;
      brand?: string;
      copies: number;
    }[],
    labelsPerPage: number,
  ) => void;
  setActiveProductId: (productId: string | null) => void;
  setSelectedCellIds: (cellIds: string[]) => void;
  toggleCellSelection: (cellId: string, range?: string[]) => void;
  clearSelection: () => void;
  assignToSelected: (productId: string) => void;
  fillNextAvailable: (productId: string) => void;
  fillNextAvailableCount: (productId: string, count: number) => void;
  fillAllPages: (productId: string) => void;
  clearAll: () => void;
  clearSelected: () => void;
  removeProduct: (productId: string) => void;
  moveProductToCell: (cellId: string, productId: string) => void;
  swapCells: (fromCellId: string, toCellId: string) => void;
  clearCell: (cellId: string) => void;
  undo: () => void;
  redo: () => void;
};

const DEFAULT_LAYOUT: LayoutSettings = {
  paperWidthCm: 21.0,
  paperHeightCm: 29.7,
  marginCm: 1.0,
  labelWidthCm: 3.8,
  labelHeightCm: 2.12,
  gapXCm: 0,
  gapYCm: 0,
  barcodeHeightMm: 12,
  fontSizePt: 7,
  cellPaddingCm: 0.2,
  offsetXCm: 0,
  offsetYCm: 0,
  labelTemplate: "default",
  brandText: "ZenZebra",
};

const HISTORY_LIMIT = 30;

const createCells = (count: number, pageIndex: number, existing?: Cell[]) => {
  return Array.from({ length: count }).map((_, idx) => ({
    id: existing?.[idx]?.id ?? `page-${pageIndex}-cell-${idx}`,
    productId: existing?.[idx]?.productId ?? null,
  }));
};

const createPage = (pageIndex: number, labelCount: number, existing?: Page) => ({
  id: existing?.id ?? `page-${pageIndex}`,
  cells: createCells(labelCount, pageIndex, existing?.cells),
});

const clonePages = (pages: Page[]) =>
  pages.map((page) => ({
    ...page,
    cells: page.cells.map((cell) => ({ ...cell })),
  }));

const addHistorySnapshot = (history: Page[][], pages: Page[]) => {
  const snapshot = clonePages(pages);
  if (history.length < HISTORY_LIMIT) {
    return [...history, snapshot];
  }
  return [...history.slice(1), snapshot];
};

const toSet = (values: string[]) => new Set(values);

const findCell = (pages: Page[], cellId: string) => {
  for (const page of pages) {
    const index = page.cells.findIndex((cell) => cell.id === cellId);
    if (index !== -1) {
      return { page, cellIndex: index };
    }
  }
  return null;
};

export const useEditorStore = create<EditorState>((set) => ({
  layout: DEFAULT_LAYOUT,
  pagesToRender: 1,
  pages: [createPage(0, 0)],
  history: [],
  future: [],
  products: [],
  selectedCellIds: [],
  activeProductId: null,
  lastSelectedCellId: null,
  setLayout: (layout) => set({ layout }),
  setPagesToRender: (count) => set({ pagesToRender: Math.min(500, Math.max(1, count)) }),
  syncPages: (labelsPerPage, pagesToRender) => {
    set((state) => {
      const count = Math.max(1, pagesToRender ?? state.pagesToRender);
      const nextPages = Array.from({ length: count }).map((_, index) =>
        createPage(index, labelsPerPage, state.pages[index]),
      );
      return { pages: nextPages, pagesToRender: count, history: [], future: [] };
    });
  },
  addProduct: (product) =>
    set((state) => ({
      products: [product, ...state.products],
      activeProductId: product.id,
    })),
  updateProduct: (productId, patch) =>
    set((state) => ({
      products: state.products.map((product) =>
        product.id === productId ? { ...product, ...patch } : product,
      ),
    })),
  importProducts: (items, labelsPerPage) =>
    set((state) => {
      const perPage = Math.max(1, labelsPerPage);
      const stamp = Date.now();
      // One product identity per item — quantity only decides how many cells
      // reference it (copies), never how many products exist.
      const products: Product[] = items.map((item, index) => ({
        id: `import-${stamp}-${index}`,
        name: item.name,
        barcode: item.barcode,
        sku: item.sku,
        price: item.price,
        brand: item.brand,
        source: "import",
      }));
      // Expand copies into a flat queue of product ids, then lay them into
      // the existing page/cell grid.
      const queue: string[] = [];
      items.forEach((item, index) => {
        for (let copy = 0; copy < item.copies; copy += 1) {
          queue.push(products[index].id);
        }
      });
      const pagesNeeded = Math.max(1, Math.ceil(queue.length / perPage));
      let cursor = 0;
      const pages: Page[] = Array.from({ length: pagesNeeded }).map((_, pageIndex) => ({
        id: `page-${pageIndex}`,
        cells: Array.from({ length: perPage }).map((__, cellIndex) => ({
          id: `page-${pageIndex}-cell-${cellIndex}`,
          productId: cursor < queue.length ? queue[cursor++] : null,
        })),
      }));
      return {
        products: [...products, ...state.products],
        pages,
        pagesToRender: pagesNeeded,
        activeProductId: products[0]?.id ?? state.activeProductId,
        selectedCellIds: [],
        lastSelectedCellId: null,
        history: [],
        future: [],
      };
    }),
  setActiveProductId: (productId) => set({ activeProductId: productId }),
  setSelectedCellIds: (cellIds) =>
    set({ selectedCellIds: cellIds, lastSelectedCellId: cellIds.at(-1) ?? null }),
  toggleCellSelection: (cellId, range) =>
    set((state) => {
      if (range && range.length > 0) {
        return { selectedCellIds: range, lastSelectedCellId: cellId };
      }
      const isSelected = state.selectedCellIds.includes(cellId);
      const nextSelected = isSelected
        ? state.selectedCellIds.filter((id) => id !== cellId)
        : [...state.selectedCellIds, cellId];
      return { selectedCellIds: nextSelected, lastSelectedCellId: cellId };
    }),
  clearSelection: () => set({ selectedCellIds: [], lastSelectedCellId: null }),
  assignToSelected: (productId) =>
    set((state) => {
      if (state.selectedCellIds.length === 0) {
        return state;
      }
      const selectedSet = toSet(state.selectedCellIds);
      const updatedPages = state.pages.map((page) => ({
        ...page,
        cells: page.cells.map((cell) =>
          selectedSet.has(cell.id)
            ? { ...cell, productId }
            : cell,
        ),
      }));
      return {
        pages: updatedPages,
        history: addHistorySnapshot(state.history, state.pages),
        future: [],
      };
    }),
  fillNextAvailable: (productId) =>
    set((state) => {
      const updatedPages = state.pages.map((page) => ({ ...page }));
      for (const page of updatedPages) {
        const cellIndex = page.cells.findIndex((cell) => !cell.productId);
        if (cellIndex !== -1) {
          page.cells = page.cells.map((cell, idx) =>
            idx === cellIndex ? { ...cell, productId } : cell,
          );
          return {
            pages: updatedPages,
            history: addHistorySnapshot(state.history, state.pages),
            future: [],
          };
        }
      }
      return state;
    }),
  fillNextAvailableCount: (productId, count) =>
    set((state) => {
      if (count <= 0) {
        return state;
      }
      const updatedPages = state.pages.map((page) => ({ ...page }));
      let remaining = count;
      for (const page of updatedPages) {
        const cells = page.cells.map((cell) => ({ ...cell }));
        for (let idx = 0; idx < cells.length && remaining > 0; idx += 1) {
          if (!cells[idx]?.productId) {
            cells[idx] = { ...cells[idx], productId };
            remaining -= 1;
          }
        }
        page.cells = cells;
        if (remaining <= 0) {
          break;
        }
      }
      return {
        pages: updatedPages,
        history: addHistorySnapshot(state.history, state.pages),
        future: [],
      };
    }),
  fillAllPages: (productId) =>
    set((state) => {
      const updatedPages = state.pages.map((page) => ({
        ...page,
        cells: page.cells.map((cell) => ({ ...cell, productId })),
      }));
      return {
        pages: updatedPages,
        history: addHistorySnapshot(state.history, state.pages),
        future: [],
      };
    }),
  clearAll: () =>
    set((state) => {
      const updatedPages = state.pages.map((page) => ({
        ...page,
        cells: page.cells.map((cell) => ({ ...cell, productId: null })),
      }));
      return {
        pages: updatedPages,
        history: addHistorySnapshot(state.history, state.pages),
        future: [],
      };
    }),
  clearSelected: () =>
    set((state) => {
      if (state.selectedCellIds.length === 0) {
        return state;
      }
      const selectedSet = toSet(state.selectedCellIds);
      const updatedPages = state.pages.map((page) => ({
        ...page,
        cells: page.cells.map((cell) =>
          selectedSet.has(cell.id)
            ? { ...cell, productId: null }
            : cell,
        ),
      }));
      return {
        pages: updatedPages,
        history: addHistorySnapshot(state.history, state.pages),
        future: [],
      };
    }),
  removeProduct: (productId) =>
    set((state) => {
      const updatedPages = state.pages.map((page) => ({
        ...page,
        cells: page.cells.map((cell) =>
          cell.productId === productId ? { ...cell, productId: null } : cell,
        ),
      }));
      const nextProducts = state.products.filter((product) => product.id !== productId);
      return {
        products: nextProducts,
        pages: updatedPages,
        activeProductId: state.activeProductId === productId ? null : state.activeProductId,
        history: addHistorySnapshot(state.history, state.pages),
        future: [],
      };
    }),
  moveProductToCell: (cellId, productId) =>
    set((state) => {
      const located = findCell(state.pages, cellId);
      if (!located) {
        return state;
      }
      const { page, cellIndex } = located;
      const updatedPages = state.pages.map((existing) => {
        if (existing.id !== page.id) {
          return existing;
        }
        const cells = existing.cells.map((cell, idx) =>
          idx === cellIndex ? { ...cell, productId } : cell,
        );
        return { ...existing, cells };
      });
      return {
        pages: updatedPages,
        history: addHistorySnapshot(state.history, state.pages),
        future: [],
      };
    }),
  swapCells: (fromCellId, toCellId) =>
    set((state) => {
      const from = findCell(state.pages, fromCellId);
      const to = findCell(state.pages, toCellId);
      if (!from || !to) {
        return state;
      }
      const fromProduct = from.page.cells[from.cellIndex]?.productId ?? null;
      const toProduct = to.page.cells[to.cellIndex]?.productId ?? null;
      const updatedPages = state.pages.map((page) => {
        if (page.id !== from.page.id && page.id !== to.page.id) {
          return page;
        }
        const cells = page.cells.map((cell) => {
          if (cell.id === fromCellId) {
            return { ...cell, productId: toProduct };
          }
          if (cell.id === toCellId) {
            return { ...cell, productId: fromProduct };
          }
          return cell;
        });
        return { ...page, cells };
      });
      return {
        pages: updatedPages,
        history: addHistorySnapshot(state.history, state.pages),
        future: [],
      };
    }),
  clearCell: (cellId) =>
    set((state) => {
      const updatedPages = state.pages.map((page) => ({
        ...page,
        cells: page.cells.map((cell) =>
          cell.id === cellId ? { ...cell, productId: null } : cell,
        ),
      }));
      return {
        pages: updatedPages,
        history: addHistorySnapshot(state.history, state.pages),
        future: [],
      };
    }),
  undo: () =>
    set((state) => {
      if (state.history.length === 0) {
        return state;
      }
      const previous = state.history[state.history.length - 1];
      const nextHistory = state.history.slice(0, -1);
      return {
        pages: clonePages(previous),
        history: nextHistory,
        future: [clonePages(state.pages), ...state.future],
      };
    }),
  redo: () =>
    set((state) => {
      if (state.future.length === 0) {
        return state;
      }
      const next = state.future[0];
      const nextFuture = state.future.slice(1);
      return {
        pages: clonePages(next),
        history: addHistorySnapshot(state.history, state.pages),
        future: nextFuture,
      };
    }),
}));
