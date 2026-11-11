import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileCheck2,
  FileText,
  Mail,
  MapPin,
  Paperclip,
  Phone,
  UserRound,
} from "lucide-react";
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
import { InvestigationRemarkForm, ResolutionForm, StartProgressButton } from "@/components/officer-actions";
import { formatDate, formatDateTime, isOverdue } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Investigate grievance" };

export default async function OfficerGrievanceDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [user, { id }] = await Promise.all([requirePageUser(["OFFICER"]), params]);

  let grievance;
  try {
    grievance = await getGrievanceForActor(id, user);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) notFound();
    throw error;
  }

  const overdue = isOverdue(grievance);
  const awaitingReview = Boolean(grievance.resolutionSubmittedAt && !grievance.cmoApprovedAt && grievance.status !== "RESOLVED");
  const isResolved = grievance.status === "RESOLVED";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/officer/grievances" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted transition hover:text-brand-800">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to department queue
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
                  <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                  Escalated · level {grievance.escalationLevel}
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
              <span>Target {formatDate(grievance.dueAt)}</span>
            </div>
          </div>
          <div className="shrink-0 rounded-xl border border-line bg-canvas/50 px-4 py-3">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted">Citizen contact</p>
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
        <div className="flex items-start gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
          <Bell className="mt-0.5 h-5 w-5 shrink-0 text-indigo-700" aria-hidden="true" />
          <div>
            <p className="text-[13px] font-semibold text-indigo-950">Action-taken report awaiting CMO review</p>
            <p className="mt-0.5 text-[11.5px] leading-5 text-indigo-900/70">
              Filed {formatDateTime(grievance.resolutionSubmittedAt)}. No further submission is needed
              unless the CMO rejects the report and reopens the case.
            </p>
          </div>
        </div>
      ) : isResolved ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
          <div>
            <p className="text-[13px] font-semibold text-emerald-950">Case closed by the CMO office</p>
            <p className="mt-0.5 text-[11.5px] leading-5 text-emerald-900/70">
              Resolved on {formatDateTime(grievance.resolvedAt)}. The citizen may reopen it if the issue persists.
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
              Supporting evidence
            </h2>
            <div className="mt-3">
              <AttachmentList attachments={grievance.attachments} />
            </div>
          </section>

          {grievance.resolutionReport ? (
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-[14px] font-semibold text-emerald-950">
                <FileCheck2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                Action-taken report on file
              </h2>
              <p className="mt-2.5 whitespace-pre-line text-[12.5px] leading-6 text-emerald-950/85">{grievance.resolutionReport}</p>
              <p className="mt-2.5 text-[10.5px] text-emerald-900/60">
                Filed {formatDateTime(grievance.resolutionSubmittedAt)}
                {grievance.cmoApprovedAt ? ` · Confirmed by CMO ${formatDateTime(grievance.cmoApprovedAt)}` : " · Awaiting CMO decision"}
              </p>
            </section>
          ) : null}

          <section className="card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[14px] font-semibold">Case history</h2>
              <span className="text-[10.5px] text-muted">{grievance.history.length} entries</span>
            </div>
            <p className="mt-1 text-[11px] leading-5 text-muted">
              Includes CMO internal notes. Department updates are also visible to the citizen.
            </p>
            <div className="mt-5">
              <Timeline entries={grievance.history} />
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          {!isResolved ? (
            <>
              <section className="card p-5">
                <h2 className="text-[13.5px] font-semibold">Investigation status</h2>
                <p className="mt-1 text-[11px] leading-5 text-muted">
                  Move the case into active investigation before filing your report.
                </p>
                <div className="mt-3">
                  <StartProgressButton grievanceId={grievance.id} disabled={grievance.status === "IN_PROGRESS" || awaitingReview} />
                </div>
              </section>

              <section className="card p-5">
                <h2 className="text-[13.5px] font-semibold">Post an investigation update</h2>
                <p className="mt-1 text-[11px] leading-5 text-muted">
                  Updates appear on the citizen&apos;s public tracking timeline.
                </p>
                <div className="mt-3">
                  <InvestigationRemarkForm grievanceId={grievance.id} />
                </div>
              </section>

              <section className="card p-5">
                <h2 className="flex items-center gap-2 text-[13.5px] font-semibold">
                  <FileCheck2 className="h-4 w-4 text-brand-700" aria-hidden="true" />
                  Action-taken report
                </h2>
                <div className="mt-3">
                  <ResolutionForm grievanceId={grievance.id} awaitingReview={awaitingReview} />
                </div>
              </section>
            </>
          ) : (
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <h2 className="text-[13px] font-semibold text-emerald-950">No action required</h2>
              <p className="mt-1.5 text-[11.5px] leading-5 text-emerald-900/70">
                This grievance is resolved and closed. If the citizen reopens it, it will return to
                your department queue.
              </p>
            </section>
          )}

          <section className="card p-5">
            <h2 className="text-[13.5px] font-semibold">Case details</h2>
            <dl className="mt-2 divide-y divide-line">
              <InfoRow label="Department">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                  {grievance.department?.name ?? "—"}
                </span>
              </InfoRow>
              <InfoRow label="Assigned officer">{grievance.assignedOfficer?.name ?? "Department queue"}</InfoRow>
              <InfoRow label="Priority">{grievance.priority}</InfoRow>
              <InfoRow label="Target date">{formatDate(grievance.dueAt)}</InfoRow>
              <InfoRow label="Escalation level">{grievance.escalationLevel === 0 ? "Standard" : `Level ${grievance.escalationLevel}`}</InfoRow>
              <InfoRow label="Last update">{formatDateTime(grievance.updatedAt)}</InfoRow>
            </dl>
          </section>

          <section className="card p-5">
            <h2 className="text-[13.5px] font-semibold">Attachments</h2>
            <div className="mt-2.5">
              <AttachmentList attachments={grievance.attachments} emptyText="No files were attached by the citizen." />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
