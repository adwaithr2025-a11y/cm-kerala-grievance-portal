import Link from "next/link";
import { ArrowRight, Building2, Mail, MapPin, UserRound } from "lucide-react";
import { prisma } from "@/lib/db";
import { DEPARTMENTS_SEED, DEPARTMENT_DEFAULT_CATEGORY } from "@/lib/constants";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

type DepartmentCard = {
  id: string;
  name: string;
  code: string;
  shortName: string | null;
  description: string;
  headName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  cases: number;
  officers: number;
};

export default async function DepartmentsPage() {
  let departments: DepartmentCard[] = [];

  try {
    const rows = await prisma.department.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { grievances: true, users: true } },
      },
    });
    departments = rows.map((row) => ({
      id: row.id,
      name: row.name,
      code: row.code,
      shortName: null,
      description: row.description,
      headName: row.headName,
      contactEmail: row.contactEmail,
      contactPhone: row.contactPhone,
      cases: row._count.grievances,
      officers: row._count.users,
    }));
  } catch {
    departments = DEPARTMENTS_SEED.map((department, index) => ({
      id: String(index),
      name: department.name,
      code: department.code,
      shortName: department.shortName,
      description: department.description,
      headName: department.headName,
      contactEmail: department.contactEmail,
      contactPhone: department.contactPhone,
      cases: 0,
      officers: 0,
    }));
  }

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-page py-14 sm:py-16">
          <PageHeader
            eyebrow="Government departments"
            title="Where your grievance can travel."
            description="Eleven state departments take part in the portal. Each one receives only the grievances forwarded to it by the Chief Minister's Office, and each has a named officer queue."
            actions={
              <Link href="/register" className="btn btn-primary">
                Submit a grievance
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          />
          <p className="mt-6 max-w-3xl text-[12px] leading-6 text-muted">
            Each department receives only the grievances forwarded by the Chief Minister&apos;s
            Office and maintains its own officer queue and accountability record.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {departments.map((department) => (
              <article key={department.id} className="card flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 font-mono text-[11px] font-bold text-brand-800 ring-1 ring-brand-100">
                    {department.code}
                  </span>
                  {department.cases > 0 ? (
                    <span className="rounded-full bg-canvas px-2.5 py-1 text-[10px] font-semibold text-muted">
                      {department.cases} {department.cases === 1 ? "case" : "cases"} on record
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                      Connected
                    </span>
                  )}
                </div>

                <h2 className="mt-4 text-[17px] font-semibold leading-snug">{department.name}</h2>
                <p className="mt-2 flex-1 text-[12.5px] leading-6 text-muted">{department.description}</p>

                <div className="mt-4 space-y-2 border-t border-line pt-4 text-[11.5px]">
                  <p className="flex items-center gap-2 text-muted">
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden="true" />
                    <span className="font-medium text-ink">{DEPARTMENT_DEFAULT_CATEGORY[department.code] ?? "General"}</span>
                  </p>
                  {department.headName ? (
                    <p className="flex items-center gap-2 text-muted">
                      <UserRound className="h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden="true" />
                      {department.headName}
                    </p>
                  ) : null}
                  {department.contactEmail ? (
                    <p className="flex items-center gap-2 text-muted">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden="true" />
                      <span className="truncate">{department.contactEmail}</span>
                    </p>
                  ) : null}
                  {department.contactPhone ? (
                    <p className="flex items-center gap-2 text-muted">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden="true" />
                      {department.contactPhone}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl border border-brand-100 bg-brand-50 p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-[16px] font-semibold text-brand-900">Not sure which department handles it?</h2>
              <p className="mt-1.5 max-w-2xl text-[12.5px] leading-6 text-brand-900/70">
                You do not need to choose correctly. The AI assistant suggests a department when you
                describe the issue, and the CMO office makes the final routing decision during review.
              </p>
            </div>
            <Link href="/how-it-works" className="btn btn-secondary shrink-0 bg-white">
              Read the workflow
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
