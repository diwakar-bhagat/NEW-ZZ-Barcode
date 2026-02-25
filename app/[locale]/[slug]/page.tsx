import { permanentRedirect, notFound } from "next/navigation";

import { isLocale, type Locale, defaultLocale } from "@/lib/i18n";
import {
  getAllResources,
  getResourceByLocaleAndSlug,
} from "@/lib/seoContent";
import {
  getBlogByAnyLocaleSlug,
  getBlogByLocaleAndSlug,
} from "@/lib/seoBlog";

export default async function LegacySlugRedirectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const resolvedParams = await params;
  const locale: Locale = isLocale(resolvedParams.locale)
    ? resolvedParams.locale
    : defaultLocale;
  const { slug } = resolvedParams;

  const resourceInLocale = getResourceByLocaleAndSlug(locale, slug);
  if (resourceInLocale) {
    permanentRedirect(`/${locale}/recursos/${resourceInLocale.slug[locale]}`);
  }

  const resourceAnyLocale = getAllResources().find((resource) =>
    Object.values(resource.slug).includes(slug),
  );
  if (resourceAnyLocale) {
    permanentRedirect(`/${locale}/recursos/${resourceAnyLocale.slug[locale]}`);
  }

  const postInLocale = getBlogByLocaleAndSlug(locale, slug);
  if (postInLocale) {
    permanentRedirect(`/${locale}/blog/${postInLocale.slug[locale]}`);
  }

  const postAnyLocale = getBlogByAnyLocaleSlug(slug);
  if (postAnyLocale) {
    permanentRedirect(`/${locale}/blog/${postAnyLocale.slug[locale]}`);
  }

  notFound();
}
