// Barcode sequence service.
//
// This is the ONLY place that knows how generated identities are formed.
// The importer asks the sequence to `reserve()` a code; it never computes
// barcodes itself. That keeps a future migration (UUID / DB sequence / Odoo
// sequence) isolated to this file.
//
// Format: ZZ + 7-digit zero-padded number (ZZ0000001 … ZZ9999999, then it
// grows). Uniqueness is guaranteed by always continuing from the highest
// number already issued — persisted in localStorage AND re-derived from the
// codes already present in the editor, so clearing storage cannot cause a
// collision.

const PAD = 7;
const HIGHEST_KEY = "labbely:barcodeHighest";
const ZZ_PATTERN = /^ZZ(\d+)$/;

export const formatBarcode = (n: number): string =>
  `ZZ${Math.max(1, Math.floor(n)).toString().padStart(PAD, "0")}`;

/** Numeric part of a ZZ code, or null if the value is not a ZZ code. */
export const extractZzNumber = (value: string | undefined | null): number | null => {
  if (!value) {
    return null;
  }
  const match = ZZ_PATTERN.exec(value.trim());
  if (!match) {
    return null;
  }
  const n = Number.parseInt(match[1], 10);
  return Number.isFinite(n) ? n : null;
};

/** Highest ZZ number among a set of codes (0 if none). */
export const highestZzNumber = (codes: (string | undefined | null)[]): number => {
  let highest = 0;
  for (const code of codes) {
    const n = extractZzNumber(code);
    if (n != null && n > highest) {
      highest = n;
    }
  }
  return highest;
};

// --- Persistence (SSR-safe) ---------------------------------------------

export const loadPersistedHighest = (): number => {
  if (typeof window === "undefined") {
    return 0;
  }
  const raw = window.localStorage.getItem(HIGHEST_KEY);
  const n = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export const savePersistedHighest = (n: number): void => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(HIGHEST_KEY, String(Math.max(0, Math.floor(n))));
};

export const resetPersistedHighest = (): void => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(HIGHEST_KEY);
};

// --- Sequence -----------------------------------------------------------

export type BarcodeSequence = {
  /** Allocate and return the next code (e.g. "ZZ0000001"). */
  reserve: () => string;
  /** Number of the last code issued (startAfter if none issued yet). */
  last: () => number;
  /** Preview the next number without allocating. */
  peekNext: () => number;
};

/**
 * Create a sequence that issues codes starting just after `startAfter`.
 * Pure and deterministic — no I/O. Callers persist `last()` afterwards.
 */
export const createSequence = (startAfter: number): BarcodeSequence => {
  let counter = Math.max(0, Math.floor(startAfter));
  return {
    reserve: () => {
      counter += 1;
      return formatBarcode(counter);
    },
    last: () => counter,
    peekNext: () => counter + 1,
  };
};

/**
 * Seed a sequence from the highest code already in use, combining persisted
 * storage with codes currently present in the editor.
 */
export const seedSequence = (existingCodes: (string | undefined | null)[]): BarcodeSequence =>
  createSequence(Math.max(loadPersistedHighest(), highestZzNumber(existingCodes)));
