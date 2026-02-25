
"use client";

import { useEffect } from "react";

import { trackPageView } from "@/lib/analytics";

type HomePageTrackerProps = {
  locale: string;
  path?: string;
};

export function HomePageTracker({ locale, path = "/" }: HomePageTrackerProps) {
  useEffect(() => {
    trackPageView(locale, path);
  }, [locale, path]);

  return null;
}

