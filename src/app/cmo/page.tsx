import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ClipboardList,
  Gauge,
  Hourglass,
  Inbox,
  ShieldAlert,
  Star,
  TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requirePageUser } from "@/lib/auth";
import { getCmoStats } from "@/lib/grievance-service";
import { PageHeader, StatCard, StatusBadge, PriorityBadge, DueHint } from "@/components/ui";
import { GrievanceTable } from "@/components/grievance-list";
import { DepartmentChart, DistrictChart, StatusDonut, TrendChart } from "@/components/charts";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "CMO command centre" };

export default async function CmoDashboard() {
  const [user, stats, awaitingReview] = await Promise.all([
    requirePageUser(["CMO_ADMIN"]),
    getCmoStats(),
    prisma.grievance.findMany({
      where: { resolutionSubmittedAt: { not: null }, cmoApprovedAt: null, status: { not: "RESOLVED" } },
      orderBy: { resolutionSubmittedAt: "asc" },
      take: 4,
      select: {
        id: true,
        referenceNo: true,
        subject: true,
        priority: true,
        dueAt: true,
        resolutionSubmittedAt: true,
        department: { select: { name: true } },
        assignedOfficer: { select: { name: true } },
      },
    }),
  ]);

  const awaitingCount = stats.totals.awaitingReview;

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="CMO command centre"
        title={`State grievance overview`}
        description={`Signed in as ${user.name}. Live snapshot of every grievance, department workload and cases waiting for a CMO decision.`}
        actions={
          <>
            <Link href="/cmo/enquiries" className="btn btn-secondary">
              <Inbox className="h-4 w-4" aria-hidden="true" />
              Enquiries
            </Link>
            <Link href="/cmo/grievances" className="btn btn-primary">
              All grievances
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-white px-4 py-2.5">
        <p className="flex items-center gap-2 text-[11px] text-muted">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live data · refreshed {formatDateTime(new Date())} IST
        </p>
        <p className="text-[10.5px] text-muted">Across all departments and districts</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total grievances" value={stats.totals.total} hint="All records in the portal" icon={ClipboardList} tone="brand" href="/cmo/grievances" />
        <StatCard label="Pending action" value={stats.totals.pending} hint="Submitted, under review, in progress or reopened" icon={Hourglass} tone="amber" />
        <StatCard label="Resolved" value={stats.totals.resolved} hint="CMO-verified action-taken reports" icon={CheckCircle2} tone="emerald" href="/cmo/grievances?status=RESOLVED" />
        <StatCard label="Overdue" value={stats.totals.overdue} hint="Past target date and not resolved" icon={AlertTriangle} tone="rose" href="/cmo/grievances?overdue=1" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/cmo/grievances?view=awaiting" className="card flex items-center justify-between gap-3 p-4 transition hover:border-brand-200 hover:shadow-card">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.11em] text-muted">Awaiting CMO review</p>
            <p className="mt-1.5 font-display text-2xl font-semibold leading-none">{awaitingCount}</p>
            <p className="mt-1 text-[10.5px] text-muted">Department reports to verify</p>
          </div>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
            <Bell className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>
        <Link href="/cmo/grievances?status=REOPENED" className="card flex items-center justify-between gap-3 p-4 transition hover:border-brand-200 hover:shadow-card">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.11em] text-muted">Reopened cases</p>
            <p className="mt-1.5 font-display text-2xl font-semibold leading-none">{stats.totals.reopened}</p>
            <p className="mt-1 text-[10.5px] text-muted">Returned for further action</p>
          </div>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50 text-rose-700">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>
        <div className="card flex items-center justify-between gap-3 p-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.11em] text-muted">Escalated</p>
            <p className="mt-1.5 font-display text-2xl font-semibold leading-none">{stats.totals.escalated}</p>
            <p className="mt-1 text-[10.5px] text-muted">Open cases raised by the CMO</p>
          </div>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-700">
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <div className="card flex items-center justify-between gap-3 p-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.11em] text-muted">Avg. resolution time</p>
            <p className="mt-1.5 font-display text-2xl font-semibold leading-none">
              {stats.totals.avgResolutionDays || "—"}
              <span className="ml-1 font-sans text-[11px] font-medium text-muted">days</span>
            </p>
            <p className="mt-1 flex items-center gap-1 text-[10.5px] text-muted">
              <Star className="h-3 w-3 text-gold-500" aria-hidden="true" />
              {stats.totals.avgRating ? `${stats.totals.avgRating}/5 citizen rating` : "No feedback yet"}
            </p>
          </div>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <Gauge className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.85fr]">
        <section className="card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[14.5px] font-semibold">Intake vs resolution trend</h2>
              <p className="mt-0.5 text-[11px] text-muted">Weekly volumes over the last eight weeks.</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-semibold text-brand-800">
              <TrendingUp className="h-3 w-3" aria-hidden="true" />
              8 weeks
            </span>
          </div>
          <div className="mt-3">
            <TrendChart data={stats.trend} />
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-[14.5px] font-semibold">Status distribution</h2>
          <p className="mt-0.5 text-[11px] text-muted">All grievances by current status.</p>
          <div className="mt-4">
            <StatusDonut data={stats.byStatus} />
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[14.5px] font-semibold">District-wise volume</h2>
              <p className="mt-0.5 text-[11px] text-muted">Where grievances are being raised.</p>
            </div>
            <Link href="/cmo/grievances" className="text-[11px] font-semibold text-brand-800 hover:underline">
              Filter
            </Link>
          </div>
          <div className="mt-2">
            <DistrictChart data={stats.byDistrict} />
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[14.5px] font-semibold">Department workload</h2>
              <p className="mt-0.5 text-[11px] text-muted">Grievances forwarded to each department.</p>
            </div>
            <Link href="/departments" className="text-[11px] font-semibold text-brand-800 hover:underline">
              Directory
            </Link>
          </div>
          <div className="mt-2">
            <DepartmentChart data={stats.byDepartment} />
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.85fr] xl:items-start">
        <section>
          <div className="flex items-end justify-between gap-3 pb-3">
            <div>
              <h2 className="text-[15px] font-semibold">Latest submissions</h2>
              <p className="mt-0.5 text-[11px] text-muted">Newest grievances across all districts.</p>
            </div>
            <Link href="/cmo/grievances" className="text-[11.5px] font-semibold text-brand-800 hover:underline">
              Open queue
            </Link>
          </div>
          <GrievanceTable grievances={stats.recent} hrefBase="/cmo/grievances" showCitizen />
        </section>

        <aside className="space-y-4">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
              <h2 className="flex items-center gap-2 text-[13.5px] font-semibold">
                <Bell className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                Resolution review queue
              </h2>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">{awaitingCount}</span>
            </div>
            {awaitingReview.length === 0 ? (
              <p className="px-4 py-6 text-center text-[11.5px] text-muted">No action-taken reports are waiting for review.</p>
            ) : (
              <ul className="divide-y divide-line">
                {awaitingReview.map((item) => (
                  <li key={item.id} className="px-4 py-3">
                    <Link href={`/cmo/grievances/${item.id}`} className="group block">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-semibold text-brand-700">{item.referenceNo}</span>
                        <PriorityBadge priority={item.priority} />
                      </div>
                      <p className="mt-1 line-clamp-2 text-[12px] font-semibold leading-5 text-ink group-hover:text-brand-800">
                        {item.subject}
                      </p>
                      <p className="mt-1 text-[10px] text-muted">
                        {item.department?.name ?? "Unassigned"} · submitted {item.resolutionSubmittedAt ? formatDateTime(item.resolutionSubmittedAt) : ""}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-line px-4 py-2.5">
              <Link href="/cmo/grievances?view=awaiting" className="flex items-center justify-between text-[11px] font-semibold text-brand-800 hover:underline">
                Review all reports
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-line px-4 py-3">
              <h2 className="flex items-center gap-2 text-[13.5px] font-semibold">
                <AlertTriangle className="h-4 w-4 text-rose-600" aria-hidden="true" />
                Priority snapshot
              </h2>
            </div>
            <ul className="space-y-3 p-4">
              {stats.byPriority
                .slice()
                .sort((a, b) => {
                  const order = { HIGH: 0, MEDIUM: 1, LOW: 2 } as Record<string, number>;
                  return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
                })
                .map((entry) => (
                  <li key={entry.priority} className="flex items-center justify-between gap-2">
                    <PriorityBadge priority={entry.priority} />
                    <div className="flex flex-1 items-center gap-2 pl-2">
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-canvas">
                        <span
                          className={entry.priority === "HIGH" ? "block h-full rounded-full bg-rose-400" : entry.priority === "MEDIUM" ? "block h-full rounded-full bg-amber-400" : "block h-full rounded-full bg-slate-300"}
                          style={{ width: `${stats.totals.total ? Math.max((entry.count / stats.totals.total) * 100, 4) : 0}%` }}
                        />
                      </span>
                      <span className="w-6 text-right text-[11px] font-semibold text-ink">{entry.count}</span>
                    </div>
                  </li>
                ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-line bg-white p-4">
            <h2 className="text-[12.5px] font-semibold">Cases needing attention</h2>
            <div className="mt-2 space-y-2">
              <Link href="/cmo/grievances?overdue=1" className="flex items-center justify-between rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-800">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  Overdue cases
                </span>
                <span>{stats.totals.overdue}</span>
              </Link>
              <Link href="/cmo/grievances?status=SUBMITTED" className="flex items-center justify-between rounded-lg bg-sky-50 px-3 py-2 text-[11px] font-semibold text-sky-800">
                <span className="flex items-center gap-1.5">
                  <Inbox className="h-3.5 w-3.5" aria-hidden="true" />
                  New, unreviewed
                </span>
                <span>{stats.byStatus.find((entry) => entry.status === "SUBMITTED")?.count ?? 0}</span>
              </Link>
              <Link href="/cmo/grievances?view=awaiting" className="flex items-center justify-between rounded-lg bg-indigo-50 px-3 py-2 text-[11px] font-semibold text-indigo-800">
                <span className="flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                  Reports to verify
                </span>
                <span>{awaitingCount}</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
