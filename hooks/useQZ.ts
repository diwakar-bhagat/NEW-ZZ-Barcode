"use client";

import { useCallback, useEffect, useState } from "react";

import * as qzService from "@/services/qz";

export const QZ_PRINTER_STORAGE_KEY = "labbely:qzPrinter";

export function useQZ() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [printers, setPrinters] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setConnected(qzService.isConnected());
  }, []);

  const refreshPrinters = useCallback(async () => {
    try {
      const found = await qzService.getPrinters();
      setPrinters(found);
      setError(null);
      return found;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return [];
    }
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      await qzService.connect();
      setConnected(true);
      await refreshPrinters();
      return true;
    } catch (err) {
      setConnected(false);
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setConnecting(false);
    }
  }, [refreshPrinters]);

  return { connected, connecting, connect, printers, refreshPrinters, error };
}

export const getSavedPrinter = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(QZ_PRINTER_STORAGE_KEY);
};

export const savePrinter = (printer: string) => {
  window.localStorage.setItem(QZ_PRINTER_STORAGE_KEY, printer);
};
