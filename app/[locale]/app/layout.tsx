import type { Metadata } from "next";

import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";
import { getCanonicalUrl, getAlternateLanguages, getBaseUrl } from "@/lib/seo";

const buildCanonical = (locale: Locale) => getCanonicalUrl(locale, "/app");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = isLocale(resolvedParams.locale) ? resolvedParams.locale : defaultLocale;

  return {
    title: "Labbely App",
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
    alternates: {
      canonical: buildCanonical(locale),
      languages: getAlternateLanguages("/app"),
    },
    metadataBase: new URL(getBaseUrl()),
    openGraph: {
      url: buildCanonical(locale),
    },
    twitter: {
      card: "summary",
    },
  };
}

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}