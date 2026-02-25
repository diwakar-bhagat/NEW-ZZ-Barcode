
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";
import {
  getAlternateLanguages,
  getCanonicalUrl,
  getBaseUrl,
} from "@/lib/seo";
import {
  getAllResourceStaticParams,
  getLocalizedRelatedSlugs,
  getResourceByLocaleAndSlug,
} from "@/lib/seoContent";
import { LandingContainer } from "@/components/landing/LandingContainer";
import { LandingSection } from "@/components/landing/LandingSection";
import { LandingFooter, LandingNav } from "@/components/landing";

const UPDATED_AT = "2026-02-25";

export async function generateStaticParams() {
  return getAllResourceStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = isLocale(resolvedParams.locale) ? resolvedParams.locale : defaultLocale;
  const routeSlug = resolvedParams.slug;
  const resource = getResourceByLocaleAndSlug(locale, routeSlug);

  if (!resource) {
    return {
      title: "Labbely",
      description: "Resource not found",
    };
  }

  const canonicalUrl = getCanonicalUrl(locale, `/recursos/${routeSlug}`);

  return {
    title: resource.metaTitle[locale],
    description: resource.metaDescription[locale],
    keywords: resource.keywords[locale].split(",").map((keyword) => keyword.trim()),
    alternates: {
      canonical: canonicalUrl,
      languages: getAlternateLanguages(`/recursos/${routeSlug}`),
    },
    openGraph: {
      title: resource.metaTitle[locale],
      description: resource.metaDescription[locale],
      url: canonicalUrl,
    },
  };
}

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const resolvedParams = await params;
  const locale: Locale = isLocale(resolvedParams.locale) ? resolvedParams.locale : defaultLocale;
  const tHome = await getTranslations({ locale, namespace: "Home" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const resource = getResourceByLocaleAndSlug(locale, resolvedParams.slug);

  if (!resource) {
    notFound();
  }

  const baseUrl = getBaseUrl();
  const canonicalUrl = getCanonicalUrl(locale, `/recursos/${resource.slug[locale]}`);
  const appHref = `/${locale}/app`;
  const loginHref = `/${locale}/login`;
  const resourcesHref = `/${locale}/recursos`;
  const githubHref = "https://github.com/dani-mas/labbely";
  const issuesHref = "https://github.com/dani-mas/labbely/issues";
  const related = getLocalizedRelatedSlugs(locale, resource.relatedIds);

  const articleSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${canonicalUrl}#article`,
        headline: resource.title[locale],
        description: resource.metaDescription[locale],
        inLanguage: locale,
        datePublished: UPDATED_AT,
        dateModified: UPDATED_AT,
        url: canonicalUrl,
        isPartOf: {
          "@type": "WebSite",
          "@id": `${baseUrl}/`,
          name: "Labbely",
        },
        about: {
          "@type": "SoftwareApplication",
          name: "Labbely",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: locale === "es" ? "Inicio" : "Home",
            item: getCanonicalUrl(locale, ""),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: locale === "es" ? "Recursos" : "Resources",
            item: getCanonicalUrl(locale, "/recursos"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: resource.title[locale],
            item: canonicalUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        mainEntity: resource.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question[locale],
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer[locale],
          },
        })),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
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
              {locale === "es" ? "Guía" : "Guide"}
            </p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
              {resource.title[locale]}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">{resource.summary[locale]}</p>
            <p className="mt-4 max-w-4xl text-sm leading-relaxed text-slate-700">{resource.metaDescription[locale]}</p>
          </header>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px]">
            <div className="space-y-7">
              <section className="space-y-7">
                {resource.sections.map((section) => (
                  <article key={section.heading[locale]} className="space-y-3">
                    <h2 className="text-2xl font-semibold text-slate-900">{section.heading[locale]}</h2>
                    {(section.body[locale] || []).map((paragraph) => (
                      <p key={paragraph} className="text-base leading-relaxed text-slate-700">
                        {paragraph}
                      </p>
                    ))}
                  </article>
                ))}
              </section>

              <section
                className="space-y-3 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm"
                aria-label={locale === "es" ? "Preguntas frecuentes" : "FAQ"}
              >
                <h2 className="text-xl font-semibold text-slate-900">{locale === "es" ? "Preguntas frecuentes" : "FAQ"}</h2>
                <div className="space-y-2">
                  {resource.faqs.map((faq) => (
                    <details key={faq.question[locale]} className="rounded-lg border border-slate-200 p-4">
                      <summary className="cursor-pointer font-semibold text-slate-900">{faq.question[locale]}</summary>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{faq.answer[locale]}</p>
                    </details>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-4 lg:mt-4">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">
                  {locale === "es" ? "Índice rápido" : "Quick index"}
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {resource.sections.map((section) => (
                    <li
                      key={section.heading[locale]}
                      className="rounded-md border border-transparent px-3 py-2 hover:border-slate-300"
                    >
                      {section.heading[locale]}
                    </li>
                  ))}
                </ul>
              </div>

              {related.length > 0 ? (
                <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">{locale === "es" ? "Más recursos" : "Related guides"}</h2>
                  <ul className="space-y-2">
                    {related.map((item) => (
                      <li key={item.slug} className="rounded-xl border border-slate-200 p-3">
                        <Link href={`/${locale}/recursos/${item.slug}`} className="text-sm font-semibold text-slate-900">
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <div className="flex flex-col gap-3">
                <Link
                  href={appHref}
                  className="rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  {locale === "es" ? "Abrir editor" : "Open editor"}
                </Link>
                <Link
                  href={loginHref}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {locale === "es" ? "Conectar Odoo" : "Connect Odoo"}
                </Link>
                <Link
                  href={resourcesHref}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {locale === "es" ? "Ver otros recursos" : "View all guides"}
                </Link>
              </div>
            </aside>
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

