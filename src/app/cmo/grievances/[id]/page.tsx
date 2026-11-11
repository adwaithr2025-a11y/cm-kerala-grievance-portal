import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Bot,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  History,
  Mail,
  MapPin,
  Paperclip,
  Phone,
  ShieldAlert,
  Sparkles,
  UserRound,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requirePageUser } from "@/lib/auth";
import { getGrievanceForActor } from "@/lib/grievance-service";
import { ApiError } from "@/lib/api";
import {
  AttachmentList,
  InfoRow,
  PriorityBadge,
  StatusBadge,
  Timeline,
} from "@/components/ui";
import { CopyButton } from "@/components/copy-button";
import {
  AssignForm,
  EscalateForm,
  RemarkForm,
  ReviewForm,
  StatusForm,
} from "@/components/cmo-actions";
import { formatDate, formatDateTime, isOverdue } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Grievance record" };

export default async function CmoGrievanceDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [user, { id }] = await Promise.all([requirePageUser(["CMO_ADMIN"]), params]);

  let grievance;
  let departments;
  try {
    [grievance, departments] = await Promise.all([
      getGrievanceForActor(id, user),
      prisma.department.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          users: {
            where: { role: "OFFICER", isActive: true },
            select: { id: true, name: true, designation: true },
            orderBy: { name: "asc" },
          },
        },
      }),
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const departmentOptions = departments.map((department) => ({
    id: department.id,
    name: department.name,
    officers: department.users,
  }));

  const overdue = isOverdue(grievance);
  const awaitingReview = Boolean(grievance.resolutionSubmittedAt && !grievance.cmoApprovedAt && grievance.status !== "RESOLVED");
  const duplicates = Array.isArray(grievance.aiDuplicateRefs)
    ? (grievance.aiDuplicateRefs as { referenceNo?: string; subject?: string; score?: number }[])
    : [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/cmo/grievances" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted transition hover:text-brand-800">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to all grievances
        </Link>
        <Link href={`/track?ref=${grievance.referenceNo}`} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-800 hover:underline">
          Citizen tracking view
        </Link>
      </div>

      <header className="card overflow-hidden">
        <div className="border-b border-line bg-canvas/50 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-white px-2.5 py-1 font-mono text-[11.5px] font-bold tracking-wide text-brand-900 ring-1 ring-line">
                {grievance.referenceNo}
              </span>
              <CopyButton value={grievance.referenceNo} label="Copy" />
              {grievance.escalationLevel > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
                  <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                  Level {grievance.escalationLevel}
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={grievance.status} />
              <PriorityBadge priority={grievance.priority} />
              {overdue ? (
                <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-semibold text-rose-800 ring-1 ring-inset ring-rose-200">
                  Overdue
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-2xl font-semibold leading-snug sm:text-[26px]">{grievance.subject}</h1>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-muted">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {grievance.district}
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                {grievance.category}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                Received {formatDateTime(grievance.createdAt)}
              </span>
              <span>
                Target {formatDate(grievance.dueAt)}
              </span>
            </div>
          </div>
          <div className="shrink-0 rounded-xl border border-line bg-canvas/50 px-4 py-3">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted">Submitted by</p>
            <p className="mt-1 flex items-center gap-1.5 text-[12.5px] font-semibold text-ink">
              <UserRound className="h-3.5 w-3.5 text-brand-700" aria-hidden="true" />
              {grievance.citizen.name}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-[10.5px] text-muted">
              <Mail className="h-3 w-3" aria-hidden="true" />
              {grievance.citizen.email}
            </p>
            {grievance.citizen.mobile ? (
              <p className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-muted">
                <Phone className="h-3 w-3" aria-hidden="true" />
                {grievance.citizen.mobile}
              </p>
            ) : null}
          </div>
        </div>
      </header>

      {awaitingReview ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-100 text-indigo-700">
              <Bell className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-indigo-950">Action-taken report awaiting your decision</p>
              <p className="mt-0.5 text-[11.5px] leading-5 text-indigo-900/70">
                The department submitted its report {grievance.resolutionSubmittedAt ? formatDateTime(grievance.resolutionSubmittedAt) : ""}. Review the report below, then confirm or reject the resolution.
              </p>
            </div>
          </div>
          <a href="#review-resolution" className="btn btn-sm shrink-0 bg-indigo-700 text-white hover:bg-indigo-800">
            Review now
          </a>
        </div>
      ) : grievance.status === "RESOLVED" ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
          <div>
            <p className="text-[13px] font-semibold text-emerald-950">Resolution confirmed by the CMO office</p>
            <p className="mt-0.5 text-[11.5px] leading-5 text-emerald-900/70">
              Closed on {formatDateTime(grievance.resolvedAt)}. The citizen can now submit feedback or reopen the case.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.5fr_0.9fr] xl:items-start">
        <div className="space-y-5">
          <section className="card p-5 sm:p-6">
            <h2 className="text-[14px] font-semibold">Citizen complaint</h2>
            <p className="mt-3 whitespace-pre-line text-[13px] leading-7 text-ink/85">{grievance.description}</p>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-[14px] font-semibold">
              <Paperclip className="h-4 w-4 text-brand-700" aria-hidden="true" />
              Attachments
            </h2>
            <div className="mt-3">
              <AttachmentList attachments={grievance.attachments} />
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-brand-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-100 bg-brand-50 px-5 py-3">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-800">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                AI Grievance Assistant — advisory output
              </p>
              <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-brand-700 ring-1 ring-inset ring-brand-200">
                {grievance.aiAdopted ? "Applied by citizen" : grievance.aiProvider ? "Not applied" : "No analysis"}
              </span>
            </div>
            <div className="p-5">
              {grievance.aiSummary ? (
                <>
                  <p className="text-[12.5px] leading-6 text-ink/85">{grievance.aiSummary}</p>
                  <dl className="mt-4 grid gap-3 text-[11.5px] sm:grid-cols-2">
                    <div className="rounded-lg bg-canvas px-3 py-2">
                      <dt className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-muted">Suggested department</dt>
                      <dd className="mt-0.5 font-semibold text-ink">{grievance.aiSuggestedDepartment ?? "—"}</dd>
                    </div>
                    <div className="rounded-lg bg-canvas px-3 py-2">
                      <dt className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-muted">Suggested category</dt>
                      <dd className="mt-0.5 font-semibold text-ink">{grievance.aiSuggestedCategory ?? "—"}</dd>
                    </div>
                    <div className="rounded-lg bg-canvas px-3 py-2">
                      <dt className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-muted">Suggested priority</dt>
                      <dd className="mt-0.5 font-semibold text-ink">{grievance.aiSuggestedPriority ?? "—"}</dd>
                    </div>
                    <div className="rounded-lg bg-canvas px-3 py-2">
                      <dt className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-muted">Confidence</dt>
                      <dd className="mt-0.5 font-semibold text-ink">
                        {grievance.aiConfidence != null ? `${Math.round(grievance.aiConfidence * 100)}%` : "—"}
                      </dd>
                    </div>
                  </dl>

                  {duplicates.length > 0 ? (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-amber-800">
                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                        Possible duplicates flagged for human review
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {duplicates.map((duplicate, index) => (
                          <li key={`${duplicate.referenceNo ?? "dup"}-${index}`} className="text-[10.5px] leading-4 text-amber-900/80">
                            <span className="font-mono font-semibold">{duplicate.referenceNo ?? "Unknown"}</span>
                            {duplicate.score != null ? ` · ${Math.round(duplicate.score * 100)}% similar` : ""}
                            {duplicate.subject ? ` — ${duplicate.subject}` : ""}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-1.5 text-[9.5px] leading-4 text-amber-900/60">
                        Flagged automatically. A human must decide whether the cases are genuinely related.
                      </p>
                    </div>
                  ) : null}

                  <p className="mt-4 text-[10px] leading-4 text-muted">
                    Generated by {grievance.aiProvider ?? "the AI assistant"}
                    {grievance.aiModel ? ` (${grievance.aiModel})` : ""} on{" "}
                    {grievance.aiAnalyzedAt ? formatDateTime(grievance.aiAnalyzedAt) : "submission"}.
                    Advisory only — the CMO office makes the official decision.
                  </p>
                </>
              ) : (
                <div className="flex items-start gap-2 text-[11.5px] leading-5 text-muted">
                  <Bot className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  No AI analysis was attached to this grievance. The citizen submitted it without using
                  the assistant.
                </div>
              )}
            </div>
          </section>

          {grievance.resolutionReport ? (
            <section
              id="resolution-report"
              className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6"
            >
              <h2 className="flex items-center gap-2 text-[14px] font-semibold text-emerald-950">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                Department action-taken report
              </h2>
              <p className="mt-2.5 whitespace-pre-line text-[12.5px] leading-6 text-emerald-950/85">{grievance.resolutionReport}</p>
              <p className="mt-3 text-[10.5px] text-emerald-900/60">
                Filed {formatDateTime(grievance.resolutionSubmittedAt)}
                {grievance.assignedOfficer ? ` by ${grievance.assignedOfficer.name}` : ""}
                {grievance.cmoApprovedAt ? ` · Confirmed ${formatDateTime(grievance.cmoApprovedAt)}` : " · Awaiting CMO verification"}
              </p>
            </section>
          ) : null}

          <section className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-[14px] font-semibold">
              <History className="h-4 w-4 text-brand-700" aria-hidden="true" />
              Full audit trail
            </h2>
            <p className="mt-1 text-[11px] leading-5 text-muted">
              Includes internal notes and every status change. Visible only to CMO administrators.
            </p>
            <div className="mt-5">
              <Timeline entries={grievance.history} />
            </div>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="text-[14px] font-semibold">Assignment record</h2>
            {grievance.assignments.length === 0 ? (
              <p className="mt-2 text-[12px] text-muted">This grievance has not been forwarded to a department yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line">
                {grievance.assignments.map((assignment) => (
                  <li key={assignment.id} className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink">
                        <Building2 className="h-3.5 w-3.5 text-brand-700" aria-hidden="true" />
                        {assignment.department.name}
                      </p>
                      <p className="mt-0.5 text-[10.5px] text-muted">
                        {assignment.officer ? `Officer: ${assignment.officer.name}` : "Department queue"} · Assigned by {assignment.assignedBy.name} on {formatDateTime(assignment.createdAt)}
                      </p>
                      {assignment.note ? (
                        <p className="mt-1 max-w-xl rounded-lg bg-canvas px-2.5 py-1.5 text-[10.5px] leading-4 text-ink/75">{assignment.note}</p>
                      ) : null}
                    </div>
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-800">
                      {assignment.status.replaceAll("_", " ")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          {awaitingReview ? (
            <section id="review-resolution" className="card border-indigo-200 p-5 ring-1 ring-indigo-100">
              <h2 className="flex items-center gap-2 text-[13.5px] font-semibold">
                <Bell className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                Review resolution
              </h2>
              <p className="mt-1 text-[11px] leading-5 text-muted">
                Confirm the resolution only if the report and evidence justify closure.
              </p>
              <div className="mt-3">
                <ReviewForm grievanceId={grievance.id} />
              </div>
            </section>
          ) : null}

          <section className="card p-5">
            <h2 className="text-[13.5px] font-semibold">
              {grievance.departmentId ? "Reassign grievance" : "Forward to department"}
            </h2>
            <p className="mt-1 text-[11px] leading-5 text-muted">
              {grievance.departmentId
                ? `Currently with ${grievance.department?.name ?? "a department"}. Forwarding resets any pending resolution.`
                : "Choose the department responsible. This moves the grievance to Under Review and starts the department queue."}
            </p>
            <div className="mt-3">
              <AssignForm
                grievanceId={grievance.id}
                departments={departmentOptions}
                currentDepartmentId={grievance.departmentId}
                currentOfficerId={grievance.assignedOfficerId}
                currentDueAt={grievance.dueAt.toISOString()}
              />
            </div>
          </section>

          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-[13.5px] font-semibold">
              <History className="h-4 w-4 text-brand-700" aria-hidden="true" />
              Official remark
            </h2>
            <p className="mt-1 text-[11px] leading-5 text-muted">
              Record an internal note or a citizen-visible update.
            </p>
            <div className="mt-3">
              <RemarkForm grievanceId={grievance.id} />
            </div>
          </section>

          <section className="card p-5">
            <h2 className="text-[13.5px] font-semibold">Escalation</h2>
            <p className="mt-1 text-[11px] leading-5 text-muted">
              Raise the priority of delayed or deteriorating cases.
            </p>
            <div className="mt-3">
              <EscalateForm grievanceId={grievance.id} escalationLevel={grievance.escalationLevel} />
            </div>
          </section>

          <section className="card p-5">
            <h2 className="text-[13.5px] font-semibold">Status control</h2>
            <p className="mt-1 text-[11px] leading-5 text-muted">
              Manually move the case between review stages.
            </p>
            <div className="mt-3">
              <StatusForm grievanceId={grievance.id} currentStatus={grievance.status} />
            </div>
          </section>

          <section className="card p-5">
            <h2 className="text-[13.5px] font-semibold">Case snapshot</h2>
            <dl className="mt-2 divide-y divide-line">
              <InfoRow label="Department">{grievance.department?.name ?? "Not assigned"}</InfoRow>
              <InfoRow label="Officer">{grievance.assignedOfficer?.name ?? "Not assigned"}</InfoRow>
              <InfoRow label="Priority">{grievance.priority}</InfoRow>
              <InfoRow label="Escalation">Level {grievance.escalationLevel}</InfoRow>
              <InfoRow label="Created">{formatDateTime(grievance.createdAt)}</InfoRow>
              <InfoRow label="Last update">{formatDateTime(grievance.updatedAt)}</InfoRow>
              {grievance.reopenedAt ? <InfoRow label="Reopened">{formatDateTime(grievance.reopenedAt)}</InfoRow> : null}
              {grievance.reopenReason ? <InfoRow label="Reopen reason">{grievance.reopenReason}</InfoRow> : null}
            </dl>
            {grievance.feedback ? (
              <div className="mt-3 rounded-lg bg-canvas px-3 py-2">
                <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-muted">Citizen feedback</p>
                <p className="mt-0.5 text-[11.5px] font-semibold text-ink">{grievance.feedback.rating}/5</p>
                {grievance.feedback.comments ? (
                  <p className="mt-1 text-[10.5px] leading-4 text-muted">“{grievance.feedback.comments}”</p>
                ) : null}
              </div>
            ) : null}
          </section>
        </aside>
      </div>
    </div>
  );
}
