"use client";

const isBrowser = () => typeof window !== "undefined";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { trackWebVital } from "@/lib/analytics";
import { type Locale } from "@/lib/i18n";

type WebVitalMetric = {
  name: string;
  value: number;
  rating?: string;
  id?: string;
};

export function WebVitalsTracker({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    if (typeof PerformanceObserver === "undefined" || typeof performance === "undefined") {
      return;
    }

    const route = pathname ?? "/";
    let lcp = 0;
    let lcpId = "";
    let fcp = 0;
    let fid: number | null = null;
    let inp: number | null = null;
    let cls = 0;
    let reported = false;

    const observers: PerformanceObserver[] = [];

    const emit = (metric: WebVitalMetric) => {
      if (!Number.isFinite(metric.value) || metric.value < 0) {
        return;
      }

      trackWebVital(
        locale,
        route,
        metric.name,
        metric.value,
        metric.rating,
        metric.id,
      );
    };

    const reportNow = (force = false) => {
      if (reported && !force) {
        return;
      }

      if (lcp > 0) {
        emit({ name: "LCP", value: lcp, id: lcpId });
      }

      if (fcp > 0) {
        emit({ name: "FCP", value: fcp });
      }

      if (fid !== null) {
        emit({ name: "FID", value: fid });
      }

      if (inp !== null) {
        emit({
          name: "INP",
          value: inp,
          rating: inp <= 200 ? "good" : inp <= 500 ? "needs-improvement" : "poor",
        });
      }

      if (cls > 0) {
        emit({ name: "CLS", value: Math.max(cls, Number.EPSILON) });
      }

      reported = true;
    };

    const start = (() => {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();

        for (const rawEntry of entries) {
          const entry = rawEntry as PerformanceEntry & {
            name?: string;
            duration?: number;
            startTime?: number;
            processingStart?: number;
            value?: number;
            hadRecentInput?: boolean;
            interactionId?: number;
            id?: string;
          };

          if (entry.entryType === "paint" && entry.name === "first-contentful-paint") {
            if (entry.startTime && entry.startTime > 0) {
              fcp = entry.startTime;
            }
            continue;
          }

          if (entry.entryType === "largest-contentful-paint") {
            if (entry.startTime && entry.startTime > lcp) {
              lcp = entry.startTime;
              lcpId = entry.id ?? "";
            }
            continue;
          }

          if (entry.entryType === "layout-shift") {
            if (entry.hadRecentInput) {
              continue;
            }
            const shift = entry.value ?? 0;
            if (typeof shift === "number" && Number.isFinite(shift)) {
              cls += shift;
            }
            continue;
          }

          if (entry.entryType === "first-input") {
            if (
              typeof entry.duration === "number" &&
              typeof entry.processingStart === "number" &&
              typeof entry.startTime === "number"
            ) {
              fid = entry.processingStart - entry.startTime;
            }
            continue;
          }

          if (entry.entryType === "event") {
            if (typeof entry.duration === "number") {
              inp = Math.max(inp ?? 0, entry.duration);
            }
          }
        }
      });

      try {
        observer.observe({ type: "largest-contentful-paint", buffered: true });
      } catch {
        // older browsers without LCP support
      }

      try {
        observer.observe({ type: "layout-shift", buffered: true });
      } catch {
        // older browsers without CLS support
      }

      try {
        observer.observe({ type: "first-input", buffered: true });
      } catch {
        // older browsers without FID support
      }

      try {
        observer.observe({ type: "event", buffered: true });
      } catch {
        // older browsers without INP support
      }

      try {
        observer.observe({ type: "paint", buffered: true });
      } catch {
        // no paint timing
      }

      return observer;
    })();

    observers.push(start);

    const paintEntries = performance.getEntriesByType("paint");
    for (const entry of paintEntries) {
      if (entry.name === "first-contentful-paint") {
        fcp = Math.max(fcp, entry.startTime);
      }
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        reportNow();
      }
    };

    const onPageHide = () => {
      reportNow();
    };

    const fallbackTimer = window.setTimeout(() => reportNow(true), 12_000);

    document.addEventListener("visibilitychange", onVisibilityChange, { passive: true });
    window.addEventListener("pagehide", onPageHide, { passive: true });

    return () => {
      clearTimeout(fallbackTimer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
      for (const observer of observers) {
        observer.disconnect();
      }
      reportNow(true);
    };
  }, [locale, pathname]);

  return null;
}
