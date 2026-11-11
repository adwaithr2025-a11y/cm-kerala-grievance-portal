"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Loader2, RotateCcw, Star } from "lucide-react";

export function FeedbackForm({ grievanceId }: { grievanceId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comments, setComments] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rating < 1) {
      setError("Choose a rating from 1 to 5 stars.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/grievances/${grievanceId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comments: comments.trim() || undefined }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data?.error ?? "Could not save your feedback.");
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
        <p className="text-[12.5px] leading-5 text-emerald-900">
          Thank you. Your feedback helps the CMO office measure the quality of resolutions.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <p className="text-[12px] leading-5 text-muted">
        The case is resolved. How satisfied are you with the outcome?
      </p>
      <div className="mt-2.5 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => {
          const active = value <= (hovered || rating);
          return (
            <button
              key={value}
              type="button"
              onMouseEnter={() => setHovered(value)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => {
                setRating(value);
                setError("");
              }}
              className="rounded p-0.5"
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              aria-pressed={rating === value}
            >
              <Star
                className={active ? "h-7 w-7 fill-gold-300 text-gold-500" : "h-7 w-7 text-line transition hover:text-gold-300"}
                aria-hidden="true"
              />
            </button>
          );
        })}
        <span className="ml-1 text-[11px] text-muted">{rating > 0 ? `${rating} / 5` : "Select a rating"}</span>
      </div>
      <textarea
        value={comments}
        onChange={(event) => setComments(event.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Anything the CMO office should know about the resolution? (optional)"
        className="textarea mt-3 min-h-20 text-[12px]"
      />
      {error ? <p className="field-error">{error}</p> : null}
      <button type="submit" disabled={pending} className="btn btn-primary btn-sm mt-3">
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
        {pending ? "Saving…" : "Submit feedback"}
      </button>
    </form>
  );
}

export function ReopenForm({ grievanceId }: { grievanceId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (reason.trim().length < 10) {
      setError("Explain in at least 10 characters why the issue is not resolved.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/grievances/${grievanceId}/reopen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data?.error ?? "Could not reopen the grievance.");
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" aria-hidden="true" />
        <p className="text-[12.5px] leading-5 text-amber-900">
          The grievance has been reopened and returned to the CMO office for further action.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-secondary btn-sm w-full">
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        Not satisfied? Reopen this grievance
      </button>
    );
  }

  return (
    <form onSubmit={submit}>
      <p className="text-[12px] leading-5 text-muted">
        Reopening returns the case to the CMO queue. Explain why the issue is not resolved.
      </p>
      <textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Example: The drain was covered with a temporary slab but the footpath is still broken."
        className="textarea mt-2.5 min-h-20 text-[12px]"
      />
      {error ? (
        <p className="field-error flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" aria-hidden="true" />
          {error}
        </p>
      ) : null}
      <div className="mt-3 flex gap-2">
        <button type="submit" disabled={pending} className="btn btn-danger btn-sm flex-1">
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />}
          {pending ? "Reopening…" : "Reopen grievance"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary btn-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}
