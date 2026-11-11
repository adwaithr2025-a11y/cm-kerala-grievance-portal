"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Copy,
  Loader2,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import { StatusBadge, PriorityBadge, Timeline, type TimelineEntry } from "@/components/ui";
import { formatDate, formatDateTime } from "@/lib/utils";

type TrackedGrievance = {
  referenceNo: string;
  subject: string;
  description: string;
  category: string;
  district: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  dueAt: string;
  escalationLevel: number;
  resolvedAt: string | null;
  reopenedAt: string | null;
  resolutionReport: string | null;
  department: { name: string; code: string } | null;
  history: TimelineEntry[];
  feedback: { rating: number; comments: string | null; createdAt: string } | null;
  isOverdue: boolean;
};

export function TrackForm({ initialReference }: { initialReference?: string }) {
  const [reference, setReference] = useState(initialReference ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackedGrievance | null>(null);
  const [copied, setCopied] = useState(false);

  const lookup = useCallback(async (raw: string) => {
    const clean = raw.trim().toUpperCase();
    if (!clean) {
      setError("Enter the reference number from your submission.");
      return;
    }
    setPending(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch(`/api/track/${encodeURIComponent(clean)}`, { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload?.error ?? "No grievance was found for this reference number.");
        return;
      }
      setResult((payload?.data?.grievance ?? null) as TrackedGrievance | null);
      window.history.replaceState(null, "", `/track?ref=${encodeURIComponent(clean)}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }, []);

  useEffect(() => {
    if (initialReference) void lookup(initialReference);
  }, [initialReference, lookup]);

  async function copyReference() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.referenceNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void lookup(reference);
        }}
        className="card p-4 sm:p-5"
      >
        <label htmlFor="reference" className="label">Grievance reference number</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              id="reference"
              value={reference}
              onChange={(event) => setReference(event.target.value.toUpperCase())}
              placeholder="KLG-2026-ABC123"
              autoComplete="off"
              spellCheck={false}
              className="input pl-10 font-mono tracking-wide"
              aria-invalid={Boolean(error)}
            />
          </div>
          <button type="submit" disabled={pending} className="btn btn-primary sm:w-44">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
            {pending ? "Searching…" : "Track grievance"}
          </button>
        </div>
        <p className="hint">Reference numbers look like KLG-2026-8KQ4M2. Tracking does not require a password.</p>
      </form>

      {error ? (
        <div role="alert" className="mt-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-700" aria-hidden="true" />
          <div>
            <p className="text-[13px] font-semibold text-rose-900">We couldn&apos;t find that grievance</p>
            <p className="mt-0.5 text-[12px] leading-5 text-rose-800/80">{error}</p>
          </div>
        </div>
      ) : null}

      {result ? (
        <div className="mt-6 space-y-5">
          <div className="card overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line bg-canvas/50 px-5 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Grievance reference</p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="font-mono text-lg font-bold tracking-wide text-brand-900">{result.referenceNo}</p>
                  <button type="button" onClick={copyReference} className="rounded-lg p-1.5 text-muted transition hover:bg-brand-50 hover:text-brand-800" aria-label="Copy reference number">
                    {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={result.status} />
                <PriorityBadge priority={result.priority} />
                {result.isOverdue ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-semibold text-rose-800 ring-1 ring-inset ring-rose-200">
                    <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                    Overdue
                  </span>
                ) : null}
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <h2 className="text-xl font-semibold leading-snug">{result.subject}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-muted">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {result.district}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {result.department ? result.department.name : "Awaiting department assignment"}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  Submitted {formatDate(result.createdAt)}
                </span>
              </div>

              <div className="mt-4 grid gap-3 rounded-xl border border-line bg-canvas/40 p-4 sm:grid-cols-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Category</p>
                  <p className="mt-0.5 text-[12.5px] font-semibold">{result.category}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Target date</p>
                  <p className="mt-0.5 text-[12.5px] font-semibold">{formatDate(result.dueAt)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
                    {result.status === "RESOLVED" ? "Resolved on" : "Last updated"}
                  </p>
                  <p className="mt-0.5 text-[12.5px] font-semibold">
                    {result.status === "RESOLVED" ? formatDate(result.resolvedAt) : formatDate(result.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Complaint summary</p>
                <p className="mt-1.5 whitespace-pre-line text-[13px] leading-6 text-ink/85">{result.description}</p>
              </div>

              {result.resolutionReport ? (
                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Department action-taken report
                  </p>
                  <p className="mt-1.5 whitespace-pre-line text-[12.5px] leading-6 text-emerald-950/80">{result.resolutionReport}</p>
                </div>
              ) : null}

              {result.escalationLevel > 0 ? (
                <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[11.5px] font-medium text-amber-800">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  This case has been escalated to level {result.escalationLevel} by the CMO office.
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="card p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-semibold">Activity timeline</h3>
                <span className="text-[10.5px] text-muted">{result.history.length} public updates</span>
              </div>
              <p className="mt-1 text-[11.5px] leading-5 text-muted">
                Internal government notes are not shown here. All timestamps are in IST.
              </p>
              <div className="mt-5">
                <Timeline entries={result.history} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="card p-5">
                <h3 className="text-[14px] font-semibold">What happens next?</h3>
                <ul className="mt-3 space-y-3 text-[12px] leading-5 text-muted">
                  {result.status === "RESOLVED" ? (
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                      The case is closed. Sign in to rate the resolution or reopen it with a reason if the issue persists.
                    </li>
                  ) : (
                    <>
                      <li className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden="true" />
                        The responsible department investigates and records updates on this page.
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden="true" />
                        The CMO office reviews the action-taken report before marking the case resolved.
                      </li>
                    </>
                  )}
                </ul>
                <Link href="/login" className="btn btn-secondary btn-sm mt-4 w-full">
                  Open my dashboard
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              {result.feedback ? (
                <div className="card p-5">
                  <h3 className="text-[14px] font-semibold">Citizen feedback</h3>
                  <p className="mt-1 text-[12px] text-muted">Rated {result.feedback.rating} out of 5</p>
                  {result.feedback.comments ? (
                    <p className="mt-2 rounded-lg bg-canvas px-3 py-2 text-[12px] leading-5 text-ink/80">
                      “{result.feedback.comments}”
                    </p>
                  ) : null}
                  <p className="mt-2 text-[10.5px] text-muted">{formatDateTime(result.feedback.createdAt)}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
