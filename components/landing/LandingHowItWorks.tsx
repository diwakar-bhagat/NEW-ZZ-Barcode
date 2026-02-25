"use client";

import { cn } from "@/lib/utils";
import { LandingContainer } from "./LandingContainer";
import { LandingSection } from "./LandingSection";
import { LandingKicker } from "./LandingKicker";

import styles from "./LandingHowItWorks.module.css";
import type { LandingHowItWorksProps } from "./types";

export function LandingHowItWorks({
  processLabel,
  title,
  subtitle,
  steps,
  className = "",
  style,
}: LandingHowItWorksProps) {
  return (
    <LandingSection className={cn(styles.howItWorks, className)} style={style} linesVariant="none">
      <LandingContainer>
        <header className={styles.header}>
          <LandingKicker>{processLabel}</LandingKicker>
          <div className={styles.headerGrid}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>
        </header>
        <div className={styles.stepsOnly}>
          {steps.map((step, i) => (
            <div key={i} className={styles.step}>
              <div className={styles.stepHeader}>
                <span className={styles.stepIndex}>0{step.number}</span>
                <div className={styles.stepRule} />
              </div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
            </div>
          ))}
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
