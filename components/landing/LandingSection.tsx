import type React from "react";
import { cn } from "@/lib/utils";
import styles from "./LandingSection.module.css";

type LandingSectionProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  spacing?: "default" | "sm" | "lg" | "none";
  linesVariant?: "a" | "b" | "c" | "none";
};

export function LandingSection({
  children,
  className,
  style,
  id,
  spacing = "default",
  linesVariant = "a",
}: LandingSectionProps) {
  return (
    <section
      id={id}
      style={style}
      className={cn(
        styles.section,
        linesVariant === "a" && styles.linesA,
        linesVariant === "b" && styles.linesB,
        linesVariant === "c" && styles.linesC,
        spacing === "default" && "py-16 sm:py-20 lg:py-28",
        spacing === "sm" && "py-12 sm:py-16 lg:py-20",
        spacing === "lg" && "py-20 sm:py-28 lg:py-36",
        spacing === "none" && "py-0",
        className
      )}
    >
      {children}
    </section>
  );
}
