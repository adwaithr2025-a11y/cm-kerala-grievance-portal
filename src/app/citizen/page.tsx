import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FilePlus2,
  Info,
  RotateCcw,
  Search,
  Sparkles,
} from "lucide-react";
import { requirePageUser } from "@/lib/auth";
import { getCitizenSummary } from "@/lib/grievance-service";
import { PageHeader, StatCard, StatusBadge } from "@/components/ui";
import { GrievanceTable } from "@/components/grievance-list";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Citizen dashboard" };

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function CitizenDashboard({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const [user, params] = await Promise.all([requirePageUser(["CITIZEN"]), searchParams]);
  const summary = await getCitizenSummary(user.id);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Citizen portal"
        title={`${greeting()}, ${user.name.split(" ")[0]}.`}
        description="Submit a grievance, follow its journey through the CMO office and the responsible department, and review the final outcome."
        actions={
          <>
            <Link href="/track" className="btn btn-secondary">
              <Search className="h-4 w-4" aria-hidden="true" />
              Track by reference
            </Link>
            <Link href="/citizen/new" className="btn btn-primary">
              <FilePlus2 className="h-4 w-4" aria-hidden="true" />
              Submit grievance
            </Link>
          </>
        }
      />

      {params.welcome === "1" ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
          <div>
            <p className="text-[13px] font-semibold text-emerald-900">Your citizen account is ready.</p>
            <p className="mt-0.5 text-[12px] leading-5 text-emerald-900/75">
              Submit your first grievance to receive a unique reference number and begin tracking it.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total submitted" value={summary.total} hint="All grievances on your account" icon={ClipboardList} tone="brand" href="/citizen/grievances" />
        <StatCard label="In the pipeline" value={summary.pending} hint="Submitted, under review or in progress" icon={Clock3} tone="amber" />
        <StatCard label="Resolved" value={summary.resolved} hint="Confirmed by the CMO office" icon={CheckCircle2} tone="emerald" />
        <StatCard label="Reopened" value={summary.reopened} hint="Sent back for further action" icon={RotateCcw} tone="rose" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.55fr] xl:items-start">
        <section>
          <div className="flex items-end justify-between gap-3 pb-3">
            <div>
              <h2 className="text-lg font-semibold">Recent grievances</h2>
              <p className="mt-0.5 text-[12px] text-muted">Your three most recent submissions.</p>
            </div>
            {summary.total > 0 ? (
              <Link href="/citizen/grievances" className="text-[12px] font-semibold text-brand-800 hover:underline">
                View all
              </Link>
            ) : null}
          </div>

          {summary.recent.length === 0 ? (
            <div className="card flex flex-col items-center px-6 py-14 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                <FilePlus2 className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">No grievances yet</h3>
              <p className="mt-1.5 max-w-sm text-[12.5px] leading-6 text-muted">
                When you submit a grievance, it will appear here with its status, the responsible
                department and its reference number.
              </p>
              <Link href="/citizen/new" className="btn btn-primary mt-5">
                Submit your first grievance
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <GrievanceTable
              grievances={summary.recent.map((grievance) => ({
                id: grievance.id,
                referenceNo: grievance.referenceNo,
                subject: grievance.subject,
                status: grievance.status,
                priority: grievance.priority,
                district: grievance.district,
                category: grievance.category,
                createdAt: grievance.createdAt,
                dueAt: grievance.dueAt,
                department: grievance.department,
              }))}
              hrefBase="/citizen/grievances"
            />
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-brand-900 p-5 text-brand-100">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gold-200">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              AI Grievance Assistant
            </p>
            <h3 className="mt-3 text-xl font-semibold text-white">Describe it once. We route it right.</h3>
            <p className="mt-2 text-[12px] leading-6 text-brand-100/70">
              The assistant reads your complaint, suggests a department, category and priority, and
              prepares a summary for the CMO. You can review or override every suggestion.
            </p>
            <Link href="/citizen/new" className="btn btn-sm mt-4 bg-white text-brand-900 hover:bg-brand-50">
              Try the assistant
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="card p-5">
            <h3 className="text-[13.5px] font-semibold">How to write a good grievance</h3>
            <ul className="mt-3 space-y-2.5 text-[12px] leading-5 text-muted">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                State the location precisely — ward, road or landmark.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                Explain the impact on people, especially safety risks.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                Attach a photograph if the issue is visible on site.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                Mention previous complaints or reference numbers, if any.
              </li>
            </ul>
          </div>

          <div className="card p-5">
            <h3 className="flex items-center gap-2 text-[13.5px] font-semibold">
              <Info className="h-4 w-4 text-brand-700" aria-hidden="true" />
              Keeping track
            </h3>
            <p className="mt-2 text-[12px] leading-5 text-muted">
              Save your reference number. You can view any grievance&apos;s public status from the
              Track page even without signing in.
            </p>
            {summary.recent[0] ? (
              <div className="mt-3 rounded-xl border border-line bg-canvas/50 px-3 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Latest reference</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="font-mono text-[12px] font-semibold text-brand-900">{summary.recent[0].referenceNo}</span>
                  <StatusBadge status={summary.recent[0].status} />
                </div>
                <p className="mt-1 text-[10.5px] text-muted">Submitted {formatDate(summary.recent[0].createdAt)}</p>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
