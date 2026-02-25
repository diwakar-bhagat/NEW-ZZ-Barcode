import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LandingContainer } from "./LandingContainer";
import { LandingSection } from "./LandingSection";
import { LandingPill } from "./LandingPill";

import styles from "./LandingOpenSource.module.css";
import type { LandingOpenSourceProps } from "./types";

export function LandingOpenSource({
  badgeLabel,
  title,
  description,
  primaryCta,
  secondaryCta,
  credits,
  githubHref,
  appHref,
  className = "",
  style,
}: LandingOpenSourceProps) {
  return (
    <LandingSection className={`${styles.openSource} ${className}`} style={style} linesVariant="none">
      <LandingContainer size="narrow">
        <div className={styles.card}>
          <div className={styles.content}>
            <LandingPill variant="outline" className={styles.badge}>
              <Github className="h-3.5 w-3.5" />
              {badgeLabel}
            </LandingPill>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.description}>{description}</p>
            <div className={styles.ctas}>
              <Button asChild size="lg" variant="default" className={styles.primaryBtn}>
                <a href={githubHref} target="_blank" rel="noreferrer">
                  <Github className="mr-2 h-5 w-5" />
                  {primaryCta}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className={styles.secondaryBtn}>
                <Link href={appHref}>
                  {secondaryCta} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className={styles.credits}>{credits}</p>
          </div>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
