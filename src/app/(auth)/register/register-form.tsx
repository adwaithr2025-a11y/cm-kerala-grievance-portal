"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";

type Errors = Record<string, string>;

export function RegisterForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setErrors({});

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirmPassword") ?? "");

    if (password !== confirm) {
      setErrors({ confirmPassword: "Passwords do not match" });
      setPending(false);
      return;
    }

    const payload = {
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      mobile: String(form.get("mobile") ?? "").trim(),
      password,
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const next: Errors = {};
        if (Array.isArray(result?.details)) {
          for (const detail of result.details) {
            if (detail && typeof detail.field === "string") {
              next[detail.field] = String(detail.message ?? "");
            }
          }
        }
        if (Object.keys(next).length > 0) {
          setErrors(next);
        } else {
          setError(result?.error ?? "Could not create your account. Please try again.");
        }
        return;
      }

      router.push("/citizen?welcome=1");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <p className="eyebrow">Create account</p>
      <h1 className="mt-4 text-[30px] font-semibold leading-tight">Your grievance deserves a record.</h1>
      <p className="mt-2 text-[13px] leading-6 text-muted">
        Register as a citizen to submit grievances, attach evidence and follow every status change.
        It takes less than a minute.
      </p>

      {error ? (
        <div role="alert" className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-700" aria-hidden="true" />
          <p className="text-[12px] font-medium leading-5 text-rose-900">{error}</p>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="label">Full name</label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="e.g. Ananya Menon"
              className="input pl-10"
              aria-invalid={Boolean(errors.name)}
            />
          </div>
          {errors.name ? <p className="field-error">{errors.name}</p> : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="label">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="input pl-10"
                aria-invalid={Boolean(errors.email)}
              />
            </div>
            {errors.email ? <p className="field-error">{errors.email}</p> : null}
          </div>
          <div>
            <label htmlFor="mobile" className="label">Mobile number</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                id="mobile"
                name="mobile"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                required
                maxLength={10}
                placeholder="10-digit number"
                className="input pl-10"
                aria-invalid={Boolean(errors.mobile)}
              />
            </div>
            {errors.mobile ? <p className="field-error">{errors.mobile}</p> : null}
          </div>
        </div>

        <div>
          <label htmlFor="password" className="label">Password</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="At least 8 characters"
              className="input px-10"
              aria-invalid={Boolean(errors.password)}
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
          {errors.password ? (
            <p className="field-error">{errors.password}</p>
          ) : (
            <p className="hint">Include at least one letter and one number.</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label">Confirm password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            placeholder="Re-enter your password"
            className="input"
            aria-invalid={Boolean(errors.confirmPassword)}
          />
          {errors.confirmPassword ? <p className="field-error">{errors.confirmPassword}</p> : null}
        </div>

        <button type="submit" disabled={pending} className="btn btn-primary w-full">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {pending ? "Creating account…" : "Create citizen account"}
          {!pending ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
        </button>
      </form>

      <p className="mt-4 text-center text-[12px] text-muted">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-brand-800 hover:underline">
          Sign in instead
        </Link>
      </p>
      <p className="mt-4 text-center text-[10.5px] leading-5 text-muted">
        By registering you confirm that the details you provide are accurate and agree to use the
        portal responsibly.
      </p>
    </div>
  );
}
