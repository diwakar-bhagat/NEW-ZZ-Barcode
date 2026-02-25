import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LandingContainer } from "./LandingContainer";
import { LandingSection } from "./LandingSection";
import { LandingFloatingCard } from "./LandingFloatingCard";

import styles from "./LandingHero.module.css";
import type { LandingHeroProps } from "./types";

export function LandingHero({
  locale,
  heroTitle,
  heroDescription,
  heroCta,
  ctaLogin,
  heroNote,
  previewLabel,
  floatingA4Title,
  floatingA4Subtitle,
  floatingSyncTitle,
  floatingSyncSubtitle,
  floatingShortcutTitle,
  appHref,
  loginHref,
  className = "",
  style,
}: LandingHeroProps) {
  void locale;

  return (
    <LandingSection
      className={`${styles.hero} ${className}`}
      style={style}
      spacing="lg"
      linesVariant="none"
    >
      <LandingContainer>
        <div className={styles.grid}>
          <div className={styles.content}>
            <h1 className={styles.title}>{heroTitle}</h1>
            <p className={styles.description}>{heroDescription}</p>
            <div className={styles.ctas}>
              <Button asChild size="lg" className={styles.primaryCta}>
                <Link href={appHref}>
                  {heroCta} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className={styles.secondaryCta}>
                <Link href={loginHref}>{ctaLogin}</Link>
              </Button>
            </div>
            <p className={styles.note}>
              <Check className={styles.noteCheck} />
              {heroNote}
            </p>
          </div>

          {/* Hero Collage */}
          <div className={styles.collageWrap}>
            {/* Main mockup image */}
            <div className={styles.mockupWrap}>
              <Image
                src="/brand/mockup-hero.png"
                alt={previewLabel}
                className={styles.mockupImage}
                width={1280}
                height={720}
                priority
                fetchPriority="high"
                loading="eager"
                sizes="(min-width: 1024px) 48vw, 92vw"
              />
            </div>

            {/* Floating badges */}
            <LandingFloatingCard className={styles.floatingCard1} position="top-0 -right-6 lg:-right-12">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">{floatingA4Title}</div>
                  <div className="text-xs text-slate-500">{floatingA4Subtitle}</div>
                </div>
              </div>
            </LandingFloatingCard>

            <LandingFloatingCard className={styles.floatingCard2} position="top-1/3 -left-6 lg:-left-12">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">{floatingSyncTitle}</div>
                  <div className="text-xs text-slate-500">{floatingSyncSubtitle}</div>
                </div>
              </div>
            </LandingFloatingCard>

            <LandingFloatingCard className={styles.floatingCard3} position="bottom-4 right-0 lg:right-8">
              <div className="flex flex-col gap-1">
                <div className="text-xs font-semibold text-slate-900">{floatingShortcutTitle}</div>
                <div className="flex gap-1">
                  <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 border border-slate-200">⌘</kbd>
                  <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 border border-slate-200">K</kbd>
                </div>
              </div>
            </LandingFloatingCard>
          </div>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
