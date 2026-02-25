import type { MetadataRoute } from "next";

import { getLocalizedResourceSummaries } from "@/lib/seoContent";
import { defaultLocale, locales } from "@/lib/i18n";
import { getBaseUrl } from "@/lib/seo";

const getStaticLastModified = () => {
  const raw = process.env.SITEMAP_LAST_MODIFIED ?? process.env.NEXT_PUBLIC_BUILD_TIME;
  if (!raw) {
    return new Date();
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }
  return parsed;
};

const sitemapLastModified = getStaticLastModified();

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const routes = [""];
  const resourceRoutes = locales.flatMap((locale) =>
    getLocalizedResourceSummaries(locale).map((resource) => `/recursos/${resource.slug[locale]}`),
  );
  const allRoutes = [...routes, ...resourceRoutes];

  return locales.flatMap((locale) =>
    allRoutes.map((route) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: sitemapLastModified,
      alternates: {
        languages: {
          en: `${baseUrl}/en${route}`,
          es: `${baseUrl}/es${route}`,
          "x-default": `${baseUrl}/${defaultLocale}${route}`,
        },
      },
    })),
  );
}
