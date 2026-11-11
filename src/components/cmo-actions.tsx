"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  MessageSquarePlus,
  Send,
  ShieldAlert,
  Undo2,
  UserRound,
} from "lucide-react";

type DepartmentOption = {
  id: string;
  name: string;
  officers: { id: string; name: string; designation: string | null }[];
};

function Feedback({ message, error }: { message: string; error: string }) {
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

async function postAction(url: string, body: unknown, method: "POST" | "PATCH" = "POST") {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error ?? "The action could not be completed.");
  }
  return { message: payload?.data?.message as string | undefined };
}

export function AssignForm({
  grievanceId,
  departments,
  currentDepartmentId,
  currentOfficerId,
  currentDueAt,
}: {
  grievanceId: string;
  departments: DepartmentOption[];
  currentDepartmentId: string | null;
  currentOfficerId: string | null;
  currentDueAt: string;
}) {
  const router = useRouter();
  const [departmentId, setDepartmentId] = useState(currentDepartmentId ?? "");
  const [officerId, setOfficerId] = useState(currentOfficerId ?? "");
  const [note, setNote] = useState("");
  const [dueAt, setDueAt] = useState(currentDueAt.slice(0, 10));
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const officers = useMemo(
    () => departments.find((department) => department.id === departmentId)?.officers ?? [],
    [departments, departmentId],
  );

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    setError("");
    if (!departmentId) {
      setError("Select a department to forward this grievance.");
      setPending(false);
      return;
    }
    try {
      const data = await postAction(`/api/grievances/${grievanceId}/assign`, {
        departmentId,
        officerId: officerId || undefined,
        note: note.trim() || undefined,
        dueAt: dueAt ? new Date(`${dueAt}T12:00:00+05:30`).toISOString() : undefined,
      });
      setMessage(data.message ?? "Grievance forwarded.");
      setNote("");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label htmlFor="assign-department" className="label">Department</label>
        <select
          id="assign-department"
          value={departmentId}
          onChange={(event) => {
            setDepartmentId(event.target.value);
            setOfficerId("");
          }}
          className="select text-[12px]"
        >
          <option value="">Select department</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>{department.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="assign-officer" className="label">Assign officer (optional)</label>
        <select
          id="assign-officer"
          value={officerId}
          onChange={(event) => setOfficerId(event.target.value)}
          className="select text-[12px]"
          disabled={!departmentId || officers.length === 0}
        >
          <option value="">{officers.length === 0 ? "Department queue (unassigned)" : "Any officer in the queue"}</option>
          {officers.map((officer) => (
            <option key={officer.id} value={officer.id}>
              {officer.name}{officer.designation ? ` — ${officer.designation}` : ""}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="assign-due" className="label">Revised target date</label>
        <input
          id="assign-due"
          type="date"
          value={dueAt}
          onChange={(event) => setDueAt(event.target.value)}
          className="input text-[12px]"
        />
      </div>
      <div>
        <label htmlFor="assign-note" className="label">Forwarding note</label>
        <textarea
          id="assign-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Instructions for the department (visible in the official record)…"
          className="textarea min-h-16 text-[12px]"
        />
      </div>
      <Feedback message={message} error={error} />
      <button type="submit" disabled={pending} className="btn btn-primary btn-sm w-full">
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Send className="h-3.5 w-3.5" aria-hidden="true" />}
        {pending ? "Forwarding…" : currentDepartmentId ? "Reassign grievance" : "Forward to department"}
      </button>
    </form>
  );
}

export function RemarkForm({ grievanceId }: { grievanceId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [internal, setInternal] = useState(true);
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
      const data = await postAction(`/api/grievances/${grievanceId}/remarks`, {
        note: note.trim(),
        visibleToCitizen: !internal,
      });
      setMessage(data.message ?? "Remark recorded.");
      setNote("");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
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
        placeholder="Record a decision, instruction or observation…"
        className="textarea min-h-20 text-[12px]"
      />
      <label className="flex items-start gap-2 text-[11px] leading-4 text-muted">
        <input
          type="checkbox"
          checked={internal}
          onChange={(event) => setInternal(event.target.checked)}
          className="mt-0.5 h-3.5 w-3.5 accent-brand-700"
        />
        <span>
          <span className="inline-flex items-center gap-1 font-semibold text-ink">
            <Lock className="h-3 w-3" aria-hidden="true" />
            Internal only
          </span>{" "}
          — hide from the citizen timeline.
        </span>
      </label>
      <Feedback message={message} error={error} />
      <button type="submit" disabled={pending} className="btn btn-secondary btn-sm w-full">
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden="true" />}
        {pending ? "Saving…" : "Add official remark"}
      </button>
    </form>
  );
}

export function EscalateForm({ grievanceId, escalationLevel }: { grievanceId: string; escalationLevel: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (reason.trim().length < 5) {
      setError("Explain why this case is being escalated.");
      return;
    }
    setPending(true);
    setMessage("");
    setError("");
    try {
      const data = await postAction(`/api/grievances/${grievanceId}/escalate`, { reason: reason.trim() });
      setMessage(data.message ?? "Case escalated.");
      setReason("");
      setOpen(false);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <div className="space-y-2">
        <Feedback message={message} error="" />
        <button type="button" onClick={() => setOpen(true)} className="btn btn-secondary btn-sm w-full">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
          Escalate case {escalationLevel > 0 ? `(level ${escalationLevel})` : ""}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <p className="rounded-lg bg-amber-50 px-2.5 py-2 text-[10.5px] leading-4 text-amber-900/80">
        Escalation raises the priority level and is recorded as an internal action. Use it when a
        department is delayed or the issue is deteriorating.
      </p>
      <textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        rows={2}
        maxLength={500}
        placeholder="Reason for escalation…"
        className="textarea min-h-16 text-[12px]"
      />
      <Feedback message="" error={error} />
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn btn-sm flex-1 bg-amber-700 text-white hover:bg-amber-800">
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />}
          {pending ? "Escalating…" : "Confirm escalation"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary btn-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function ReviewForm({ grievanceId }: { grievanceId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [pending, setPending] = useState<"APPROVE" | "REOPEN" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(action: "APPROVE" | "REOPEN") {
    if (action === "REOPEN" && note.trim().length < 5) {
      setError("Add a reason before rejecting the resolution.");
      return;
    }
    setPending(action);
    setMessage("");
    setError("");
    try {
      const data = await postAction(`/api/grievances/${grievanceId}/review`, {
        action,
        note: note.trim() || undefined,
      });
      setMessage(data.message ?? "Resolution reviewed.");
      setNote("");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-2.5">
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        rows={2}
        maxLength={1000}
        placeholder="Review note — required if you reject the report…"
        className="textarea min-h-16 text-[12px]"
      />
      <Feedback message={message} error={error} />
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => submit("APPROVE")}
          disabled={pending !== null}
          className="btn btn-sm bg-emerald-700 text-white hover:bg-emerald-800"
        >
          {pending === "APPROVE" ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />}
          Confirm resolved
        </button>
        <button type="button" onClick={() => submit("REOPEN")} disabled={pending !== null} className="btn btn-danger btn-sm">
          {pending === "REOPEN" ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />}
          Reject & reopen
        </button>
      </div>
      <p className="text-[10px] leading-4 text-muted">
        Approving marks the grievance Resolved and notifies the citizen. Rejecting returns it to the
        department with your reason.
      </p>
    </div>
  );
}

export function StatusForm({ grievanceId, currentStatus }: { grievanceId: string; currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!status) {
      setError("Choose a status.");
      return;
    }
    setPending(true);
    setMessage("");
    setError("");
    try {
      const data = await postAction(
        `/api/grievances/${grievanceId}/status`,
        { status, note: note.trim() || undefined },
        "PATCH",
      );
      setMessage(data.message ?? "Status updated.");
      setNote("");
      setStatus("");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <div>
        <label htmlFor="cmo-status" className="label">Move to status</label>
        <select id="cmo-status" value={status} onChange={(event) => setStatus(event.target.value)} className="select text-[12px]">
          <option value="">Select status</option>
          <option value="UNDER_REVIEW" disabled={currentStatus === "UNDER_REVIEW"}>Under Review</option>
          <option value="IN_PROGRESS" disabled={currentStatus === "IN_PROGRESS"}>In Progress</option>
          <option value="REOPENED" disabled={currentStatus === "REOPENED"}>Reopened</option>
        </select>
      </div>
      <input
        value={note}
        onChange={(event) => setNote(event.target.value)}
        maxLength={1000}
        placeholder="Reason for the change (optional)"
        className="input text-[12px]"
      />
      <Feedback message={message} error={error} />
      <button type="submit" disabled={pending} className="btn btn-secondary btn-sm w-full">
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
        {pending ? "Updating…" : "Update status"}
      </button>
      <p className="text-[10px] leading-4 text-muted">
        Resolution is confirmed through the action-taken review, not a manual status change.
      </p>
    </form>
  );
}

export function OfficerBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-800">
      <UserRound className="h-3 w-3" aria-hidden="true" />
      {name}
    </span>
  );
}
