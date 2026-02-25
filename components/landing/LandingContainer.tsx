import type React from "react";
import { cn } from "@/lib/utils";

type LandingContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "aside";
  size?: "default" | "narrow" | "wide";
};

export function LandingContainer({
  children,
  className,
  as: Component = "div",
  size = "default",
}: LandingContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full",
        size === "narrow" && "max-w-4xl",
        size === "default" && "max-w-7xl",
        size === "wide" && "max-w-[1400px]",
        "px-6 sm:px-8 lg:px-10",
        className
      )}
    >
      {children}
    </Component>
  );
}
