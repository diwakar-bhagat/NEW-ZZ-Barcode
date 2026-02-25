import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

import { defaultLocale, localePrefix, locales } from "./lib/i18n";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix,
  // Don't auto-detect locale from Accept-Language header
  localeDetection: false,
});

export default function middleware(request: NextRequest) {
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
