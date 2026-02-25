
"use client";

import Link from "next/link";

import { LandingContainer } from "./LandingContainer";
import { LandingSection } from "./LandingSection";
import { LandingKicker } from "./LandingKicker";

import styles from "./LandingResources.module.css";
import type { LandingResourcesProps } from "./types";

type ResourceLink = {
  slug: string;
  title: string;
  summary: string;
};

export function LandingResources({
  title,
  subtitle,
  description,
  resources,
  appLabel,
  appHref,
  connectLabel,
  connectHref,
  moreLabel,
  moreHref,
  className = "",
  style,
  onAppClick,
  onConnectClick,
}: LandingResourcesProps & {
  resources: ResourceLink[];
  connectLabel: string;
  connectHref: string;
  moreLabel: string;
  moreHref: string;
  appLabel: string;
  appHref: string;
  onAppClick?: () => void;
  onConnectClick?: () => void;
}) {
  return (
    <LandingSection className={`${styles.resources} ${className}`} style={style} spacing="lg" linesVariant="none">
      <LandingContainer>
        <LandingKicker>{title}</LandingKicker>
        <header className={styles.header}>
          <h2 className={styles.mainTitle}>{subtitle}</h2>
          <p className={styles.description}>{description}</p>
        </header>

        <ul className={styles.list}>
          {resources.map((resource) => (
            <li key={resource.slug} className={styles.item}>
              <article>
                <h3>{resource.title}</h3>
                <p>{resource.summary}</p>
                <Link href={resource.slug}>{moreLabel}</Link>
              </article>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <a href={appHref} className={styles.primaryAction} onClick={onAppClick}>
            {appLabel}
          </a>
          <a href={connectHref} className={styles.secondaryAction} onClick={onConnectClick}>
            {connectLabel}
          </a>
          <Link href={moreHref} className={styles.secondaryAction}>
            {moreLabel}
          </Link>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}

