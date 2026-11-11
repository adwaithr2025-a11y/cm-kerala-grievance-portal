"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  X,
} from "lucide-react";
import { Brand } from "./brand";
import { ROLE_META } from "@/lib/constants";
import { cn, initials } from "@/lib/utils";

type HeaderUser = { id: string; name: string; role: "CITIZEN" | "CMO_ADMIN" | "OFFICER" } | null;

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/departments", label: "Departments" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ user }: { user: HeaderUser }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const home = user ? ROLE_META[user.role]?.home ?? "/" : "/login";

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-brand-900 text-brand-100">
        <div className="container-page flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-1.5 text-[10.5px] font-medium tracking-wide">
          <p className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-300" aria-hidden="true" />
            Chief Minister&apos;s Public Grievance Redressal · Kerala
          </p>
          <p className="hidden sm:block text-brand-200/80">Transparent · Time-bound · Accountable</p>
        </div>
      </div>

      <div className="border-b border-line/80 bg-canvas/90 backdrop-blur-md">
        <div className="container-page flex h-[68px] items-center justify-between gap-4">
          <Brand compact />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-3 py-3 text-[13px] font-medium transition-colors",
                    active ? "text-brand-800" : "text-muted hover:text-brand-800",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link href="/track" className="btn btn-secondary btn-sm">
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              Track
            </Link>
            {user ? (
              <>
                <Link href={home} className="btn btn-primary btn-sm">
                  <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
                  Dashboard
                </Link>
                <div className="group relative">
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3 text-xs font-semibold text-ink"
                    aria-label="Account menu"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-800">
                      {initials(user.name)}
                    </span>
                    <span className="max-w-24 truncate">{user.name.split(" ")[0]}</span>
                  </button>
                  <div className="invisible absolute right-0 top-full z-50 w-60 translate-y-1 rounded-xl border border-line bg-white p-2 opacity-0 shadow-card transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="px-2 py-2">
                      <p className="text-sm font-semibold text-ink">{user.name}</p>
                      <p className="mt-0.5 text-[11px] text-muted">{ROLE_META[user.role]?.label}</p>
                    </div>
                    <Link
                      href={home}
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-ink hover:bg-brand-50"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
                      Go to dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={signOut}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-medium text-rose-700 hover:bg-rose-50"
                    >
                      <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost btn-sm">
                  Sign in
                </Link>
                <Link href="/register" className="btn btn-primary btn-sm">
                  Submit a grievance
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-ink md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open ? (
          <div id="mobile-nav" className="border-t border-line bg-canvas md:hidden">
            <div className="container-page space-y-1 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-brand-50"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/track"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-brand-50"
              >
                Track a grievance
              </Link>
              <div className="grid gap-2 pt-3">
                {user ? (
                  <>
                    <Link href={home} onClick={() => setOpen(false)} className="btn btn-primary">
                      <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                      Open dashboard
                    </Link>
                    <button type="button" onClick={signOut} className="btn btn-secondary">
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Sign out ({user.name.split(" ")[0]})
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/register" onClick={() => setOpen(false)} className="btn btn-primary">
                      Submit a grievance
                    </Link>
                    <Link href="/login" onClick={() => setOpen(false)} className="btn btn-secondary">
                      Sign in
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
