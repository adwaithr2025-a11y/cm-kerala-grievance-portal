import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { requirePageUser } from "@/lib/auth";
import { listGrievances } from "@/lib/grievance-service";
import { PageHeader, Pagination, EmptyState } from "@/components/ui";
import { GrievanceTable } from "@/components/grievance-list";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "My grievances" };

const TABS = [
  { value: "", label: "All" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "REOPENED", label: "Reopened" },
];

export default async function CitizenGrievancesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const [user, params] = await Promise.all([requirePageUser(["CITIZEN"]), searchParams]);
  const result = await listGrievances(user, {
    status: params.status,
    page: params.page,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My grievances"
        title="Every case you have raised."
        description="Open any grievance to read official updates, view attachments and — after resolution — rate the outcome or reopen the case."
        actions={
          <Link href="/citizen/new" className="btn btn-primary">
            <FilePlus2 className="h-4 w-4" aria-hidden="true" />
            Submit grievance
          </Link>
        }
      />

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((tab) => {
          const active = (params.status ?? "") === tab.value;
          const href = tab.value ? `/citizen/grievances?status=${tab.value}` : "/citizen/grievances";
          return (
            <Link
              key={tab.label}
              href={href}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[11.5px] font-semibold transition",
                active
                  ? "border-brand-700 bg-brand-700 text-white"
                  : "border-line bg-white text-muted hover:border-brand-300 hover:text-brand-800",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {result.grievances.length === 0 ? (
        <EmptyState
          title={params.status ? "No grievances in this status" : "No grievances yet"}
          description={
            params.status
              ? "Try another status filter, or submit a new grievance to get started."
              : "When you submit your first grievance, it will appear here with a unique reference number and a live status."
          }
          action={
            <Link href="/citizen/new" className="btn btn-primary">
              Submit a grievance
            </Link>
          }
        />
      ) : (
        <>
          <p className="text-[11.5px] text-muted">
            Showing {result.grievances.length} of {result.total} {result.total === 1 ? "grievance" : "grievances"}
            {params.status ? ` · ${TABS.find((tab) => tab.value === params.status)?.label ?? params.status}` : ""}
          </p>
          <GrievanceTable grievances={result.grievances} hrefBase="/citizen/grievances" />
          <Pagination page={result.page} totalPages={result.totalPages} basePath="/citizen/grievances" params={{ status: params.status }} />
        </>
      )}
    </div>
  );
}
