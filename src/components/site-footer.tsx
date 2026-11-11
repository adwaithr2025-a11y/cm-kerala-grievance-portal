import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Brand } from "./brand";
import { APP_DISCLAIMER } from "@/lib/constants";

const QUICK_LINKS = [
  { href: "/about", label: "About the initiative" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/departments", label: "Government departments" },
  { href: "/faq", label: "Frequently asked questions" },
];

const CITIZEN_LINKS = [
  { href: "/register", label: "Create an account" },
  { href: "/citizen/new", label: "Submit a grievance" },
  { href: "/track", label: "Track a grievance" },
  { href: "/contact", label: "Contact the CMO office" },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-brand-900 text-brand-100">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        <div>
          <Brand variant="light" compact />
          <p className="mt-5 max-w-xs text-[13px] leading-6 text-brand-100/70">
            One reference number connects citizens to the Chief Minister&apos;s Office, the
            responsible department and a verifiable resolution.
          </p>
        </div>

        <div>
          <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-brand-200">Portal</h3>
          <ul className="mt-4 space-y-2.5">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-[13px] text-brand-100/75 transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-brand-200">Citizens</h3>
          <ul className="mt-4 space-y-2.5">
            {CITIZEN_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-[13px] text-brand-100/75 transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-brand-200">CMO support desk</h3>
          <ul className="mt-4 space-y-3 text-[13px] text-brand-100/75">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden="true" />
              <span>Chief Minister&apos;s Office, Government Secretariat, Thiruvananthapuram 695001</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-gold-300" aria-hidden="true" />
              <span>grievances@cmokerala.demo</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-gold-300" aria-hidden="true" />
              <span>0471-251 0000 · Mon–Fri, 9 am – 5 pm IST</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-5 text-[11px] text-brand-100/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CM Kerala Grievance Portal. All rights reserved.</p>
          <p className="max-w-2xl sm:text-right">{APP_DISCLAIMER}</p>
        </div>
      </div>
    </footer>
  );
}
