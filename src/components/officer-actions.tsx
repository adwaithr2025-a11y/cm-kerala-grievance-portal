"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  Loader2,
  MessageSquarePlus,
  PlayCircle,
} from "lucide-react";

function Notice({ message, error }: { message: string; error: string }) {
  if (error) {
    return (
      <p role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] leading-5 text-rose-900">
        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
        {error}
      </p>
    );
  }
  if (message) {
    return (
      <p className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] leading-5 text-emerald-900">
        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
        {message}
      </p>
    );
  }
  return null;
}

export function StartProgressButton({ grievanceId, disabled }: { grievanceId: string; disabled: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function start() {
    setPending(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`/api/grievances/${grievanceId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "IN_PROGRESS", note: "Investigation started by the department officer." }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data?.error ?? "Could not update the status.");
        return;
      }
      setMessage(data.message ?? "Grievance marked In Progress.");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (disabled) {
    return (
      <p className="rounded-lg bg-brand-50 px-3 py-2 text-[11px] font-medium text-brand-800">
        Investigation is already in progress. Record updates below.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={start} disabled={pending} className="btn btn-primary btn-sm w-full">
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <PlayCircle className="h-3.5 w-3.5" aria-hidden="true" />}
        {pending ? "Starting…" : "Mark investigation started"}
      </button>
      <Notice message={message} error={error} />
    </div>
  );
}

export function InvestigationRemarkForm({ grievanceId }: { grievanceId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (note.trim().length < 2) {
      setError("Write a remark before saving.");
      return;
    }
    setPending(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`/api/grievances/${grievanceId}/remarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note.trim(), visibleToCitizen: true }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data?.error ?? "Could not save the remark.");
        return;
      }
      setMessage("Investigation remark added to the public timeline.");
      setNote("");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="e.g. Site inspected on 12 Nov with the assistant engineer. Estimate prepared for slab replacement."
        className="textarea min-h-20 text-[12px]"
      />
      <p className="text-[10px] leading-4 text-muted">
        Department remarks are visible to the citizen and the CMO office.
      </p>
      <Notice message={message} error={error} />
      <button type="submit" disabled={pending} className="btn btn-secondary btn-sm w-full">
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden="true" />}
        {pending ? "Saving…" : "Add investigation update"}
      </button>
    </form>
  );
}

export function ResolutionForm({
  grievanceId,
  awaitingReview,
}: {
  grievanceId: string;
  awaitingReview: boolean;
}) {
  const router = useRouter();
  const [report, setReport] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (report.trim().length < 20) {
      setError("Describe the action taken in at least 20 characters.");
      return;
    }
    setPending(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`/api/grievances/${grievanceId}/resolution`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report: report.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data?.error ?? "Could not submit the report.");
        return;
      }
      setMessage(data.message ?? "Action-taken report submitted.");
      setReport("");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (awaitingReview) {
    return (
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3.5">
        <p className="text-[12px] font-semibold text-indigo-950">Report submitted — awaiting CMO review</p>
        <p className="mt-1 text-[11px] leading-5 text-indigo-900/70">
          The CMO office will confirm or reject the resolution. If rejected, the case returns here
          and you can submit a revised report.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <p className="text-[10.5px] leading-4 text-muted">
        Describe what was done, when, by whom and the result. The case stays In Progress until the
        CMO verifies this report.
      </p>
      <textarea
        value={report}
        onChange={(event) => setReport(event.target.value)}
        rows={5}
        maxLength={4000}
        placeholder="e.g. The damaged slab was replaced on 14 Nov by the section contractor. Kerb stones were reset and the drain covered with a reinforced slab. Site handed over to the school authorities."
        className="textarea min-h-32 text-[12px]"
      />
      <Notice message={message} error={error} />
      <button type="submit" disabled={pending} className="btn btn-primary btn-sm w-full">
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <FileCheck2 className="h-3.5 w-3.5" aria-hidden="true" />}
        {pending ? "Submitting report…" : "Submit action-taken report"}
      </button>
    </form>
  );
}
