import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";
import {
  getAlternateLanguages,
  getCanonicalUrl,
  getBaseUrl,
} from "@/lib/seo";
import {
  getAllBlogStaticParams,
  getBlogByLocaleAndSlug,
  getBlogByAnyLocaleSlug,
  getRelatedBlogPosts,
} from "@/lib/seoBlog";
import { LandingContainer } from "@/components/landing/LandingContainer";
import { LandingSection } from "@/components/landing/LandingSection";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { LandingFooter, LandingNav } from "@/components/landing";

export async function generateStaticParams() {
  return getAllBlogStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = isLocale(resolvedParams.locale) ? resolvedParams.locale : defaultLocale;
  const routeSlug = resolvedParams.slug;
  const post = getBlogByLocaleAndSlug(locale, routeSlug);
  const fallbackPost = post ?? getBlogByAnyLocaleSlug(routeSlug);

  if (!fallbackPost) {
    return {
      title: "Labbely",
      description: "Article not found",
    };
  }

  const canonicalSlug = post ? routeSlug : fallbackPost.slug[locale];
  const canonicalUrl = getCanonicalUrl(locale, `/blog/${canonicalSlug}`);
  const ogImage = `${getBaseUrl()}/brand/mockup-hero.png`;

  return {
    title: fallbackPost.metaTitle[locale],
    description: fallbackPost.metaDescription[locale],
    keywords: fallbackPost.tags[locale].split(",").map((keyword) => keyword.trim()),
    alternates: {
      canonical: canonicalUrl,
      languages: getAlternateLanguages(`/blog/${canonicalSlug}`),
    },
    openGraph: {
      title: fallbackPost.metaTitle[locale],
      description: fallbackPost.metaDescription[locale],
      url: canonicalUrl,
      type: "article",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fallbackPost.title[locale],
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fallbackPost.metaTitle[locale],
      description: fallbackPost.metaDescription[locale],
      images: [ogImage],
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const resolvedParams = await params;
  const locale: Locale = isLocale(resolvedParams.locale) ? resolvedParams.locale : defaultLocale;
  const tHome = await getTranslations({ locale, namespace: "Home" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const post = getBlogByLocaleAndSlug(locale, resolvedParams.slug);
  if (!post) {
    const fallback = getBlogByAnyLocaleSlug(resolvedParams.slug);
    if (fallback) {
      permanentRedirect(`/${locale}/blog/${fallback.slug[locale]}`);
    }
  }

  if (!post) {
    notFound();
  }

  const baseUrl = getBaseUrl();
  const canonicalUrl = getCanonicalUrl(locale, `/blog/${post.slug[locale]}`);
  const blogHref = `/${locale}/blog`;
  const appHref = `/${locale}/app`;
  const loginHref = `/${locale}/login`;
  const githubHref = "https://github.com/dani-mas/labbely";
  const issuesHref = "https://github.com/dani-mas/labbely/issues";
  const relatedPosts = getRelatedBlogPosts(locale, post.id, post.slug[locale], 2);
  const articleSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${canonicalUrl}#article`,
        headline: post.title[locale],
        description: post.metaDescription[locale],
        datePublished: post.publishedAt,
        dateModified: post.publishedAt,
        inLanguage: locale,
        url: canonicalUrl,
        isPartOf: {
          "@type": "Blog",
          "@id": `${baseUrl}/${locale}/blog`,
          name: locale === "es" ? "Blog de Labbely" : "Labbely Blog",
        },
        about: {
          "@type": "SoftwareApplication",
          name: "Labbely",
          applicationCategory: "BusinessApplication",
          applicationSuite: "Inventory and label tooling",
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
            name: locale === "es" ? "Blog" : "Blog",
            item: `${baseUrl}/${locale}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title[locale],
            item: canonicalUrl,
          },
        ],
      },
      {
        "@type": "ItemList",
        name: locale === "es" ? "Artículos relacionados" : "Related posts",
        itemListElement: relatedPosts.map((relatedPost, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: relatedPost.title[locale],
          item: `${baseUrl}/${locale}/blog/${relatedPost.slug[locale]}`,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        mainEntity: post.faqs.map((faq) => ({
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
              {locale === "es" ? "Blog" : "Blog"}
            </p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
              {post.title[locale]}
            </h1>
            <p className="mt-4 text-sm text-slate-500">
              {post.publishedAt} · {post.tags[locale]}
            </p>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-700">{post.intro[locale]}</p>
          </header>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px]">
            <div className="space-y-7">
              <section className="space-y-7">
                {post.sections.map((section) => (
                  <article key={section.heading[locale]} className="space-y-2">
                    <h2 className="text-2xl font-semibold text-slate-900">{section.heading[locale]}</h2>
                    {(section.body[locale] || []).map((paragraph) => (
                      <p key={paragraph} className="text-base leading-relaxed text-slate-700">
                        {paragraph}
                      </p>
                    ))}
                  </article>
                ))}
              </section>

              <section className="space-y-3 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm" aria-label={locale === "es" ? "Preguntas frecuentes" : "FAQ"}>
                <h2 className="text-xl font-semibold text-slate-900">
                  {locale === "es" ? "Preguntas frecuentes" : "FAQ"}
                </h2>
                <div className="space-y-2">
                  {post.faqs.map((faq) => (
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
                <h2 className="text-lg font-semibold text-slate-900">Índice</h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {post.sections.map((section) => (
                    <li
                      key={section.heading[locale]}
                      className="rounded-md border border-transparent px-3 py-2 hover:border-slate-300"
                    >
                      {section.heading[locale]}
                    </li>
                  ))}
                </ul>
              </div>

              <TrackedLink
                href={blogHref}
                locale={locale}
                className="inline-flex w-full justify-center rounded-full border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                {locale === "es" ? "Volver al blog" : "Back to blog"}
              </TrackedLink>

              {relatedPosts.length > 0 ? (
                <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {locale === "es" ? "Artículos relacionados" : "Related articles"}
                  </h2>
                  <div className="space-y-3">
                    {relatedPosts.map((related) => (
                      <article
                        key={related.slug[locale]}
                        className="rounded-xl border border-slate-200 bg-white p-3"
                      >
                        <h3 className="text-sm font-semibold leading-snug text-slate-900">
                          {related.title[locale]}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600">{related.summary[locale]}</p>
                        <TrackedLink
                          href={`/${locale}/blog/${related.slug[locale]}`}
                          locale={locale}
                          className="mt-3 inline-block text-xs font-semibold text-slate-900 underline-offset-4 hover:underline"
                        >
                          {locale === "es" ? "Leer también" : "Read also"}
                        </TrackedLink>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}
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
