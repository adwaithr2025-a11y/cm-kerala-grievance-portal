import Link from "next/link";
import { ArrowUpRight, Building2, MapPin, Paperclip } from "lucide-react";
import { DueHint, OverdueBadge, PriorityBadge, StatusBadge } from "./ui";
import { formatDate } from "@/lib/utils";

export type GrievanceRow = {
  id: string;
  referenceNo: string;
  subject: string;
  status: string;
  priority: string;
  district: string;
  category: string;
  createdAt: Date | string;
  dueAt: Date | string;
  department: { name: string } | null;
  citizen?: { name: string } | null;
  _count?: { attachments: number; history?: number };
};

export function GrievanceTable({
  grievances,
  hrefBase,
  showCitizen = false,
}: {
  grievances: GrievanceRow[];
  hrefBase: string;
  showCitizen?: boolean;
}) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-line bg-white md:block">
        <table className="table-base">
          <thead>
            <tr>
              <th>Grievance</th>
              {showCitizen ? <th>Citizen</th> : <th>Department</th>}
              <th>Status</th>
              <th>Priority</th>
              <th>Due</th>
              <th className="text-right">Open</th>
            </tr>
          </thead>
          <tbody>
            {grievances.map((grievance) => (
              <tr key={grievance.id}>
                <td className="max-w-[320px]">
                  <Link href={`${hrefBase}/${grievance.id}`} className="group block">
                    <span className="font-mono text-[10.5px] font-semibold text-brand-700">{grievance.referenceNo}</span>
                    <span className="mt-0.5 block truncate text-[13px] font-semibold text-ink group-hover:text-brand-800">
                      {grievance.subject}
                    </span>
                    <span className="mt-1 flex items-center gap-2 text-[10.5px] text-muted">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" aria-hidden="true" />
                        {grievance.district}
                      </span>
                      <span>·</span>
                      <span>{grievance.category}</span>
                      {grievance._count?.attachments ? (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <Paperclip className="h-3 w-3" aria-hidden="true" />
                            {grievance._count.attachments}
                          </span>
                        </>
                      ) : null}
                    </span>
                  </Link>
                </td>
                <td className="text-[12px] text-muted">
                  {showCitizen ? (
                    <span className="font-medium text-ink">{grievance.citizen?.name ?? "—"}</span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                      {grievance.department?.name ?? <span className="text-muted">Unassigned</span>}
                    </span>
                  )}
                </td>
                <td>
                  <StatusBadge status={grievance.status} />
                </td>
                <td>
                  <PriorityBadge priority={grievance.priority} />
                </td>
                <td className="whitespace-nowrap">
                  <p className="text-[11.5px] font-medium text-ink">{formatDate(grievance.dueAt)}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <DueHint dueAt={grievance.dueAt} status={grievance.status} />
                    <OverdueBadge grievance={grievance} />
                  </div>
                </td>
                <td className="text-right">
                  <Link
                    href={`${hrefBase}/${grievance.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[11px] font-semibold text-brand-800 transition hover:border-brand-300 hover:bg-brand-50"
                  >
                    View
                    <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {grievances.map((grievance) => (
          <li key={grievance.id}>
            <Link href={`${hrefBase}/${grievance.id}`} className="card block p-4 active:bg-brand-50/40">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-[10px] font-semibold text-brand-700">{grievance.referenceNo}</span>
                <StatusBadge status={grievance.status} />
              </div>
              <p className="mt-2 line-clamp-2 text-[13.5px] font-semibold leading-5 text-ink">{grievance.subject}</p>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] text-muted">
                <span>{grievance.district}</span>
                <span>·</span>
                <span>{grievance.department?.name ?? "Unassigned"}</span>
                {grievance.citizen ? (
                  <>
                    <span>·</span>
                    <span>{grievance.citizen.name}</span>
                  </>
                ) : null}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <PriorityBadge priority={grievance.priority} />
                  <OverdueBadge grievance={grievance} />
                </div>
                <span className="text-[10.5px] text-muted">
                  <DueHint dueAt={grievance.dueAt} status={grievance.status} />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
