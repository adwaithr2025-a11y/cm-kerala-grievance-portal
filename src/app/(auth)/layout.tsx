import Link from "next/link";
import { ArrowLeft, BadgeCheck, Quote } from "lucide-react";
import { Brand } from "@/components/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.02fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-brand-900 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="hero-grid absolute inset-0 opacity-20" aria-hidden="true" />
        <div className="relative">
          <Brand variant="light" />
        </div>

        <div className="relative max-w-md">
          <Quote className="h-8 w-8 text-gold-300" aria-hidden="true" />
          <p className="mt-5 font-display text-[30px] leading-[1.25] text-white">
            A grievance is not a complaint. It is a citizen asking the state to do better.
          </p>
          <p className="mt-5 text-[13px] leading-6 text-brand-100/70">
            One reference number connects your concern to the Chief Minister&apos;s Office, the
            responsible department and a verifiable resolution.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              "Submit grievances with supporting evidence",
              "Track every status change in real time",
              "Read official remarks and rate resolutions",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-[13px] text-brand-100/85">
                <BadgeCheck className="h-4 w-4 shrink-0 text-gold-300" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center justify-between gap-4 text-[10.5px] text-brand-100/50">
          <p>Secure role-based access</p>
          <Link href="/" className="inline-flex items-center gap-1.5 text-brand-100/75 transition hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to portal
          </Link>
        </div>
      </aside>

      <main id="main-content" className="flex min-h-screen flex-col bg-canvas">
        <div className="flex items-center justify-between border-b border-line bg-white px-5 py-4 lg:hidden">
          <Brand compact />
          <Link href="/" className="text-[12px] font-semibold text-brand-800">
            Back to portal
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <div className="border-t border-line px-5 py-4 text-center text-[10.5px] leading-5 text-muted sm:px-8">
          Sessions are protected with encrypted cookies and role-based access control.
        </div>
      </main>
    </div>
  );
}
