
export type AnalyticsEventParams = Record<string, string | number | boolean | undefined | null>;

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

export const GA_MEASUREMENT_ID = MEASUREMENT_ID;
export const isAnalyticsEnabled = Boolean(MEASUREMENT_ID);

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const isBrowser = () => typeof window !== "undefined";

export const trackEvent = (name: string, params: AnalyticsEventParams = {}) => {
  if (!isBrowser() || !isAnalyticsEnabled) {
    return;
  }

  if (typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", name, {
    transport_type: "beacon",
    ...params,
  });
};

export const trackPageView = (
  locale: string,
  path: string,
  eventName = "view_home",
  options: AnalyticsEventParams = {},
) => {
  trackEvent(eventName, {
    page_title: `Home - ${locale}`,
    page_location: path,
    content_language: locale,
    ...options,
  });
};

export const trackOpenApp = (locale: string, source: string) => {
  trackEvent("click_open_app", {
    content_language: locale,
    event_category: "engagement",
    event_label: source,
  });
};

export const trackConnectOdoo = (locale: string, source: string) => {
  trackEvent("click_connect_odoo", {
    content_language: locale,
    event_category: "engagement",
    event_label: source,
  });
};

export const trackStartPrint = (locale: string, pages: number) => {
  trackEvent("start_print", {
    content_language: locale,
    event_category: "conversion",
    value: pages,
  });
};

export const trackResourceClick = (
  locale: string,
  resourceTitle: string,
  destination: "resource_detail" | "app" | "login",
  source: string,
  experiment?: string,
) => {
  trackEvent("click_resource", {
    content_language: locale,
    event_category: "engagement",
    event_label: source,
    item_name: resourceTitle,
    item_list_name: destination,
    value: destination,
    experiment,
  });
};

export const trackWebVital = (
  locale: string,
  route: string,
  metricName: string,
  metricValue: number,
  rating?: string,
  metricId?: string,
) => {
  if (!Number.isFinite(metricValue) || metricValue < 0) {
    return;
  }

  trackEvent("web_vital", {
    content_language: locale,
    page_location: route,
    event_category: "performance",
    metric_name: metricName,
    metric_value: metricValue,
    metric_rating: rating ?? null,
    metric_id: metricId,
  });
};

