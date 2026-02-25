import type React from "react";

/**
 * Shared types for landing sections.
 * Use these to keep section props consistent and document customization options.
 */

export type LandingSectionProps = {
  /** Optional extra class for the section root */
  className?: string;
  /** Optional inline styles for the section root */
  style?: React.CSSProperties;
};

export type LandingNavProps = LandingSectionProps & {
  logoSrc: string;
  locale: string;
  navOpenLabel: string;
  homeAriaLabel: string;
  githubLabel: string;
  githubHref: string;
  appHref: string;
  onOpenAppClick?: () => void;
};

export type LandingHeroProps = LandingSectionProps & {
  locale: string;
  heroTitle: string;
  heroDescription: string;
  heroCta: string;
  ctaLogin: string;
  heroNote: string;
  previewLabel: string;
  floatingA4Title: string;
  floatingA4Subtitle: string;
  floatingSyncTitle: string;
  floatingSyncSubtitle: string;
  floatingShortcutTitle: string;
  appHref: string;
  loginHref: string;
  onOpenAppClick?: () => void;
  onConnectOdooClick?: () => void;
};

/** Icon key for LandingFeatures (resolved in client). Use: printer | search | zap */
export type LandingFeatureIconKey = "printer" | "search" | "zap";

export type LandingFeatureItem = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  imageWidth?: number;
  imageHeight?: number;
  /** Tailwind classes for icon box, e.g. "bg-gradient-to-br from-primary to-primary/60" */
  iconClassName?: string;
  /** Icon identifier (serializable). Resolved to Lucide icon in client. */
  iconKey?: LandingFeatureIconKey;
};

export type LandingFeaturesProps = LandingSectionProps & {
  title: string;
  subtitle: string;
  features: LandingFeatureItem[];
};

export type LandingHowItWorksProps = LandingSectionProps & {
  processLabel: string;
  title: string;
  subtitle: string;
  faqTitle?: string;
  faqItems?: Array<{
    question: string;
    answer: string;
  }>;
  steps: Array<{
    number: number;
    title: string;
    description: string;
    /** Tailwind classes for step number box, e.g. "bg-gradient-to-br from-primary to-primary/60" */
    stepNumberClassName?: string;
  }>;
};

export type LandingOdooProps = LandingSectionProps & {
  locale: string;
  odooLabel: string;
  title: string;
  description: string;
  features: string[];
  docsLabel: string;
  badgeJsonRpc: string;
  badgeRest: string;
  requestLabel: string;
  responseLabel: string;
  methodLabel: string;
  ctaLabel: string;
  loginHref: string;
  onConnectOdooClick?: () => void;
};

export type LandingResourcesItem = {
  slug: string;
  title: string;
  summary: string;
};

export type LandingResourcesProps = LandingSectionProps & {
  locale: string;
  title: string;
  subtitle: string;
  description: string;
  resources: LandingResourcesItem[];
  appLabel: string;
  appHref: string;
  connectLabel: string;
  connectHref: string;
  moreLabel: string;
  moreHref: string;
  resourcesIndexLabel: string;
  blogReadLabel: string;
  blogHref: string;
};

/** Icon key for LandingUseCases (resolved in client). Use: package | barChart3 */
export type LandingUseCaseIconKey = "package" | "barChart3";

export type LandingUseCaseItem = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  imageWidth?: number;
  imageHeight?: number;
  /** Tailwind classes for icon wrapper, e.g. "bg-primary/10 text-primary" */
  iconBgClass: string;
  /** Icon identifier (serializable). Resolved to Lucide icon in client. */
  iconKey?: LandingUseCaseIconKey;
};

export type LandingUseCasesProps = LandingSectionProps & {
  title: string;
  subtitle: string;
  cases: LandingUseCaseItem[];
};

export type LandingOpenSourceProps = LandingSectionProps & {
  locale: string;
  badgeLabel: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  credits: string;
  githubHref: string;
  appHref: string;
};

export type LandingFooterProps = LandingSectionProps & {
  logoSrc: string;
  locale: string;
  homeAriaLabel: string;
  tagline: string;
  productLabel: string;
  editorLabel: string;
  resourcesLabel: string;
  blogLabel: string;
  loginLabel: string;
  developersLabel: string;
  githubLabel: string;
  issuesLabel: string;
  languageLabel: string;
  copyright: string;
  appHref: string;
  loginHref: string;
  githubHref: string;
  issuesHref: string;
  resourcesHref: string;
  blogHref: string;
};
