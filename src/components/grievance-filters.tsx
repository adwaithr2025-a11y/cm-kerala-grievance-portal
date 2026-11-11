"use client";

import Link from "next/link";
import { Filter, RotateCcw, Search } from "lucide-react";
import { CATEGORIES, DISTRICTS, PRIORITY_META, STATUS_META } from "@/lib/constants";

export function GrievanceFilters({
  action,
  values,
  departments,
  showDepartment = true,
}: {
  action: string;
  values: {
    q?: string;
    district?: string;
    category?: string;
    priority?: string;
    status?: string;
    departmentId?: string;
    overdue?: string;
    view?: string;
  };
  departments: { id: string; name: string }[];
  showDepartment?: boolean;
}) {
  return (
    <form method="get" action={action} className="card p-4">
      {values.view ? <input type="hidden" name="view" value={values.view} /> : null}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label htmlFor="q" className="label">Search</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              id="q"
              name="q"
              defaultValue={values.q ?? ""}
              placeholder="Reference number, subject or text…"
              className="input pl-10"
            />
          </div>
        </div>
        <div className="grid flex-[1.6] grid-cols-2 gap-2.5 sm:grid-cols-4">
          <div>
            <label htmlFor="district" className="label">District</label>
            <select id="district" name="district" defaultValue={values.district ?? ""} className="select text-[12px]" onChange={(event) => event.currentTarget.form?.requestSubmit()}>
              <option value="">All districts</option>
              {DISTRICTS.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="category" className="label">Category</label>
            <select id="category" name="category" defaultValue={values.category ?? ""} className="select text-[12px]" onChange={(event) => event.currentTarget.form?.requestSubmit()}>
              <option value="">All categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="label">Status</label>
            <select id="status" name="status" defaultValue={values.status ?? ""} className="select text-[12px]" onChange={(event) => event.currentTarget.form?.requestSubmit()}>
              <option value="">All statuses</option>
              {Object.entries(STATUS_META).map(([value, meta]) => (
                <option key={value} value={value}>{meta.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="priority" className="label">Priority</label>
            <select id="priority" name="priority" defaultValue={values.priority ?? ""} className="select text-[12px]" onChange={(event) => event.currentTarget.form?.requestSubmit()}>
              <option value="">All priorities</option>
              {Object.entries(PRIORITY_META).map(([value, meta]) => (
                <option key={value} value={value}>{meta.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-2.5 border-t border-line pt-3">
        {showDepartment ? (
          <div className="min-w-52 flex-1 sm:max-w-xs">
            <label htmlFor="departmentId" className="label">Department</label>
            <select id="departmentId" name="departmentId" defaultValue={values.departmentId ?? ""} className="select text-[12px]" onChange={(event) => event.currentTarget.form?.requestSubmit()}>
              <option value="">All departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </select>
          </div>
        ) : null}

        <label className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 text-[11.5px] font-medium text-ink">
          <input
            type="checkbox"
            name="overdue"
            value="1"
            defaultChecked={values.overdue === "1"}
            onChange={(event) => event.currentTarget.form?.requestSubmit()}
            className="h-3.5 w-3.5 accent-brand-700"
          />
          Overdue only
        </label>

        <div className="ml-auto flex items-center gap-2">
          <button type="submit" className="btn btn-primary btn-sm">
            <Filter className="h-3.5 w-3.5" aria-hidden="true" />
            Apply filters
          </button>
          <Link href={action} className="btn btn-secondary btn-sm">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset
          </Link>
        </div>
      </div>
    </form>
  );
}
