import type { MetadataRoute } from "next";

import { getBaseUrl } from "@/lib/seo";
import { locales } from "@/lib/i18n";

export default function robots(): MetadataRoute.Robots {
  const blockedPaths = [
    "/api",
    ...locales.flatMap((locale) => [`/${locale}/login`, `/${locale}/app`]),
  ];

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: blockedPaths,
    },
    sitemap: `${getBaseUrl()}/sitemap.xml`,
  };
}
