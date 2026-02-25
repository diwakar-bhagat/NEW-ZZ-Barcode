import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { defaultLocale, isLocale } from "@/lib/i18n";
import {
  getAlternateLanguages,
  getCanonicalUrl,
  getBaseUrl,
} from "@/lib/seo";
import {
  getLocalizedBlogSummaries,
} from "@/lib/seoBlog";
import { LandingContainer } from "@/components/landing/LandingContainer";
import { LandingSection } from "@/components/landing/LandingSection";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { LandingFooter, LandingNav } from "@/components/landing";

const KEYWORDS = {
  es: "blog, etiquetas Odoo, inventario, guías de impresión, buenas prácticas",
  en: "blog, Odoo labels, inventory, printing guides, best practices",
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = isLocale(resolvedParams.locale) ? resolvedParams.locale : defaultLocale;
  const canonicalUrl = getCanonicalUrl(locale, "/blog");
  const ogImage = `${getBaseUrl()}/brand/mockup-hero.png`;

  return {
    title: locale === "es" ? "Blog de etiquetas para Odoo" : "Odoo labeling blog",
    description:
      locale === "es"
        ? "Actualizaciones, guías y mejores prácticas de etiquetado para inventario, Odoo y A4."
        : "Updates, guides, and best practices for Odoo labeling, inventory, and A4 workflows.",
    keywords: KEYWORDS[locale].split(",").map((keyword) => keyword.trim()),
    alternates: {
      canonical: canonicalUrl,
      languages: getAlternateLanguages("/blog"),
    },
    openGraph: {
      title: locale === "es" ? "Blog de etiquetas para Odoo" : "Odoo labeling blog",
      description:
        locale === "es"
          ? "Actualizaciones, guías y mejores prácticas de etiquetado para inventario, Odoo y A4."
          : "Updates, guides, and best practices for Odoo labeling, inventory, and A4 workflows.",
      url: canonicalUrl,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Labbely blog" }],
    },
    twitter: {
      card: "summary_large_image",
      title: locale === "es" ? "Blog de etiquetas para Odoo" : "Odoo labeling blog",
      description:
        locale === "es"
          ? "Actualizaciones, guías y mejores prácticas de etiquetado para inventario, Odoo y A4."
          : "Updates, guides, and best practices for Odoo labeling, inventory, and A4 workflows.",
      images: [ogImage],
    },
  };
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const locale = isLocale(resolvedParams.locale) ? resolvedParams.locale : defaultLocale;
  const tHome = await getTranslations({ locale, namespace: "Home" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const posts = getLocalizedBlogSummaries(locale);
  const baseUrl = getBaseUrl();
  const faqItems =
    locale === "es"
      ? [
          {
            question: "¿Qué tipo de artículos publica el blog de Labbely?",
            answer:
              "Publicamos guías prácticas para etiquetado, integración con Odoo y operaciones de inventario para impresión en A4.",
          },
          {
            question: "¿Con qué frecuencia se actualiza el contenido?",
            answer:
              "Publicamos artículos con la frecuencia necesaria para cubrir cambios de flujo y mejoras reales del proceso de inventario.",
          },
          {
            question: "¿Puedo usar estas guías con cualquier ERP?",
            answer:
              "Sí, las guías están centradas en Odoo pero muchas recomendaciones se aplican a cualquier flujo de inventario con etiquetado.",
          },
        ]
      : [
          {
            question: "What type of articles does Labbely blog publish?",
            answer:
              "We publish practical guides for labeling, Odoo integration, and A4 batch labeling workflows.",
          },
          {
            question: "How often is the content updated?",
            answer:
              "We publish when improvements or operational updates are ready, focusing on practical changes teams can apply quickly.",
          },
          {
            question: "Can I use these guides with any ERP?",
            answer:
              "Yes, most guidance is applicable across inventory flows, while some Odoo-specific details can be adapted to your setup.",
          },
        ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: locale === "es" ? "Blog de Labbely" : "Labbely Blog",
    description:
      locale === "es"
        ? "Artículos prácticos para proyectos de etiquetas, Odoo e inventario."
        : "Practical articles for labeling projects, Odoo, and inventory workflows.",
    url: `${baseUrl}/${locale}/blog`,
    inLanguage: locale,
    hasPart: [
      {
        "@type": "ItemList",
        itemListElement: posts.map((post, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: post.title,
          item: `${baseUrl}/${locale}/blog/${post.slug}`,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${baseUrl}/${locale}/blog#faq`,
        mainEntity: faqItems.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
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
              {locale === "es" ? "Blog" : "Blog"}
            </p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
              {locale === "es" ? "Blog de etiquetas y Odoo" : "Labeling and Odoo blog"}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
              {locale === "es"
                ? "Guías prácticas y actualizaciones para escalar tu operación de etiquetado."
                : "Practical guides and updates to scale your labeling operations."}
            </p>
          </header>

          <section className="mt-10 grid gap-4 lg:grid-cols-2">
            {posts.map((post) => (
              <article key={post.slug} className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:shadow-md">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {locale === "es" ? "Guía práctica" : "Guide"}
                </p>
                <h2 className="mt-3 text-xl font-semibold leading-snug text-slate-900">{post.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{post.summary}</p>
                <TrackedLink
                  href={`/${locale}/blog/${post.slug}`}
                  locale={locale}
                  className="mt-5 inline-flex items-center text-sm font-semibold text-slate-900 underline-offset-4 hover:underline"
                >
                  {locale === "es" ? "Leer artículo" : "Read article"}
                </TrackedLink>
              </article>
            ))}
          </section>

          <section className="mt-12 space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              {locale === "es" ? "Preguntas frecuentes" : "FAQ"}
            </h2>
            <div className="space-y-2">
              {faqItems.map((faq) => (
                <details key={faq.question} className="rounded-lg border border-slate-200 p-4">
                  <summary className="font-semibold text-slate-900">{faq.question}</summary>
                  <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
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
