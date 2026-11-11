import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock3,
  FileText,
  Lock,
  MessageSquare,
  Paperclip,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";
import { PRIORITY_META, STATUS_META } from "@/lib/constants";
import { cn, daysUntil, formatBytes, formatDateTime, isOverdue } from "@/lib/utils";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const meta = STATUS_META[status] ?? STATUS_META.SUBMITTED;
  return (
    <Badge className={cn(meta.className, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} aria-hidden="true" />
      {meta.label}
    </Badge>
  );
}

export function PriorityBadge({ priority, className }: { priority: string; className?: string }) {
  const meta = PRIORITY_META[priority] ?? PRIORITY_META.MEDIUM;
  return (
    <Badge className={cn(meta.className, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} aria-hidden="true" />
      {meta.label} priority
    </Badge>
  );
}

export function OverdueBadge({ grievance }: { grievance: { status: string; dueAt: Date | string } }) {
  if (!isOverdue(grievance)) return null;
  return (
    <Badge className="bg-rose-50 text-rose-800 ring-rose-200">
      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
      Overdue
    </Badge>
  );
}

export function DueHint({ dueAt, status }: { dueAt: Date | string; status: string }) {
  if (status === "RESOLVED") {
    return <span className="text-xs text-muted">Closed</span>;
  }
  const days = daysUntil(dueAt);
  if (days < 0) {
    return <span className="text-xs font-semibold text-rose-700">{Math.abs(days)}d overdue</span>;
  }
  if (days === 0) return <span className="text-xs font-semibold text-amber-700">Due today</span>;
  return <span className="text-xs text-muted">Due in {days}d</span>;
}

export function Avatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const letters = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <span
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-800",
        className,
      )}
      aria-hidden="true"
    >
      {letters}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "brand",
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "brand" | "amber" | "rose" | "emerald" | "slate" | "indigo";
  href?: string;
}) {
  const tones: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    emerald: "bg-emerald-50 text-emerald-700",
    slate: "bg-slate-100 text-slate-600",
    indigo: "bg-indigo-50 text-indigo-700",
  };

  const content = (
    <div className="card card-pad flex items-start justify-between gap-4 transition hover:border-brand-200 hover:shadow-card">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
        <p className="mt-2 font-display text-3xl font-semibold leading-none text-ink">{value}</p>
        {hint ? <p className="mt-2 text-[11px] leading-5 text-muted">{hint}</p> : null}
      </div>
      {Icon ? (
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", tones[tone])}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      ) : null}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  light = false,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  light?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2
        className={cn(
          "mt-4 text-3xl font-semibold leading-tight sm:text-[38px]",
          light ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p className={cn("mt-4 text-[15px] leading-7", light ? "text-brand-100/80" : "text-muted")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 border-b border-line pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-[34px]">{title}</h1>
        {description ? <p className="mt-2.5 text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({
  icon: Icon = FileText,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm leading-6 text-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

const HISTORY_ICONS: Record<string, LucideIcon> = {
  CREATED: FileText,
  STATUS_CHANGE: ArrowRight,
  ASSIGNMENT: UserRound,
  REMARK: MessageSquare,
  ESCALATION: ShieldAlert,
  RESOLUTION: CheckCircle2,
  AI_ANALYSIS: Sparkles,
  FEEDBACK: Star,
  REOPEN: RotateCcw,
};

export type TimelineEntry = {
  id: string;
  type: string;
  title: string;
  note: string | null;
  status?: string | null;
  isInternal?: boolean;
  actorName: string;
  actorRole: string;
  createdAt: Date | string;
};

export function Timeline({ entries, compact = false }: { entries: TimelineEntry[]; compact?: boolean }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted">No activity recorded yet.</p>;
  }

  return (
    <ol className="relative space-y-0">
      {entries.map((entry, index) => {
        const Icon = HISTORY_ICONS[entry.type] ?? Circle;
        const isLast = index === entries.length - 1;
        const actorLabel =
          entry.actorName === "AI Grievance Assistant"
            ? "AI Grievance Assistant"
            : entry.actorRole === "CMO_ADMIN"
              ? "Chief Minister's Office"
              : entry.actorRole === "OFFICER"
                ? "Department officer"
                : "Citizen";
        return (
          <li key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast ? (
              <span className="absolute left-[15px] top-8 h-[calc(100%-20px)] w-px bg-line" aria-hidden="true" />
            ) : null}
            <span
              className={cn(
                "relative z-10 mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border bg-white",
                entry.isInternal ? "border-amber-200 text-amber-700" : "border-brand-200 text-brand-700",
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-sm font-semibold text-ink">{entry.title}</p>
                {entry.isInternal ? (
                  <Badge className="bg-amber-50 text-amber-800 ring-amber-200">
                    <Lock className="h-2.5 w-2.5" aria-hidden="true" />
                    Internal
                  </Badge>
                ) : null}
              </div>
              <p className="mt-0.5 text-[11px] text-muted">
                {formatDateTime(entry.createdAt)} · {actorLabel}
                {entry.actorName !== "AI Grievance Assistant" ? ` · ${entry.actorName}` : ""}
              </p>
              {entry.note && !compact ? (
                <p className="mt-2 whitespace-pre-line text-[13px] leading-6 text-ink/80">{entry.note}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function Pagination({
  page,
  totalPages,
  basePath,
  params,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const href = (target: number) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value) query.set(key, value);
    }
    if (target > 1) query.set("page", String(target));
    const suffix = query.toString();
    return suffix ? `${basePath}?${suffix}` : basePath;
  };

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (target) => target === 1 || target === totalPages || Math.abs(target - page) <= 1,
  );

  return (
    <nav className="flex items-center justify-between gap-3 pt-5" aria-label="Pagination">
      <p className="text-xs text-muted">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        {page > 1 ? (
          <Link href={href(page - 1)} className="btn btn-secondary btn-sm">
            Previous
          </Link>
        ) : null}
        <div className="hidden items-center gap-1 sm:flex">
          {pages.map((target, index) => (
            <span key={target} className="flex items-center gap-1">
              {index > 0 && target - pages[index - 1] > 1 ? <span className="px-1 text-xs text-muted">…</span> : null}
              <Link
                href={href(target)}
                aria-current={target === page ? "page" : undefined}
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full text-xs font-semibold transition",
                  target === page
                    ? "bg-brand-700 text-white"
                    : "border border-line bg-white text-ink hover:bg-brand-50",
                )}
              >
                {target}
              </Link>
            </span>
          ))}
        </div>
        {page < totalPages ? (
          <Link href={href(page + 1)} className="btn btn-secondary btn-sm">
            Next
          </Link>
        ) : null}
      </div>
    </nav>
  );
}

export function RatingStars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={cn("h-4 w-4", value <= rating ? "fill-gold-300 text-gold-500" : "text-line")}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export function AttachmentList({
  attachments,
  emptyText = "No supporting files attached.",
}: {
  attachments: { id: string; filename: string; mimeType: string; size: number }[];
  emptyText?: string;
}) {
  if (attachments.length === 0) {
    return <p className="text-sm text-muted">{emptyText}</p>;
  }
  return (
    <ul className="space-y-2">
      {attachments.map((attachment) => (
        <li key={attachment.id}>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-canvas/50 px-3.5 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-brand-700 ring-1 ring-line">
                <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-ink">{attachment.filename}</p>
                <p className="text-[10px] text-muted">
                  {attachment.mimeType.split("/")[1]?.toUpperCase()} · {formatBytes(attachment.size)}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <a
                href={`/api/attachments/${attachment.id}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg px-2 py-1 text-[11px] font-semibold text-brand-800 hover:bg-brand-50"
              >
                View
              </a>
              <a
                href={`/api/attachments/${attachment.id}?download=1`}
                className="rounded-lg px-2 py-1 text-[11px] font-semibold text-brand-800 hover:bg-brand-50"
              >
                Download
              </a>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function InfoRow({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5 py-2.5", className)}>
      <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">{label}</dt>
      <dd className="text-[13px] font-medium text-ink">{children}</dd>
    </div>
  );
}

export function DeadlineNote({ dueAt, status }: { dueAt: Date | string; status: string }) {
  if (status === "RESOLVED") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        Resolved
      </span>
    );
  }
  const days = daysUntil(dueAt);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        days < 0 ? "text-rose-700" : days <= 2 ? "text-amber-700" : "text-muted",
      )}
    >
      <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
      {days < 0 ? `${Math.abs(days)} days overdue` : days === 0 ? "Due today" : `${days} days remaining`}
    </span>
  );
}
