import type React from "react";
import { cn } from "@/lib/utils";

type LandingFloatingCardProps = {
  children: React.ReactNode;
  className?: string;
  position?: string;
};

export function LandingFloatingCard({
  children,
  className,
  position,
}: LandingFloatingCardProps) {
  return (
    <div
      className={cn(
        "absolute rounded-xl border border-slate-200/80 bg-white/95 p-3.5 shadow-lg backdrop-blur-sm",
        position,
        className
      )}
    >
      {children}
    </div>
  );
}
