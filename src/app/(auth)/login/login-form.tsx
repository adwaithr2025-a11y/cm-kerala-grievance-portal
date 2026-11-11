"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { DEMO_ACCOUNTS } from "@/lib/constants";

export function LoginForm({ notice }: { notice?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(nextEmail: string, nextPassword: string) {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nextEmail, password: nextPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data?.error ?? "Invalid email or password.");
        return;
      }
      router.push(data?.data?.redirectTo ?? data?.redirectTo ?? "/citizen");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <p className="eyebrow">Sign in</p>
      <h1 className="mt-4 text-[30px] font-semibold leading-tight">Welcome back to the portal.</h1>
      <p className="mt-2 text-[13px] leading-6 text-muted">
        Use your registered email and password. Citizens, CMO administrators and department officers
        all sign in here — the portal opens the right dashboard automatically.
      </p>

      {notice ? (
        <p className="mt-5 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-3 text-[12px] font-medium text-brand-900">
          {notice}
        </p>
      ) : null}

      {error ? (
        <div role="alert" className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-700" aria-hidden="true" />
          <p className="text-[12px] font-medium leading-5 text-rose-900">{error}</p>
        </div>
      ) : null}

      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(email, password);
        }}
      >
        <div>
          <label htmlFor="email" className="label">Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="input pl-10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="label">Password</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              className="input px-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted hover:bg-canvas"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={pending} className="btn btn-primary w-full">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
          {pending ? "Signing in…" : "Sign in securely"}
        </button>
      </form>

      <p className="mt-4 text-center text-[12px] text-muted">
        New to the portal?{" "}
        <Link href="/register" className="font-semibold text-brand-800 hover:underline">
          Create a citizen account
        </Link>
      </p>

      <div className="mt-7 rounded-2xl border border-dashed border-brand-200 bg-white p-4">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-800">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Demonstration accounts
        </p>
        <p className="mt-1.5 text-[11px] leading-5 text-muted">
          Use these accounts to explore the citizen, officer and CMO experiences.
        </p>
        <div className="mt-3 grid gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              disabled={pending}
              onClick={() => {
                setEmail(account.email);
                setPassword(account.password);
                void submit(account.email, account.password);
              }}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-canvas/50 px-3 py-2.5 text-left transition hover:border-brand-300 hover:bg-brand-50 disabled:opacity-60"
            >
              <span className="min-w-0">
                <span className="block text-[11.5px] font-semibold text-ink">{account.role}</span>
                <span className="block truncate font-mono text-[10px] text-muted">{account.email}</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-brand-700" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
