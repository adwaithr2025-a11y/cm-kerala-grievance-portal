import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  Hourglass,
  Inbox,
  Mail,
  UserRound,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requirePageUser } from "@/lib/auth";
import { getDepartmentSummary } from "@/lib/grievance-service";
import { EmptyState, PageHeader, StatCard } from "@/components/ui";
import { GrievanceTable } from "@/components/grievance-list";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Department desk" };

export default async function OfficerDashboard() {
  const user = await requirePageUser(["OFFICER"]);

  if (!user.department) {
    return (
      <EmptyState
        icon={Building2}
        title="No department linked to this account"
        description="This officer account is not attached to a department. Contact the CMO administrator to correct the assignment."
      />
    );
  }

  const departmentId = user.department.id;
  const [summary, overdue, statusGroups, department, officers] = await Promise.all([
    getDepartmentSummary(departmentId),
    prisma.grievance.count({ where: { departmentId, dueAt: { lt: new Date() }, status: { not: "RESOLVED" } } }),
    prisma.grievance.groupBy({ by: ["status"], where: { departmentId }, _count: { _all: true } }),
    prisma.department.findUnique({
      where: { id: departmentId },
      select: { name: true, description: true, headName: true, contactEmail: true },
    }),
    prisma.user.findMany({
      where: { departmentId, role: "OFFICER", isActive: true },
      select: { id: true, name: true, designation: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const statusCount = (status: string) => statusGroups.find((group) => group.status === status)?._count._all ?? 0;

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Department desk"
        title={user.department.name}
        description={`Signed in as ${user.name}. This queue contains only grievances forwarded to your department by the Chief Minister's Office.`}
        actions={
          <Link href="/officer/grievances" className="btn btn-primary">
            <Inbox className="h-4 w-4" aria-hidden="true" />
            Open full queue
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total received" value={summary.total} hint="All grievances forwarded to this department" icon={ClipboardList} tone="brand" href="/officer/grievances" />
        <StatCard label="Active cases" value={summary.active} hint="Under review, in progress or reopened" icon={Hourglass} tone="indigo" href="/officer/grievances?status=IN_PROGRESS" />
        <StatCard label="Resolved" value={summary.resolved} hint="Closed after CMO verification" icon={CheckCircle2} tone="emerald" href="/officer/grievances?status=RESOLVED" />
        <StatCard label="Overdue" value={overdue} hint="Past the target date" icon={AlertTriangle} tone="rose" href="/officer/grievances?overdue=1" />
      </div>

      {summary.awaitingReport > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-100 text-indigo-700">
              <FileCheck2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-indigo-950">
                {summary.awaitingReport} action-taken {summary.awaitingReport === 1 ? "report" : "reports"} awaiting CMO verification
              </p>
              <p className="mt-0.5 text-[11.5px] leading-5 text-indigo-900/70">
                These cases remain In Progress until the CMO office reviews the report. No further
                action is required from your desk unless a report is rejected.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.5fr_0.9fr] xl:items-start">
        <section>
          <div className="flex items-end justify-between gap-3 pb-3">
            <div>
              <h2 className="text-[15px] font-semibold">Due soon</h2>
              <p className="mt-0.5 text-[11px] text-muted">Active cases ordered by target date.</p>
            </div>
            <Link href="/officer/grievances" className="text-[11.5px] font-semibold text-brand-800 hover:underline">
              Whole queue
            </Link>
          </div>

          {summary.recent.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Queue is clear"
              description="New grievances forwarded by the CMO office will appear here automatically."
            />
          ) : (
            <GrievanceTable
              grievances={summary.recent.map((grievance) => ({
                ...grievance,
                department: { name: user.department!.name },
                citizen: null,
              }))}
              hrefBase="/officer/grievances"
            />
          )}
        </section>

        <aside className="space-y-4">
          <section className="card p-5">
            <h2 className="text-[13.5px] font-semibold">Department profile</h2>
            <p className="mt-2 text-[12px] leading-6 text-muted">{department?.description}</p>
            <dl className="mt-3 space-y-2 border-t border-line pt-3 text-[11.5px]">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted">Department head</dt>
                <dd className="text-right font-medium text-ink">{department?.headName ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted">Contact</dt>
                <dd className="text-right font-medium text-ink">{department?.contactEmail ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted">Officers</dt>
                <dd className="text-right font-medium text-ink">{officers.length}</dd>
              </div>
            </dl>
          </section>

          <section className="card p-5">
            <h2 className="text-[13.5px] font-semibold">Status breakdown</h2>
            <ul className="mt-3 space-y-2">
              {[
                ["SUBMITTED", "Submitted"],
                ["UNDER_REVIEW", "Under Review"],
                ["IN_PROGRESS", "In Progress"],
                ["RESOLVED", "Resolved"],
                ["REOPENED", "Reopened"],
              ].map(([key, label]) => (
                <li key={key} className="flex items-center justify-between gap-2 text-[11.5px]">
                  <span className="text-muted">{label}</span>
                  <span className="font-semibold text-ink">{statusCount(key)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-[13.5px] font-semibold">
              <UserRound className="h-4 w-4 text-brand-700" aria-hidden="true" />
              Department officers
            </h2>
            <ul className="mt-3 space-y-2.5">
              {officers.map((officer) => (
                <li key={officer.id} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[12px] font-medium text-ink">{officer.name}</p>
                    <p className="text-[10px] text-muted">{officer.designation ?? "Officer"}</p>
                  </div>
                  {officer.id === user.id ? (
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-800">You</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl bg-brand-900 p-5 text-brand-100">
            <h2 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-gold-200">
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              Workflow reminder
            </h2>
            <ol className="mt-3 space-y-2.5 text-[11.5px] leading-5 text-brand-100/75">
              <li>1. Inspect the grievance and attachments.</li>
              <li>2. Mark the investigation started and post public updates.</li>
              <li>3. Complete the work, then file the action-taken report.</li>
              <li>4. The CMO office verifies the report before closure.</li>
            </ol>
            <Link href="/officer/grievances" className="btn btn-sm mt-4 w-full bg-white text-brand-900 hover:bg-brand-50">
              Open assigned grievances
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
