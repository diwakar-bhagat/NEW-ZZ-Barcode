import type React from "react";
import { cn } from "@/lib/utils";

type LandingCardProps = {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
};

export function LandingCard({
  children,
  className,
  hover = true,
  padding = "md",
}: LandingCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/60 bg-white shadow-sm",
        hover && "transition-all duration-200 hover:shadow-md",
        padding === "none" && "p-0",
        padding === "sm" && "p-4",
        padding === "md" && "p-6",
        padding === "lg" && "p-8",
        className
      )}
    >
      {children}
    </div>
  );
}
