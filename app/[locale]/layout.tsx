import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";

import { defaultLocale, isLocale, locales } from "@/lib/i18n";
import { getBaseUrl, getOpenGraphLocale } from "@/lib/seo";

type LocaleLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = isLocale(resolvedParams.locale) ? resolvedParams.locale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const baseUrl = getBaseUrl();
  const ogImageUrl = "/brand/mockup-hero.png";
  const ogLocale = getOpenGraphLocale(locale);
  const alternateOgLocale = ogLocale === "en_US" ? "es_ES" : "en_US";

  return {
    metadataBase: new URL(baseUrl),
    applicationName: "Labbely",
    title: t("title"),
    description: t("description"),
    keywords: t("keywords").split(",").map((keyword) => keyword.trim()),
    category: "Business",
    creator: "Labbely",
    publisher: "Labbely",
    robots: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: "Labbely",
      locale: ogLocale,
      alternateLocale: [alternateOgLocale],
      type: "website",
      images: [
        {
          url: ogImageUrl,
          alt: t("ogImageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [ogImageUrl],
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const resolvedParams = await params;

  if (!isLocale(resolvedParams.locale)) {
    notFound();
  }

  const locale = resolvedParams.locale;
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
