import Link from "next/link";
import { AlertTriangle, Inbox } from "lucide-react";
import { prisma } from "@/lib/db";
import { requirePageUser } from "@/lib/auth";
import { listGrievances } from "@/lib/grievance-service";
import { EmptyState, PageHeader, Pagination } from "@/components/ui";
import { GrievanceTable } from "@/components/grievance-list";
import { GrievanceFilters } from "@/components/grievance-filters";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Assigned grievances" };

export default async function OfficerGrievancesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    district?: string;
    category?: string;
    priority?: string;
    status?: string;
    overdue?: string;
    page?: string;
  }>;
}) {
  const [user, params] = await Promise.all([requirePageUser(["OFFICER"]), searchParams]);

  if (!user.department) {
    return (
      <EmptyState
        title="No department linked"
        description="This officer account is not attached to a department, so no grievance queue can be shown."
      />
    );
  }

  const result = await listGrievances(user, params);
  const hasFilters = Boolean(params.q || params.district || params.category || params.priority || params.status || params.overdue);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          eyebrow={user.department.name}
          title="Assigned grievances"
          description="Every grievance forwarded to your department by the CMO office. Open a case to investigate, add updates and file the action-taken report."
        />
        <Link href="/officer" className="btn btn-secondary self-start">
          Department overview
        </Link>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[
          { href: "/officer/grievances", label: "All", active: !params.status && params.overdue !== "1" },
          { href: "/officer/grievances?status=UNDER_REVIEW", label: "Not started", active: params.status === "UNDER_REVIEW" },
          { href: "/officer/grievances?status=IN_PROGRESS", label: "In progress", active: params.status === "IN_PROGRESS" },
          { href: "/officer/grievances?status=REOPENED", label: "Reopened", active: params.status === "REOPENED" },
          { href: "/officer/grievances?status=RESOLVED", label: "Resolved", active: params.status === "RESOLVED" },
          { href: "/officer/grievances?overdue=1", label: "Overdue", active: params.overdue === "1" },
        ].map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[11.5px] font-semibold transition",
              tab.active
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-line bg-white text-muted hover:border-brand-300 hover:text-brand-800",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <GrievanceFilters action="/officer/grievances" values={params} departments={[]} showDepartment={false} />

      {result.grievances.length === 0 ? (
        <EmptyState
          icon={params.overdue === "1" ? AlertTriangle : Inbox}
          title="No grievances match"
          description={
            hasFilters
              ? "Try clearing a filter or searching a different reference number."
              : "When the CMO office forwards a grievance to your department, it will appear here."
          }
          action={
            hasFilters ? (
              <Link href="/officer/grievances" className="btn btn-secondary">
                Clear filters
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <p className="text-[11.5px] text-muted">
            <span className="font-semibold text-ink">{result.total}</span>{" "}
            {result.total === 1 ? "case" : "cases"} in your department queue
            {hasFilters ? " for the selected filters" : ""}.
          </p>
          <GrievanceTable grievances={result.grievances} hrefBase="/officer/grievances" />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            basePath="/officer/grievances"
            params={{
              q: params.q,
              district: params.district,
              category: params.category,
              priority: params.priority,
              status: params.status,
              overdue: params.overdue,
            }}
          />
        </>
      )}
    </div>
  );
}
