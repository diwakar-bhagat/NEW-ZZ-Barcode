import Image from "next/image";
import type React from "react";
import { Printer, Search, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import { LandingContainer } from "./LandingContainer";
import { LandingSection } from "./LandingSection";
import { LandingCard } from "./LandingCard";

import styles from "./LandingFeatures.module.css";
import type { LandingFeaturesProps, LandingFeatureIconKey } from "./types";

const FEATURE_ICONS: Record<LandingFeatureIconKey, React.ComponentType<{ className?: string }>> = {
  printer: Printer,
  search: Search,
  zap: Zap,
};

export function LandingFeatures({
  title,
  subtitle,
  features,
  className = "",
  style,
}: LandingFeaturesProps) {
  return (
    <LandingSection className={cn(styles.features, className)} style={style} linesVariant="b">
      <LandingContainer>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </header>
        <div className={styles.grid}>
          {features.map((feature, i) => {
            const Icon = feature.iconKey ? FEATURE_ICONS[feature.iconKey] : null;
            return (
              <LandingCard key={i} className={styles.card} padding="lg">
                <div className={styles.cardHeader}>
                  <div className={cn(styles.cardIcon, feature.iconClassName)}>
                    {Icon && <Icon className="h-5 w-5" />}
                  </div>
                  <h3 className={styles.cardTitle}>{feature.title}</h3>
                </div>
                <p className={styles.cardDescription}>{feature.description}</p>
                <div className={styles.cardImageWrap}>
                  <Image
                    src={feature.imageSrc}
                    alt={feature.imageAlt}
                    className={styles.cardImage}
                    width={feature.imageWidth ?? 400}
                    height={feature.imageHeight ?? 300}
                    loading="lazy"
                    sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
                  />
                </div>
              </LandingCard>
            );
          })}
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
