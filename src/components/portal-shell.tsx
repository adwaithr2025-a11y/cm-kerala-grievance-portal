"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Building2,
  ClipboardList,
  ExternalLink,
  FilePlus2,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Search,
  X,
} from "lucide-react";
import { Brand } from "./brand";
import { ROLE_META } from "@/lib/constants";
import { cn, initials } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; exact?: boolean; badge?: number };

const NAV: Record<string, { label: string; items: NavItem[] }[]> = {
  CITIZEN: [
    {
      label: "Citizen portal",
      items: [
        { href: "/citizen", label: "Overview", icon: LayoutDashboard, exact: true },
        { href: "/citizen/new", label: "Submit grievance", icon: FilePlus2 },
        { href: "/citizen/grievances", label: "My grievances", icon: ClipboardList },
        { href: "/track", label: "Track by reference", icon: Search },
      ],
    },
    {
      label: "Support",
      items: [
        { href: "/faq", label: "How it works & FAQ", icon: HelpCircle },
        { href: "/contact", label: "Contact CMO office", icon: Mail },
      ],
    },
  ],
  CMO_ADMIN: [
    {
      label: "CMO operations",
      items: [
        { href: "/cmo", label: "Command centre", icon: LayoutDashboard, exact: true },
        { href: "/cmo/grievances", label: "All grievances", icon: Inbox },
        { href: "/cmo/enquiries", label: "Contact enquiries", icon: Mail },
      ],
    },
    {
      label: "Reference",
      items: [
        { href: "/cmo/grievances?view=awaiting", label: "Awaiting CMO review", icon: Bell },
        { href: "/cmo/grievances?overdue=1", label: "Overdue cases", icon: ClipboardList },
        { href: "/departments", label: "Departments", icon: Building2 },
      ],
    },
  ],
  OFFICER: [
    {
      label: "Department desk",
      items: [
        { href: "/officer", label: "Department overview", icon: LayoutDashboard, exact: true },
        { href: "/officer/grievances", label: "Assigned grievances", icon: Inbox },
        { href: "/officer/grievances?status=IN_PROGRESS", label: "In progress", icon: ClipboardList },
      ],
    },
    {
      label: "Reference",
      items: [
        { href: "/departments", label: "Department directory", icon: Building2 },
        { href: "/faq", label: "Workflow & FAQ", icon: HelpCircle },
      ],
    },
  ],
};

export function PortalShell({
  user,
  role,
  children,
}: {
  user: { name: string; email: string; department?: { name: string; code: string } | null };
  role: "CITIZEN" | "CMO_ADMIN" | "OFFICER";
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const groups = NAV[role] ?? NAV.CITIZEN;
  const roleLabel = ROLE_META[role]?.label ?? "User";

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const isActive = (item: NavItem) => {
    const [base] = item.href.split("?");
    if (item.exact) return pathname === base;
    return pathname === base || pathname.startsWith(`${base}/`);
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <div onClick={() => setOpen(false)}>
          <Brand variant="light" compact />
        </div>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.12em] text-gold-200">
          <span className="h-1.5 w-1.5 rounded-full bg-gold-300" aria-hidden="true" />
          {roleLabel} workspace
        </span>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Portal navigation">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-[9.5px] font-bold uppercase tracking-[0.16em] text-brand-200/60">{group.label}</p>
            <ul className="mt-2 space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn("sidebar-link", isActive(item) && "sidebar-link-active")}
                    aria-current={isActive(item) ? "page" : undefined}
                  >
                    <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="rounded-xl bg-white/[0.06] p-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-300/20 text-[10px] font-bold text-gold-200">
              {initials(user.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold text-white">{user.name}</p>
              <p className="truncate text-[10px] text-brand-100/60">
                {role === "OFFICER" && user.department ? user.department.name : user.email}
              </p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-1">
            <Link
              href="/"
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/5 px-2 py-1.5 text-[10px] font-semibold text-brand-100/70 transition hover:bg-white/10 hover:text-white"
            >
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
              Public site
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/5 px-2 py-1.5 text-[10px] font-semibold text-brand-100/70 transition hover:bg-rose-500/20 hover:text-white"
            >
              <LogOut className="h-3 w-3" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
        <p className="mt-2.5 px-1 text-center text-[9px] leading-4 text-brand-100/35">
          © {new Date().getFullYear()} CM Kerala Grievance Portal
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] bg-brand-900 lg:block">{sidebar}</aside>

      <div className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-white/90 px-4 backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-ink"
          aria-label="Open navigation"
          aria-expanded={open}
        >
          <Menu className="h-5 w-5" />
        </button>
        <Brand compact />
        <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-800">
          {initials(user.name)}
        </span>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-brand-900/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          />
          <div className="absolute inset-y-0 left-0 w-[280px] bg-brand-900 shadow-float">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebar}
          </div>
        </div>
      ) : null}

      <div className="lg:pl-[264px]">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {children}
        </div>
      </div>
    </div>
  );
}
