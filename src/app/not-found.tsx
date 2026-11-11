import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Brand } from "@/components/brand";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
          <Brand />
          <Link href="/track" className="btn btn-secondary btn-sm">
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            Track a grievance
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <span className="rounded-full bg-brand-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700 ring-1 ring-brand-100">
          Error 404
        </span>
        <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          This page could not be found
        </h1>
        <p className="mt-3 max-w-md text-[13px] leading-6 text-muted">
          The link may be outdated, or the page may have moved. You can return to the public site,
          sign in to your workspace, or track a grievance by its reference number.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          <Link href="/" className="btn btn-primary">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
          <Link href="/login" className="btn btn-secondary">
            Sign in
          </Link>
          <Link href="/track" className="btn btn-secondary">
            Track grievance
          </Link>
        </div>
      </main>
    </div>
  );
}
