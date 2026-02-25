import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { defaultLocale, isLocale } from "@/lib/i18n";
import {
  getAlternateLanguages,
  getCanonicalUrl,
  getBaseUrl,
} from "@/lib/seo";
import {
  getLocalizedHubDescription,
  getLocalizedHubIntro,
  getLocalizedHubTitle,
  getLocalizedResourceSummaries,
} from "@/lib/seoContent";
import { LandingContainer } from "@/components/landing/LandingContainer";
import { LandingSection } from "@/components/landing/LandingSection";
import { LandingFooter, LandingNav } from "@/components/landing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = isLocale(resolvedParams.locale) ? resolvedParams.locale : defaultLocale;
  const canonicalUrl = getCanonicalUrl(locale, "/recursos");

  return {
    title: `${getLocalizedHubTitle(locale)} | Labbely`,
    description: getLocalizedHubDescription(locale),
    alternates: {
      canonical: canonicalUrl,
      languages: getAlternateLanguages("/recursos"),
    },
    openGraph: {
      title: getLocalizedHubTitle(locale),
      description: getLocalizedHubDescription(locale),
      url: canonicalUrl,
    },
  };
}

export default async function ResourcesIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const locale = isLocale(resolvedParams.locale) ? resolvedParams.locale : defaultLocale;
  const tHome = await getTranslations({ locale, namespace: "Home" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const baseUrl = getBaseUrl();
  const resources = getLocalizedResourceSummaries(locale).map((resource) => ({
    href: `/${locale}/recursos/${resource.slug[locale]}`,
    title: resource.title[locale],
    summary: resource.summary[locale],
  }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: getLocalizedHubTitle(locale),
    url: getCanonicalUrl(locale, "/recursos"),
    inLanguage: locale,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: resources.map((resource, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: resource.title,
        url: `${baseUrl}${resource.href}`,
      })),
    },
    isPartOf: {
      "@type": "WebSite",
      name: "Labbely",
      url: baseUrl,
    },
  };

  const appHref = `/${locale}/app`;
  const loginHref = `/${locale}/login`;
  const githubHref = "https://github.com/dani-mas/labbely";
  const issuesHref = "https://github.com/dani-mas/labbely/issues";

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingNav
        logoSrc="/brand/labbely-logo.png"
        locale={locale}
        navOpenLabel={tHome("navOpen")}
        homeAriaLabel={tHome("homeAriaLabel")}
        githubLabel={tCommon("github")}
        githubHref={githubHref}
        appHref={appHref}
      />
      <LandingSection spacing="lg" linesVariant="none">
        <LandingContainer>
          <header className="rounded-3xl border border-slate-200/90 bg-white p-7 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              {getLocalizedHubTitle(locale)}
            </p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
              {getLocalizedHubDescription(locale)}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">{getLocalizedHubIntro(locale)}</p>
          </header>

          <section className="mt-10">
            <ul className="grid gap-4 sm:grid-cols-2">
              {resources.map((resource) => (
                <li
                  key={resource.href}
                  className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {locale === "es" ? "Guía" : "Guide"}
                  </p>
                  <h2 className="mt-3 text-lg font-semibold leading-snug text-slate-900">{resource.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{resource.summary}</p>
                  <Link
                    href={resource.href}
                    className="mt-4 inline-flex items-center text-sm font-semibold text-slate-900 underline-offset-4 hover:underline"
                  >
                    {locale === "es" ? "Leer guía" : "Read guide"}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={appHref}
              className="rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              {locale === "es" ? "Abrir editor" : "Open editor"}
            </a>
            <a
              href={loginHref}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {locale === "es" ? "Conectar Odoo" : "Connect Odoo"}
            </a>
          </div>
        </LandingContainer>
      </LandingSection>

      <LandingFooter
        logoSrc="/brand/labbely-logo.png"
        locale={locale}
        homeAriaLabel={tHome("homeAriaLabel")}
        tagline={tHome("footerTagline")}
        productLabel={tHome("footerProduct")}
        editorLabel={tHome("footerEditor")}
        resourcesLabel={tHome("footerResources")}
        blogLabel={tHome("footerBlog")}
        loginLabel={tHome("footerLogin")}
        developersLabel={tHome("footerDevelopers")}
        githubLabel={tCommon("github")}
        issuesLabel={tHome("footerIssues")}
        languageLabel={tHome("footerLanguage")}
        copyright={tHome("footerCopyright")}
        appHref={appHref}
        loginHref={loginHref}
        githubHref={githubHref}
        issuesHref={issuesHref}
        resourcesHref={`/${locale}/recursos`}
        blogHref={`/${locale}/blog`}
      />
    </main>
  );
}
