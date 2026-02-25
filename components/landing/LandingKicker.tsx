import { cn } from "@/lib/utils";

type LandingKickerProps = {
  children: React.ReactNode;
  className?: string;
};

export function LandingKicker({ children, className }: LandingKickerProps) {
  return (
    <span
      className={cn(
        "inline-block text-xs font-medium uppercase tracking-wide text-slate-500",
        className
      )}
    >
      {children}
    </span>
  );
}
