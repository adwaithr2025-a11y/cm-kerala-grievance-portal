"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { STATUS_META } from "@/lib/constants";

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "#0ea5e9",
  UNDER_REVIEW: "#f59e0b",
  IN_PROGRESS: "#6366f1",
  RESOLVED: "#10b981",
  REOPENED: "#f43f5e",
};

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #dfe6df",
  fontSize: 11,
  boxShadow: "0 10px 30px -18px rgba(18,37,31,0.35)",
};

export function StatusDonut({ data }: { data: { status: string; count: number }[] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const pieData = data.map((item) => ({
    ...item,
    label: STATUS_META[item.status]?.label ?? item.status,
  }));
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row">
      <div className="relative h-[190px] w-full sm:w-[190px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} dataKey="count" nameKey="label" innerRadius={54} outerRadius={78} paddingAngle={2} stroke="none">
              {data.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#94a3b8"} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-semibold leading-none text-ink">{total}</span>
          <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">Total</span>
        </div>
      </div>
      <ul className="w-full flex-1 space-y-2">
        {data.map((entry) => (
          <li key={entry.status} className="flex items-center justify-between gap-2 text-[11.5px]">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[entry.status] ?? "#94a3b8" }} aria-hidden="true" />
              <span className="text-muted">{STATUS_META[entry.status]?.label ?? entry.status}</span>
            </span>
            <span className="font-semibold text-ink">{entry.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TrendChart({ data }: { data: { label: string; created: number; resolved: number }[] }) {
  return (
    <div className="h-[230px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
          <defs>
            <linearGradient id="createdFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#318365" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#318365" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="resolvedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c49434" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#c49434" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8eee8" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#5b6b64" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#5b6b64" }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
          <Area type="monotone" dataKey="created" name="Received" stroke="#318365" strokeWidth={2} fill="url(#createdFill)" />
          <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#c49434" strokeWidth={2} fill="url(#resolvedFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DistrictChart({ data }: { data: { district: string; count: number }[] }) {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8eee8" vertical={false} />
          <XAxis
            dataKey="district"
            tick={{ fontSize: 9.5, fill: "#5b6b64" }}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-32}
            textAnchor="end"
            height={54}
          />
          <YAxis tick={{ fontSize: 10, fill: "#5b6b64" }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f2f7f3" }} />
          <Bar dataKey="count" name="Grievances" fill="#21694f" radius={[5, 5, 0, 0]} maxBarSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DepartmentChart({ data }: { data: { name: string; count: number }[] }) {
  const shortened = data.slice(0, 7).map((item) => ({
    ...item,
    label: item.name.length > 24 ? `${item.name.slice(0, 22)}…` : item.name,
  }));
  return (
    <div className="h-[270px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={shortened} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8eee8" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: "#5b6b64" }} tickLine={false} axisLine={false} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="label"
            width={140}
            tick={{ fontSize: 10, fill: "#12251f" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f2f7f3" }} />
          <Bar dataKey="count" name="Grievances" fill="#52a181" radius={[0, 5, 5, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
