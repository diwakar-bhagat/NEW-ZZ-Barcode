import Image from "next/image";
import Link from "next/link";
import { Github, ArrowRight } from "lucide-react";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { Button } from "@/components/ui/button";

import styles from "./LandingNav.module.css";
import type { LandingNavProps } from "./types";

export function LandingNav({
  logoSrc,
  locale,
  navOpenLabel,
  homeAriaLabel,
  githubLabel,
  githubHref,
  appHref,
  className = "",
  style,
}: LandingNavProps) {
  const localeCode = locale === "en" ? "en" : "es";

  return (
    <nav className={`${styles.nav} ${className}`} style={style}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link href={`/${locale}`} className={styles.logoLink} aria-label={homeAriaLabel}>
            <Image
              src={logoSrc}
              alt="Labbely"
              width={132}
              height={32}
              className={styles.logo}
              priority
              sizes="132px"
            />
          </Link>
        </div>
        <div className={styles.actions}>
          <a
            href={githubHref}
            target="_blank"
            rel="noreferrer"
            className={styles.githubLink}
            aria-label={githubLabel}
          >
            <Github className="h-4 w-4" />
            <span>{githubLabel}</span>
          </a>
          <LanguageSwitcher />
          <Button asChild size="sm" className={styles.ctaButton}>
            <TrackedLink
              href={appHref}
              locale={localeCode}
              tracking={{ kind: "open_app", source: "header" }}
            >
              {navOpenLabel} <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </TrackedLink>
          </Button>
        </div>
      </div>
    </nav>
  );
}
