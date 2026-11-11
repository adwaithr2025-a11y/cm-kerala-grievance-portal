import Link from "next/link";
import { AlertTriangle, Bell, Inbox } from "lucide-react";
import { prisma } from "@/lib/db";
import { requirePageUser } from "@/lib/auth";
import { listGrievances } from "@/lib/grievance-service";
import { EmptyState, PageHeader, Pagination } from "@/components/ui";
import { GrievanceTable } from "@/components/grievance-list";
import { GrievanceFilters } from "@/components/grievance-filters";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "All grievances" };

export default async function CmoGrievancesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    district?: string;
    category?: string;
    priority?: string;
    status?: string;
    departmentId?: string;
    overdue?: string;
    view?: string;
    page?: string;
  }>;
}) {
  const [user, params, departments] = await Promise.all([
    requirePageUser(["CMO_ADMIN"]),
    searchParams,
    prisma.department.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const result = await listGrievances(user, params);

  const title =
    params.view === "awaiting"
      ? "Resolution review queue"
      : params.overdue === "1"
        ? "Overdue grievances"
        : "All grievances";
  const description =
    params.view === "awaiting"
      ? "Action-taken reports filed by departments that are waiting for a CMO decision. Verify the evidence before confirming closure."
      : params.overdue === "1"
        ? "Open grievances that have crossed their service-level target. Consider escalating these cases."
        : "Every grievance submitted through the portal, with live status, priority and SLA tracking.";

  const activeCount = result.total;
  const hasFilters = Boolean(
    params.q || params.district || params.category || params.priority || params.status || params.departmentId || params.overdue,
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Grievance management"
        title={title}
        description={description}
        actions={
          <Link href="/cmo" className="btn btn-secondary">
            Back to command centre
          </Link>
        }
      />

      <div className="flex flex-wrap gap-1.5">
        {[
          { href: "/cmo/grievances", label: "All grievances", icon: Inbox, active: !params.view && params.overdue !== "1" },
          { href: "/cmo/grievances?view=awaiting", label: "Awaiting CMO review", icon: Bell, active: params.view === "awaiting" },
          { href: "/cmo/grievances?overdue=1", label: "Overdue", icon: AlertTriangle, active: params.overdue === "1" },
        ].map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11.5px] font-semibold transition",
              tab.active
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-line bg-white text-muted hover:border-brand-300 hover:text-brand-800",
            )}
          >
            <tab.icon className="h-3.5 w-3.5" aria-hidden="true" />
            {tab.label}
          </Link>
        ))}
      </div>

      <GrievanceFilters
        action="/cmo/grievances"
        values={params}
        departments={departments}
      />

      {result.grievances.length === 0 ? (
        <EmptyState
          icon={params.view === "awaiting" ? Bell : AlertTriangle}
          title="No grievances match these filters"
          description={
            params.view === "awaiting"
              ? "There are no action-taken reports waiting for review right now."
              : hasFilters
                ? "Try removing a filter or searching for a different reference number."
                : "Grievances will appear here as citizens submit them."
          }
          action={
            hasFilters ? (
              <Link href="/cmo/grievances" className="btn btn-secondary">
                Clear filters
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11.5px] text-muted">
              <span className="font-semibold text-ink">{activeCount}</span>{" "}
              {activeCount === 1 ? "grievance" : "grievances"} found
              {hasFilters ? " with the selected filters" : ""}
            </p>
            <p className="text-[10.5px] text-muted">Sorted by newest first</p>
          </div>
          <GrievanceTable grievances={result.grievances} hrefBase="/cmo/grievances" showCitizen />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            basePath="/cmo/grievances"
            params={{
              q: params.q,
              district: params.district,
              category: params.category,
              priority: params.priority,
              status: params.status,
              departmentId: params.departmentId,
              overdue: params.overdue,
              view: params.view,
            }}
          />
        </>
      )}
    </div>
  );
}
