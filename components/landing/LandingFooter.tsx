import Image from "next/image";
import Link from "next/link";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { LandingContainer } from "./LandingContainer";

import styles from "./LandingFooter.module.css";
import type { LandingFooterProps } from "./types";

export function LandingFooter({
  logoSrc,
  locale: _locale,
  homeAriaLabel,
  tagline,
  productLabel,
  editorLabel,
  loginLabel,
  resourcesLabel,
  blogLabel,
  developersLabel,
  githubLabel,
  issuesLabel,
  languageLabel,
  copyright: copyrightText,
  appHref,
  loginHref,
  githubHref,
  issuesHref,
  resourcesHref,
  blogHref,
  className = "",
  style,
}: LandingFooterProps) {
  const localeCode = _locale === "en" ? "en" : "es";
  const localePrefix = _locale ? `/${_locale}` : "/";

  return (
    <footer className={`${styles.footer} ${className}`} style={style}>
      <LandingContainer>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link href={localePrefix} className={styles.logoLink} aria-label={homeAriaLabel}>
              <Image
                src={logoSrc}
                alt="Labbely"
                width={148}
                height={32}
                className={styles.logo}
                loading="lazy"
                sizes="148px"
              />
            </Link>
            <p className={styles.tagline}>{tagline}</p>
          </div>
          
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>{productLabel}</h3>
            <ul className={styles.linkList}>
              <li>
                <TrackedLink
                  href={appHref}
                  locale={localeCode}
                  tracking={{ kind: "open_app", source: "footer" }}
                  className={styles.link}
                >
                  {editorLabel}
                </TrackedLink>
              </li>
              <li>
                <Link href={resourcesHref} className={styles.link}>
                  {resourcesLabel}
                </Link>
              </li>
              <li>
                <Link href={blogHref} className={styles.link}>
                  {blogLabel}
                </Link>
              </li>
              <li>
                <TrackedLink
                  href={loginHref}
                  locale={localeCode}
                  tracking={{ kind: "connect_odoo", source: "footer" }}
                  className={styles.link}
                >
                  {loginLabel}
                </TrackedLink>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnTitle}>{developersLabel}</h3>
            <ul className={styles.linkList}>
              <li>
                <a href={githubHref} target="_blank" rel="noreferrer" className={styles.link}>
                  {githubLabel}
                </a>
              </li>
              <li>
                <a href={issuesHref} target="_blank" rel="noreferrer" className={styles.link}>
                  {issuesLabel}
                </a>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnTitle}>{languageLabel}</h3>
            <div className={styles.languageWrap}>
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        <div className={styles.copyright}>
          <span>{copyrightText}</span>
        </div>
      </LandingContainer>
    </footer>
  );
}
