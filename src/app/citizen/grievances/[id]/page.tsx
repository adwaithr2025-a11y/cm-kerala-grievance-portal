import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  MapPin,
  Paperclip,
  Search,
  Star,
  UserRound,
} from "lucide-react";
import { requirePageUser } from "@/lib/auth";
import { getGrievanceForActor } from "@/lib/grievance-service";
import { ApiError } from "@/lib/api";
import {
  AttachmentList,
  DeadlineNote,
  InfoRow,
  PriorityBadge,
  StatusBadge,
  Timeline,
} from "@/components/ui";
import { CopyButton } from "@/components/copy-button";
import { FeedbackForm, ReopenForm } from "@/components/citizen-actions";
import { formatDate, formatDateTime, isOverdue } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Grievance details" };

export default async function CitizenGrievanceDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [user, { id }] = await Promise.all([requirePageUser(["CITIZEN"]), params]);

  let grievance;
  try {
    grievance = await getGrievanceForActor(id, user);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const overdue = isOverdue(grievance);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/citizen/grievances" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted transition hover:text-brand-800">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to my grievances
        </Link>
        <Link href={`/track?ref=${grievance.referenceNo}`} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-800 hover:underline">
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          Public tracking view
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>

      <header className="card overflow-hidden">
        <div className="border-b border-line bg-canvas/50 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-white px-2.5 py-1 font-mono text-[11.5px] font-bold tracking-wide text-brand-900 ring-1 ring-line">
                {grievance.referenceNo}
              </span>
              <CopyButton value={grievance.referenceNo} label="Copy reference" />
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
        <div className="px-5 py-5 sm:px-6">
          <h1 className="text-2xl font-semibold leading-snug sm:text-[27px]">{grievance.subject}</h1>
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
              Submitted {formatDateTime(grievance.createdAt)}
            </span>
            <DeadlineNote dueAt={grievance.dueAt} status={grievance.status} />
          </div>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_0.9fr] xl:items-start">
        <div className="space-y-5">
          <section className="card p-5 sm:p-6">
            <h2 className="text-[14px] font-semibold">Your complaint</h2>
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

          {grievance.aiSummary || grievance.aiSuggestedDepartment ? (
            <section className="overflow-hidden rounded-2xl border border-brand-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-100 bg-brand-50 px-5 py-3">
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-800">
                  <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                  AI triage note (advisory)
                </p>
                <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-brand-700 ring-1 ring-inset ring-brand-200">
                  {grievance.aiAdopted ? "Applied by citizen" : "Not applied"}
                </span>
              </div>
              <div className="p-5">
                {grievance.aiSummary ? (
                  <p className="text-[12.5px] leading-6 text-ink/80">{grievance.aiSummary}</p>
                ) : null}
                <dl className="mt-3 grid gap-2 text-[11.5px] sm:grid-cols-3">
                  <div>
                    <dt className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-muted">Suggested department</dt>
                    <dd className="mt-0.5 font-semibold text-ink">{grievance.aiSuggestedDepartment ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-muted">Suggested category</dt>
                    <dd className="mt-0.5 font-semibold text-ink">{grievance.aiSuggestedCategory ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-muted">Suggested priority</dt>
                    <dd className="mt-0.5 font-semibold text-ink">{grievance.aiSuggestedPriority ?? "—"}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-[10px] leading-4 text-muted">
                  Generated by {grievance.aiProvider ?? "an AI assistant"}
                  {grievance.aiModel ? ` (${grievance.aiModel})` : ""}. Suggestions are advisory and do
                  not determine the official outcome.
                </p>
              </div>
            </section>
          ) : null}

          {grievance.resolutionReport ? (
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-[14px] font-semibold text-emerald-950">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                Action-taken report
              </h2>
              <p className="mt-2.5 whitespace-pre-line text-[12.5px] leading-6 text-emerald-950/80">{grievance.resolutionReport}</p>
              <p className="mt-2.5 text-[10.5px] text-emerald-900/60">
                Submitted by the department on {formatDateTime(grievance.resolutionSubmittedAt)}
                {grievance.cmoApprovedAt ? ` · Confirmed by the CMO on ${formatDateTime(grievance.cmoApprovedAt)}` : " · Awaiting CMO review"}
              </p>
            </section>
          ) : null}

          <section className="card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[14px] font-semibold">Public timeline</h2>
              <span className="text-[10.5px] text-muted">{grievance.history.length} updates</span>
            </div>
            <p className="mt-1 text-[11px] leading-5 text-muted">
              Internal government notes are not shown here. Every entry is timestamped in IST.
            </p>
            <div className="mt-5">
              <Timeline entries={grievance.history} />
            </div>
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6">
          <section className="card p-5">
            <h2 className="text-[13.5px] font-semibold">Case details</h2>
            <dl className="mt-2 divide-y divide-line">
              <InfoRow label="Responsible department">
                {grievance.department ? (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                    {grievance.department.name}
                  </span>
                ) : (
                  "Awaiting assignment by the CMO"
                )}
              </InfoRow>
              <InfoRow label="Assigned officer">
                {grievance.assignedOfficer ? (
                  <span className="flex items-center gap-1.5">
                    <UserRound className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                    {grievance.assignedOfficer.name}
                    {grievance.assignedOfficer.designation ? ` · ${grievance.assignedOfficer.designation}` : ""}
                  </span>
                ) : (
                  "Not yet assigned"
                )}
              </InfoRow>
              <InfoRow label="Target date">
                <span className="flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                  {formatDate(grievance.dueAt)}
                </span>
              </InfoRow>
              <InfoRow label="Escalation level">{grievance.escalationLevel === 0 ? "Standard" : `Level ${grievance.escalationLevel}`}</InfoRow>
              {grievance.resolvedAt ? <InfoRow label="Resolved on">{formatDateTime(grievance.resolvedAt)}</InfoRow> : null}
              {grievance.reopenedAt ? <InfoRow label="Last reopened">{formatDateTime(grievance.reopenedAt)}</InfoRow> : null}
            </dl>
            {grievance.department ? (
              <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-[10.5px] leading-4 text-muted">
                Department contact: {grievance.department.contactEmail}
              </p>
            ) : null}
          </section>

          {grievance.status === "RESOLVED" ? (
            <>
              <section className="card p-5">
                <h2 className="flex items-center gap-2 text-[13.5px] font-semibold">
                  <Star className="h-4 w-4 text-gold-500" aria-hidden="true" />
                  Your feedback
                </h2>
                <div className="mt-3">
                  {grievance.feedback ? (
                    <div>
                      <p className="text-[12px] font-medium text-ink">You rated this resolution {grievance.feedback.rating}/5</p>
                      <div className="mt-1 flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Star
                            key={value}
                            className={value <= (grievance.feedback?.rating ?? 0) ? "h-4 w-4 fill-gold-300 text-gold-500" : "h-4 w-4 text-line"}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                      {grievance.feedback.comments ? (
                        <p className="mt-2 rounded-lg bg-canvas px-3 py-2 text-[11.5px] leading-5 text-ink/75">
                          “{grievance.feedback.comments}”
                        </p>
                      ) : null}
                      <p className="mt-2 text-[10px] text-muted">Recorded {formatDateTime(grievance.feedback.createdAt)}</p>
                    </div>
                  ) : (
                    <FeedbackForm grievanceId={grievance.id} />
                  )}
                </div>
              </section>

              <section className="card p-5">
                <h2 className="text-[13.5px] font-semibold">Issue still not fixed?</h2>
                <p className="mt-1 text-[11.5px] leading-5 text-muted">
                  You can reopen this grievance. It returns to the CMO office for further action.
                </p>
                <div className="mt-3">
                  <ReopenForm grievanceId={grievance.id} />
                </div>
              </section>
            </>
          ) : (
            <section className="rounded-2xl border border-line bg-brand-50/60 p-5">
              <h2 className="text-[13px] font-semibold text-brand-900">What happens now?</h2>
              <p className="mt-1.5 text-[11.5px] leading-5 text-brand-900/70">
                {grievance.status === "SUBMITTED"
                  ? "Your grievance is waiting for the CMO office to review and forward it to the responsible department."
                  : grievance.status === "UNDER_REVIEW"
                    ? "The CMO office is reviewing your grievance and will forward it to a department shortly."
                    : grievance.status === "IN_PROGRESS"
                      ? "The department is investigating. Public updates will appear in the timeline as work progresses."
                      : "The case has been reopened and returned to the CMO office for further action."}
              </p>
              <Link href="/track" className="btn btn-secondary btn-sm mt-3 w-full">
                <Search className="h-3.5 w-3.5" aria-hidden="true" />
                Track without signing in
              </Link>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
