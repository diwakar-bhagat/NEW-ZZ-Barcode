import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { defaultLocale, isLocale } from "@/lib/i18n";
import { getAlternateLanguages, getBaseUrl, getCanonicalUrl } from "@/lib/seo";
import { getLocalizedResourceSummaries } from "@/lib/seoContent";
import {
  LandingNav,
  LandingHero,
  LandingFeatures,
  LandingHowItWorks,
  LandingOdoo,
  LandingUseCases,
  LandingOpenSource,
  LandingResources,
  LandingFooter,
} from "@/components/landing";
import { HomePageTracker } from "@/components/analytics/HomePageTracker";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = isLocale(resolvedParams.locale) ? resolvedParams.locale : defaultLocale;
  const canonicalUrl = getCanonicalUrl(locale);
  const tMetadata = await getTranslations({ locale, namespace: "Metadata" });
  const title = tMetadata("title");
  const description = tMetadata("description");
  const keywords = tMetadata("keywords");
  const ogImage = tMetadata("ogImage") || "/brand/mockup-hero.png";

  return {
    title,
    description,
    keywords: keywords.split(",").map((keyword) => keyword.trim()),
    alternates: {
      canonical: canonicalUrl,
      languages: getAlternateLanguages(),
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: tMetadata("ogImageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function Home({ params }: HomePageProps) {
  const resolvedParams = await params;
  const locale = isLocale(resolvedParams.locale) ? resolvedParams.locale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "Home" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const tMetadata = await getTranslations({ locale, namespace: "Metadata" });
  const logoSrc = "/brand/labbely-logo.png";
  const baseUrl = getBaseUrl();
  const canonicalUrl = getCanonicalUrl(locale);
  const organizationId = `${baseUrl}/#organization`;
  const websiteId = `${baseUrl}/#website`;
  const webPageId = `${canonicalUrl}#webpage`;
  const softwareId = `${baseUrl}/#software`;
  const resources = getLocalizedResourceSummaries(locale).map((resource) => ({
    slug: resource.slug[locale],
    title: resource.title[locale],
    summary: resource.summary[locale],
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: "Labbely",
        url: baseUrl,
        logo: `${baseUrl}/brand/labbely-icon.png`,
        sameAs: ["https://github.com/dani-mas/labbely"],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: "Labbely",
        url: baseUrl,
        inLanguage: locale,
        publisher: { "@id": organizationId },
      },
      {
        "@type": "WebPage",
        "@id": webPageId,
        url: canonicalUrl,
        name: tMetadata("title"),
        description: tMetadata("description"),
        inLanguage: locale,
        isPartOf: { "@id": websiteId },
        about: { "@id": organizationId },
      },
      {
        "@type": "SoftwareApplication",
        "@id": softwareId,
        name: "Labbely",
        operatingSystem: "Web",
        applicationCategory: "BusinessApplication",
        url: canonicalUrl,
        description: tMetadata("description"),
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#howitworks-faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: t("howItWorksFaqQuestion1"),
            acceptedAnswer: {
              "@type": "Answer",
              text: t("howItWorksFaqAnswer1"),
            },
          },
          {
            "@type": "Question",
            name: t("howItWorksFaqQuestion2"),
            acceptedAnswer: {
              "@type": "Answer",
              text: t("howItWorksFaqAnswer2"),
            },
          },
          {
            "@type": "Question",
            name: t("howItWorksFaqQuestion3"),
            acceptedAnswer: {
              "@type": "Answer",
              text: t("howItWorksFaqAnswer3"),
            },
          },
        ],
      },
    ],
  };

  const appHref = `/${locale}/app`;
  const loginHref = `/${locale}/login`;
  const githubHref = "https://github.com/dani-mas/labbely";
  const issuesHref = "https://github.com/dani-mas/labbely/issues";

  return (
    <div className="min-h-screen bg-white">
      <HomePageTracker locale={locale} path={`/${locale}/`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingNav
        logoSrc={logoSrc}
        locale={locale}
        navOpenLabel={t("navOpen")}
        homeAriaLabel={t("homeAriaLabel")}
        githubLabel={tCommon("github")}
        githubHref={githubHref}
        appHref={appHref}
      />

      <LandingHero
        locale={locale}
        heroTitle={t("heroTitle")}
        heroDescription={t("heroDescription")}
        heroCta={t("heroCta")}
        ctaLogin={t("ctaLogin")}
        heroNote={t("heroNote")}
        previewLabel={t("previewLabel")}
        floatingA4Title={t("floatingA4Title")}
        floatingA4Subtitle={t("floatingA4Subtitle")}
        floatingSyncTitle={t("floatingSyncTitle")}
        floatingSyncSubtitle={t("floatingSyncSubtitle")}
        floatingShortcutTitle={t("floatingShortcutTitle")}
        appHref={appHref}
        loginHref={loginHref}
      />

      <LandingFeatures
        title={t("featuresTitle")}
        subtitle={t("featuresSubtitle")}
        features={[
          {
            title: t("feature1Title"),
            description: t("feature1Description"),
            imageSrc:
              "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&h=300&fit=crop",
            imageAlt: t("feature1ImageAlt"),
            imageWidth: 400,
            imageHeight: 300,
            iconClassName: "bg-slate-100 text-slate-900 border-slate-200",
            iconKey: "printer",
          },
          {
            title: t("feature2Title"),
            description: t("feature2Description"),
            imageSrc:
              "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop",
            imageAlt: t("feature2ImageAlt"),
            imageWidth: 400,
            imageHeight: 300,
            iconClassName: "bg-slate-100 text-slate-900 border-slate-200",
            iconKey: "search",
          },
          {
            title: t("feature3Title"),
            description: t("feature3Description"),
            imageSrc:
              "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
            imageAlt: t("feature3ImageAlt"),
            imageWidth: 400,
            imageHeight: 300,
            iconClassName: "bg-slate-100 text-slate-900 border-slate-200",
            iconKey: "zap",
          },
        ]}
      />

      <LandingHowItWorks
        processLabel={t("processLabel")}
        title={t("howItWorksTitle")}
        subtitle={t("howItWorksSubtitle")}
        faqTitle={t("howItWorksFaqTitle")}
        faqItems={[
          { question: t("howItWorksFaqQuestion1"), answer: t("howItWorksFaqAnswer1") },
          { question: t("howItWorksFaqQuestion2"), answer: t("howItWorksFaqAnswer2") },
          { question: t("howItWorksFaqQuestion3"), answer: t("howItWorksFaqAnswer3") },
        ]}
        steps={[
          {
            number: 1,
            title: t("step1Title"),
            description: t("step1Description"),
            stepNumberClassName: "bg-slate-900",
          },
          {
            number: 2,
            title: t("step2Title"),
            description: t("step2Description"),
            stepNumberClassName: "bg-slate-900",
          },
          {
            number: 3,
            title: t("step3Title"),
            description: t("step3Description"),
            stepNumberClassName: "bg-slate-900",
          },
        ]}
      />

      <LandingOdoo
        locale={locale}
        odooLabel={t("odooBadge")}
        title={t("odooTitle")}
        description={t("odooDescription")}
        features={[
          t("odooFeature1"),
          t("odooFeature2"),
          t("odooFeature3"),
        ]}
        docsLabel={t("odooDocsLabel")}
        badgeJsonRpc={t("odooBadgeJsonRpc")}
        badgeRest={t("odooBadgeRest")}
        requestLabel={t("odooRequestLabel")}
        responseLabel={t("odooResponseLabel")}
        methodLabel={t("odooMethodPost")}
        ctaLabel={t("odooLoginCta")}
        loginHref={loginHref}
      />

      <LandingResources
        locale={locale}
        title={t("resourcesTitle")}
        subtitle={t("resourcesSubtitle")}
        description={t("resourcesDescription")}
        resources={resources}
        appLabel={t("resourcesOpenAppCta")}
        appHref={appHref}
        connectLabel={t("resourcesConnectOdooCta")}
        connectHref={loginHref}
        moreLabel={t("resourcesRead")}
        moreHref={`/${locale}/recursos`}
        resourcesIndexLabel={t("resourcesListLabel")}
        blogReadLabel={t("homeBlogReadMore")}
        blogHref={`/${locale}/blog`}
      />

      <LandingUseCases
        title={t("useCasesTitle")}
        subtitle={t("useCasesSubtitle")}
        cases={[
          {
            title: t("useCase1Title"),
            description: t("useCase1Description"),
            imageSrc:
              "https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&h=400&fit=crop",
            imageAlt: t("useCase1ImageAlt"),
            imageWidth: 600,
            imageHeight: 400,
            iconBgClass: "bg-slate-100 text-slate-900 border border-slate-200",
            iconKey: "package",
          },
          {
            title: t("useCase2Title"),
            description: t("useCase2Description"),
            imageSrc:
              "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=600&h=400&fit=crop",
            imageAlt: t("useCase2ImageAlt"),
            imageWidth: 600,
            imageHeight: 400,
            iconBgClass: "bg-slate-100 text-slate-900 border border-slate-200",
            iconKey: "barChart3",
          },
        ]}
      />

      <LandingOpenSource
        locale={locale}
        badgeLabel={t("openSourceBadge")}
        title={t("openSourceTitle")}
        description={t("openSourceDescription")}
        primaryCta={t("openSourceCta")}
        secondaryCta={t("openSourceSecondaryCta")}
        credits={t("openSourceCredits")}
        githubHref={githubHref}
        appHref={appHref}
      />

      <LandingFooter
        logoSrc={logoSrc}
        locale={locale}
        homeAriaLabel={t("homeAriaLabel")}
        tagline={t("footerTagline")}
        productLabel={t("footerProduct")}
        editorLabel={t("footerEditor")}
        resourcesLabel={t("footerResources")}
        resourcesHref={`/${locale}/recursos`}
        blogLabel={t("footerBlog")}
        blogHref={`/${locale}/blog`}
        loginLabel={t("footerLogin")}
        developersLabel={t("footerDevelopers")}
        githubLabel={tCommon("github")}
        issuesLabel={t("footerIssues")}
        languageLabel={t("footerLanguage")}
        copyright={t("footerCopyright")}
        appHref={appHref}
        loginHref={loginHref}
        githubHref={githubHref}
        issuesHref={issuesHref}
      />
    </div>
  );
}
