import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("grid h-10 w-10 place-items-center rounded-xl bg-brand-800 text-white shadow-sm", className)}>
      <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
        <circle cx="16" cy="13.5" r="5.5" fill="none" stroke="#e2ba68" strokeWidth="1.6" />
        <path d="M12 17.2c1.2 1.1 2.5 1.7 4 1.7s2.8-.6 4-1.7" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M16 8v4.5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M10.5 23.5h11" stroke="#e2ba68" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function Brand({
  href = "/",
  variant = "dark",
  compact = false,
}: {
  href?: string;
  variant?: "dark" | "light";
  compact?: boolean;
}) {
  return (
    <Link href={href} className="group flex items-center gap-3">
      <BrandMark className="transition-transform duration-200 group-hover:-rotate-3" />
      <span className="flex flex-col leading-tight">
        <span
          className={cn(
            "font-display text-[17px] font-semibold tracking-tight",
            variant === "dark" ? "text-ink" : "text-white",
          )}
        >
          CM Kerala
        </span>
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.14em]",
            variant === "dark" ? "text-muted" : "text-brand-100/80",
          )}
        >
          {compact ? "Grievance Portal" : "Grievance Redressal"}
        </span>
      </span>
    </Link>
  );
}
