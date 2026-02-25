import { cn } from "@/lib/utils";

type LandingPillProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "soft";
};

export function LandingPill({ children, className, variant = "soft" }: LandingPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors",
        variant === "default" && "bg-slate-900 text-white",
        variant === "outline" && "border border-slate-200 bg-white text-slate-900",
        variant === "soft" && "bg-slate-50 text-slate-900 border border-slate-200/50",
        className
      )}
    >
      {children}
    </span>
  );
}
