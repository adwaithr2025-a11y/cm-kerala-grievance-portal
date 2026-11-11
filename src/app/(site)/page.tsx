import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileSearch,
  Landmark,
  MapPin,
  MessageSquareHeart,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getPublicStats } from "@/lib/grievance-service";
import { DEPARTMENTS_SEED, STATUS_META } from "@/lib/constants";
import { SectionHeading, StatCard, StatusBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Citizen submits",
    description: "Describe the issue, add a photo or document, and receive a unique KLG reference number instantly.",
  },
  {
    icon: FileSearch,
    title: "CMO reviews",
    description: "The Chief Minister's Office opens the complaint, reviews the AI summary and sets the priority.",
  },
  {
    icon: Building2,
    title: "Department acts",
    description: "The grievance is forwarded to the responsible department and an officer investigates on the ground.",
  },
  {
    icon: CheckCircle2,
    title: "Outcome confirmed",
    description: "The officer files an action-taken report. The CMO verifies it before the citizen is notified.",
  },
];

const FEATURES = [
  {
    icon: Search,
    title: "Track every step",
    description:
      "Follow your grievance from submission to resolution with a timestamped public timeline — no phone calls required.",
  },
  {
    icon: Bot,
    title: "AI triage, human decision",
    description:
      "The AI assistant suggests the department, category and priority. A citizen and a CMO officer always review the suggestion.",
  },
  {
    icon: ShieldCheck,
    title: "Accountable by design",
    description:
      "Every status change records the responsible officer, the time and the reason, so nothing is lost between desks.",
  },
  {
    icon: MessageSquareHeart,
    title: "Citizen feedback closes the loop",
    description:
      "After a resolution you can rate the outcome or reopen the case with a reason if the problem persists.",
  },
];

export default async function HomePage() {
  let stats = { total: 0, resolved: 0, departments: 0, districtsCovered: 0 };
  let featured: { id: string; name: string; code: string; description: string; _count: { grievances: number } }[] = [];

  try {
    stats = await getPublicStats();
    const departments = await prisma.department.findMany({
      take: 6,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        _count: { select: { grievances: true } },
      },
    });
    featured = departments;
  } catch {
    featured = DEPARTMENTS_SEED.slice(0, 6).map((department, index) => ({
      id: String(index),
      name: department.name,
      code: department.code,
      description: department.description,
      _count: { grievances: 0 },
    }));
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-brand-50 via-canvas to-canvas">
        <div className="hero-grid absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="container-page relative grid gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div className="animate-rise">
            <p className="eyebrow">
              <Landmark className="h-3 w-3" aria-hidden="true" />
              Chief Minister&apos;s Public Grievance Redressal
            </p>
            <h1 className="mt-6 text-[42px] font-semibold leading-[1.06] text-ink sm:text-[54px]">
              Your voice reaches the
              <span className="relative mx-2 inline-block text-brand-700">
                Chief Minister&apos;s Office
                <svg
                  className="absolute -bottom-1 left-0 h-2.5 w-full text-gold-300"
                  viewBox="0 0 200 10"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M2 7 C 50 2, 150 2, 198 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
              — not a filing cabinet.
            </h1>
            <p className="mt-6 max-w-xl text-[16px] leading-8 text-muted">
              Submit a grievance about roads, healthcare, education, water or any public service.
              Track exactly which department is acting on it, read official updates, and hold the
              system accountable until the issue is resolved.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/register" className="btn btn-primary px-6">
                Submit a grievance
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/track" className="btn btn-secondary px-6">
                <Search className="h-4 w-4" aria-hidden="true" />
                Track with reference number
              </Link>
            </div>
            <p className="mt-6 flex items-center gap-2 text-xs text-muted">
              <BadgeCheck className="h-4 w-4 text-brand-600" aria-hidden="true" />
              Free to use · Transparent tracking · Time-bound resolution
            </p>
          </div>

          <div className="relative animate-rise lg:pl-6">
            <div className="card overflow-hidden shadow-float">
              <div className="flex items-center justify-between gap-3 border-b border-line bg-canvas/60 px-5 py-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                  <span className="h-2 w-2 rounded-full bg-rose-400" aria-hidden="true" />
                  <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
                  <span className="ml-2">Live case journey</span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-brand-800">KLG-2026-8KQ4M2</span>
              </div>
              <div className="space-y-5 p-5 sm:p-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status="IN_PROGRESS" />
                    <span className="text-[11px] font-medium text-muted">Public Works Department</span>
                  </div>
                  <h2 className="mt-3 font-sans text-[15px] font-semibold leading-6 text-ink">
                    Damaged footpath and open drain near Government UP School, Kazhakkoottam
                  </h2>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    Thiruvananthapuram · Reported 4 days ago
                  </p>
                </div>

                <div className="rounded-xl border border-brand-100 bg-brand-50/70 p-3.5">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-800">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    AI assistant summary
                  </p>
                  <p className="mt-1.5 text-[12px] leading-5 text-ink/80">
                    Safety hazard affecting schoolchildren; suggests Public Works, High priority,
                    site inspection within 3 days.
                  </p>
                </div>

                <ol className="relative space-y-4">
                  {[
                    { label: "Submitted by citizen", meta: "11 Nov, 9:12 am", done: true },
                    { label: "Reviewed and forwarded by CMO", meta: "11 Nov, 11:40 am", done: true },
                    { label: "Department inspection underway", meta: "12 Nov, 8:05 am", done: true, active: true },
                    { label: "Action-taken report for CMO review", meta: "Awaiting", done: false },
                  ].map((step, index, list) => (
                    <li key={step.label} className="relative flex gap-3">
                      {index !== list.length - 1 ? (
                        <span className="absolute left-[11px] top-6 h-[calc(100%-6px)] w-px bg-line" aria-hidden="true" />
                      ) : null}
                      <span
                        className={
                          step.done
                            ? "relative z-10 mt-0.5 grid h-[23px] w-[23px] shrink-0 place-items-center rounded-full bg-brand-700 text-white"
                            : "relative z-10 mt-0.5 grid h-[23px] w-[23px] shrink-0 place-items-center rounded-full border border-line bg-white text-muted"
                        }
                      >
                        {step.done ? (
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-line" aria-hidden="true" />
                        )}
                      </span>
                      <div>
                        <p className={step.active ? "text-[12.5px] font-semibold text-brand-800" : "text-[12.5px] font-medium text-ink"}>
                          {step.label}
                        </p>
                        <p className="text-[10.5px] text-muted">{step.meta}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-3 hidden items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-[11px] font-semibold text-ink shadow-card sm:flex lg:-left-2">
              <ShieldCheck className="h-4 w-4 text-brand-600" aria-hidden="true" />
              Every action is logged with the responsible officer
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-white">
        <div className="container-page grid grid-cols-2 gap-3 py-8 sm:grid-cols-4 sm:gap-4">
          <StatCard label="Grievances received" value={stats.total} hint="Updated in real time" icon={ClipboardList} tone="brand" />
          <StatCard label="Resolved after CMO review" value={stats.resolved} hint="Verified action-taken reports" icon={CheckCircle2} tone="emerald" />
          <StatCard label="Departments connected" value={stats.departments} hint="From health to public works" icon={Building2} tone="indigo" />
          <StatCard label="Districts covered" value={stats.districtsCovered} hint="Across Kerala" icon={MapPin} tone="amber" />
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="How it works"
              title="One grievance. Five accountable steps."
              description="The portal follows a single, auditable workflow. No grievance can skip the Chief Minister's Office review or the department's action-taken report."
            />
            <Link href="/how-it-works" className="btn btn-secondary shrink-0">
              See the full workflow
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {STEPS.map((step, index) => (
              <div key={step.title} className="card card-pad relative">
                <span className="absolute right-5 top-5 font-display text-4xl font-semibold text-brand-50">
                  0{index + 1}
                </span>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                  <step.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-[13px] leading-6 text-muted">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 card flex flex-col items-start justify-between gap-4 bg-brand-900 p-5 text-brand-100 sm:flex-row sm:items-center sm:px-6">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-gold-300">
                <BadgeCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">The final decision always belongs to a human officer.</p>
                <p className="mt-0.5 text-[12px] leading-5 text-brand-100/70">
                  Statuses used by the portal: {Object.values(STATUS_META).map((meta) => meta.label).join(" · ")}.
                </p>
              </div>
            </div>
            <Link href="/login" className="btn btn-sm bg-white/10 text-white hover:bg-white/20">
              Sign in to the portal
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section border-y border-line bg-white">
        <div className="container-page">
          <SectionHeading
            eyebrow="Built for citizens"
            title="What you can do in minutes"
            description="Every feature is designed around one question: can a citizen see exactly what happened to their complaint?"
            align="center"
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex gap-4 rounded-2xl border border-line bg-canvas/40 p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-700 text-white">
                  <feature.icon className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-sans text-[14.5px] font-semibold text-ink">{feature.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-6 text-muted">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Featured departments"
              title="The right desk, every time."
              description="Eleven state departments participate in the portal, each with a named officer queue and its own accountability record."
            />
            <Link href="/departments" className="btn btn-secondary shrink-0">
              All departments
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((department) => (
              <Link
                key={department.id}
                href="/departments"
                className="card group p-5 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 font-mono text-[11px] font-bold text-brand-800">
                    {department.code}
                  </span>
                  <span className="rounded-full bg-canvas px-2.5 py-1 text-[10px] font-semibold text-muted">
                    {department._count.grievances} cases
                  </span>
                </div>
                <h3 className="mt-4 text-[16px] font-semibold leading-snug group-hover:text-brand-800">
                  {department.name}
                </h3>
                <p className="mt-2 text-[12.5px] leading-6 text-muted">{department.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-page">
          <div className="overflow-hidden rounded-3xl bg-brand-900">
            <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="hero-grid absolute inset-0 opacity-20" aria-hidden="true" />
              <div className="relative">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gold-200">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  AI Grievance Assistant
                </p>
                <h2 className="mt-5 text-3xl font-semibold leading-tight text-white sm:text-[36px]">
                  A first responder that reads the complaint, not a decision-maker.
                </h2>
                <p className="mt-4 max-w-xl text-[14px] leading-7 text-brand-100/75">
                  The assistant analyses the complaint text and recommends the department, category
                  and priority, writes a short summary for the CMO, and flags possible duplicates.
                  Suggestions are shown to the citizen and the CMO — and can be overridden at any time.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Department and category recommendation",
                    "Low / Medium / High priority with SLA hint",
                    "CMO briefing summary and duplicate flags",
                    "Clearly labelled fallback when the model is unavailable",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-[13px] text-brand-100/85">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-gold-300" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative rounded-2xl border border-white/10 bg-white/95 p-5 shadow-float">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-800">
                    <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                    Advisory output
                  </p>
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-amber-800">
                    Human review required
                  </span>
                </div>
                <dl className="mt-4 space-y-3.5">
                  <div className="flex items-center justify-between gap-4 text-[12.5px]">
                    <dt className="text-muted">Suggested department</dt>
                    <dd className="font-semibold text-ink">Health &amp; Family Welfare</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-[12.5px]">
                    <dt className="text-muted">Category</dt>
                    <dd className="font-semibold text-ink">Healthcare</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-[12.5px]">
                    <dt className="text-muted">Priority</dt>
                    <dd className="rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-rose-800">High</dd>
                  </div>
                  <div className="h-px bg-line" />
                  <div className="text-[12px] leading-5 text-muted">
                    <p className="font-semibold text-ink">Summary for the CMO</p>
                    <p className="mt-1">
                      Primary health centre reports a two-week shortage of essential medicines and
                      no duty doctor at night. Outpatient load is high; urgent supply intervention advised.
                    </p>
                  </div>
                </dl>
                <p className="mt-4 rounded-lg bg-canvas px-3 py-2 text-[10.5px] leading-4 text-muted">
                  AI suggestions are advisory. A citizen or CMO officer must confirm them before any
                  official action is recorded.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-brand-50/60">
        <div className="container-page flex flex-col items-center gap-6 py-14 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-brand-700 shadow-card">
            <Users className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-3xl font-semibold">Public services improve when citizens are heard.</h2>
            <p className="mx-auto mt-3 max-w-2xl text-[14px] leading-7 text-muted">
              Create a free account to submit a grievance and follow it to closure. Already filed one?
              Use your reference number to check the current status without signing in.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn btn-primary px-6">
              Create a citizen account
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/track" className="btn btn-secondary px-6">
              Track an existing grievance
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
