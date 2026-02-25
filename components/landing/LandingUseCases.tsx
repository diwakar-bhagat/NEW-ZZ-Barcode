import Image from "next/image";
import type React from "react";
import { BarChart3, Package } from "lucide-react";

import { cn } from "@/lib/utils";
import { LandingContainer } from "./LandingContainer";
import { LandingSection } from "./LandingSection";
import { LandingCard } from "./LandingCard";

import styles from "./LandingUseCases.module.css";
import type { LandingUseCasesProps, LandingUseCaseIconKey } from "./types";

const USE_CASE_ICONS: Record<LandingUseCaseIconKey, React.ComponentType<{ className?: string }>> = {
  package: Package,
  barChart3: BarChart3,
};

export function LandingUseCases({
  title,
  subtitle,
  cases,
  className = "",
  style,
}: LandingUseCasesProps) {
  return (
    <LandingSection className={cn(styles.useCases, className)} style={style} linesVariant="none">
      <LandingContainer>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </header>
        <div className={styles.grid}>
          {cases.map((item, i) => {
            const Icon = item.iconKey ? USE_CASE_ICONS[item.iconKey] : null;
            return (
              <LandingCard key={i} className={styles.card} padding="none">
                <div className={styles.cardImage}>
                  <Image
                    src={item.imageSrc}
                    alt={item.imageAlt}
                    className={styles.cardPhoto}
                    width={item.imageWidth ?? 600}
                    height={item.imageHeight ?? 400}
                    loading="lazy"
                    sizes="(min-width: 768px) 42vw, 90vw"
                  />
                </div>
                <div className={styles.cardContent}>
                  <div className={cn(styles.cardIcon, item.iconBgClass)}>
                    {Icon && <Icon className="h-5 w-5" />}
                  </div>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardDescription}>{item.description}</p>
                </div>
              </LandingCard>
            );
          })}
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
