import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileCheck2,
  FileSearch,
  Inbox,
  RotateCcw,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/ui";
import { SLA_DAYS, STATUS_META } from "@/lib/constants";

const STAGES = [
  {
    step: "01",
    icon: ClipboardList,
    title: "Citizen submits a grievance",
    actor: "Citizen",
    status: "Submitted",
    description:
      "After signing in, the citizen selects the district and category, writes the complaint, and may attach a photo or PDF. The AI assistant offers a department, category and priority suggestion, which the citizen can accept or override.",
    outcome: "A unique reference number (KLG-YYYY-XXXXXX) is generated and stored with the complaint.",
  },
  {
    step: "02",
    icon: FileSearch,
    title: "The CMO reviews the case",
    actor: "CMO Administrator",
    status: "Under Review",
    description:
      "The Chief Minister's Office sees the grievance in its intake queue along with the AI summary, duplicate hints and SLA deadline. The administrator verifies the details, sets the priority and decides which department is responsible.",
    outcome: "The case is either forwarded to a department or kept under review with a clarifying remark.",
  },
  {
    step: "03",
    icon: Building2,
    title: "Department investigates",
    actor: "Department Officer",
    status: "In Progress",
    description:
      "The assigned officer opens the case in the department queue, reviews the attachments, adds public investigation remarks and keeps the status current. The CMO can monitor progress and escalate overdue cases.",
    outcome: "A factual record of the investigation is written into the case timeline.",
  },
  {
    step: "04",
    icon: FileCheck2,
    title: "Action-taken report submitted",
    actor: "Department Officer",
    status: "In Progress",
    description:
      "When the work is complete, the officer files an action-taken report describing what was done, who did it and the outcome. The case remains in progress until the CMO reviews this report — the department cannot close it alone.",
    outcome: "The report is queued in the CMO's resolution review list.",
  },
  {
    step: "05",
    icon: CheckCircle2,
    title: "CMO confirms or reopens",
    actor: "CMO Administrator",
    status: "Resolved / Reopened",
    description:
      "The CMO reviews the action-taken report. If the evidence is satisfactory, the grievance is marked Resolved and the citizen is notified. If not, it is reopened with a reason and returned to the department. Citizens may also reopen a resolved case.",
    outcome: "The citizen sees the final outcome, can rate the resolution and can reopen the case with a reason.",
  },
];

const ROLES = [
  {
    icon: UserRound,
    title: "Citizen",
    description: "Registers, submits grievances, tracks progress, reads official updates, gives feedback and can reopen a resolved case.",
    abilities: ["Submit with attachments", "Track by reference number", "Feedback and reopen"],
  },
  {
    icon: ShieldCheck,
    title: "CMO Administrator",
    description: "Owns the state-wide queue: prioritises cases, forwards them to departments, monitors SLAs, escalates delays and verifies resolutions.",
    abilities: ["Assign and escalate", "Internal notes", "Approve or reopen resolutions"],
  },
  {
    icon: Building2,
    title: "Department Officer",
    description: "Works only on grievances forwarded to their department. Investigates, updates status, records remarks and files the action-taken report.",
    abilities: ["Department-scoped queue", "Investigation remarks", "Action-taken report"],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-page py-14 sm:py-16">
          <PageHeader
            eyebrow="How it works"
            title="Every grievance follows the same accountable path."
            description="From the moment a citizen hits submit to the moment the CMO confirms a resolution, the case passes through defined stages, responsible roles and recorded statuses."
            actions={
              <Link href="/register" className="btn btn-primary">
                Start a grievance
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          />
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {["SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REOPENED"].map((status) => (
              <StatusBadge key={status} status={status} />
            ))}
            <span className="ml-1 text-[11px] text-muted">The five official statuses used by the portal.</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <ol className="relative space-y-4">
            {STAGES.map((stage, index) => (
              <li key={stage.step} className="relative">
                <div className="card grid gap-5 p-5 sm:p-6 lg:grid-cols-[auto_1fr_auto] lg:items-start lg:gap-7">
                  <div className="flex items-center gap-4 lg:flex-col lg:items-start">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-700 text-white">
                      <stage.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="font-display text-2xl font-semibold text-brand-200">{stage.step}</span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold">{stage.title}</h2>
                      <span className="rounded-full bg-canvas px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
                        {stage.actor}
                      </span>
                    </div>
                    <p className="mt-2.5 max-w-2xl text-[13.5px] leading-7 text-muted">{stage.description}</p>
                    <p className="mt-3 flex items-start gap-2 text-[12px] leading-5 text-brand-800">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {stage.outcome}
                    </p>
                  </div>
                  <div className="lg:min-w-44 lg:text-right">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Resulting status</p>
                    <p className="mt-1.5 text-[13px] font-semibold text-ink">{stage.status}</p>
                  </div>
                </div>
                {index !== STAGES.length - 1 ? (
                  <div className="flex justify-center py-1" aria-hidden="true">
                    <ArrowRight className="h-4 w-4 rotate-90 text-brand-300" />
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section border-y border-line bg-white">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="eyebrow">Roles and permissions</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight">Three roles. Strict boundaries.</h2>
              <p className="mt-4 text-[14px] leading-7 text-muted">
                Role-based access control is enforced on the server for every page and every API
                call. A department officer can never see another department&apos;s cases, and a
                citizen can only access their own grievances.
              </p>
              <div className="mt-6 rounded-2xl border border-line bg-canvas/60 p-5">
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-800">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                  Service-level targets
                </p>
                <dl className="mt-4 space-y-3">
                  {(Object.keys(SLA_DAYS) as Array<keyof typeof SLA_DAYS>).map((priority) => (
                    <div key={priority} className="flex items-center justify-between border-b border-line pb-2.5 text-[13px] last:border-0 last:pb-0">
                      <dt className="font-medium capitalize text-ink">{priority.toLowerCase()} priority</dt>
                      <dd className="text-muted">
                        {SLA_DAYS[priority]} days to closure · <span className="font-semibold text-ink">then overdue</span>
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-[11px] leading-5 text-muted">
                  Due dates are calculated from the priority at submission and can be adjusted by the
                  CMO when a case is forwarded. Overdue cases are highlighted across dashboards.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {ROLES.map((role) => (
                <div key={role.title} className="card p-5">
                  <div className="flex items-start gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                      <role.icon className="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-[16px] font-semibold">{role.title}</h3>
                      <p className="mt-1.5 text-[12.5px] leading-6 text-muted">{role.description}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {role.abilities.map((ability) => (
                          <span key={ability} className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-semibold text-brand-800">
                            {ability}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
                <Inbox className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">Status history is immutable</h3>
              <p className="mt-2 text-[13px] leading-6 text-muted">
                Every change creates a history entry with the status, timestamp and responsible user.
                Internal notes stay hidden from citizens but remain visible to the CMO and department.
              </p>
            </div>
            <div className="card p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">AI never closes a case</h3>
              <p className="mt-2 text-[13px] leading-6 text-muted">
                The AI assistant only produces suggestions and a summary. Each suggestion is clearly
                labelled as advisory and must be confirmed by a citizen or CMO officer.
              </p>
            </div>
            <div className="card p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-700">
                <RotateCcw className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">Closed is not final</h3>
              <p className="mt-2 text-[13px] leading-6 text-muted">
                If a citizen disagrees with a resolution, they can reopen the grievance with a
                reason within the portal — returning it to the CMO queue.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-line bg-brand-50/60 p-6">
            <h2 className="text-[15px] font-semibold">Statuses used in the workflow</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {Object.entries(STATUS_META).map(([key, meta]) => (
                <div key={key} className="rounded-xl border border-white bg-white p-3.5">
                  <StatusBadge status={key} />
                  <p className="mt-2 text-[11px] leading-5 text-muted">{meta.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-page">
          <div className="flex flex-col items-center gap-5 rounded-3xl border border-line bg-white px-6 py-12 text-center">
            <h2 className="max-w-xl text-2xl font-semibold sm:text-3xl">Ready to raise your concern?</h2>
            <p className="max-w-xl text-[13.5px] leading-6 text-muted">
              Register with your name, email and mobile number. It takes about a minute, and you can
              submit a grievance immediately afterwards.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/register" className="btn btn-primary">
                Create an account
              </Link>
              <Link href="/track" className="btn btn-secondary">
                Track a grievance
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
