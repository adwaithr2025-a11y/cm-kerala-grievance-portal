import Link from "next/link";
import { ArrowRight, Compass, Eye, Flag, Landmark, Scale, ShieldCheck, Target, Users } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/ui";

const OBJECTIVES = [
  {
    icon: Target,
    title: "Single window for citizens",
    description:
      "Remove the need to visit multiple offices or write to different departments. One complaint, one reference number, one accountable trail.",
  },
  {
    icon: Eye,
    title: "Transparent progress",
    description:
      "Citizens can see the current status, the department handling the case and every public update without filing an RTI request.",
  },
  {
    icon: Scale,
    title: "Consistent prioritisation",
    description:
      "Priority and due dates follow the same rules for every citizen, with AI suggestions reviewed by a human before they take effect.",
  },
  {
    icon: ShieldCheck,
    title: "Auditable administration",
    description:
      "Every status change, assignment, remark and escalation is stored with a timestamp and the responsible user.",
  },
];

const PRINCIPLES = [
  {
    title: "Citizen first",
    description: "Plain language, mobile-friendly screens and a trackable reference instead of paperwork.",
  },
  {
    title: "Human accountability",
    description: "AI can recommend; only authorised officers can assign, escalate, resolve or reopen a grievance.",
  },
  {
    title: "Department ownership",
    description: "Once forwarded, the department owns the investigation and must file an action-taken report.",
  },
  {
    title: "Verified closure",
    description: "A department's report does not close a case automatically — the CMO reviews and confirms it.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-page py-14 sm:py-16">
          <PageHeader
            eyebrow="About the initiative"
            title="A direct line between citizens and the Chief Minister's Office."
            description="The CM Kerala Grievance Portal gives every citizen a direct channel to the Chief Minister's Office — capturing public grievances, routing them to the right department and recording proof that action was taken."
            actions={
              <Link href="/how-it-works" className="btn btn-secondary">
                See how it works
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          />
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="prose-copy max-w-2xl">
              <p>
                Every day, citizens raise issues that shape the quality of public life: a broken
                road near a school, a health centre without medicines, a water pipeline that has
                not been repaired for weeks. These concerns are legitimate, but they are often
                scattered across departments and lost between desks.
              </p>
              <p>
                This portal brings them into a single, traceable workflow. A citizen submits a
                grievance and receives a reference number. The Chief Minister&apos;s Office reviews
                the case and forwards it to the responsible department. A department officer
                investigates, records progress and files an action-taken report. Only after the CMO
                confirms that report is the grievance marked resolved.
              </p>
              <p>
                The design principle is simple: <strong className="text-ink">technology should make
                accountability visible</strong>. The portal does not replace officers or
                departments. It gives them a shared record — and gives citizens a window into it.
              </p>
            </div>
            <div className="card h-fit p-6">
              <p className="eyebrow">Purpose</p>
              <p className="mt-4 text-[14px] leading-7 text-muted">
                To provide every citizen of Kerala with a simple, transparent and accountable
                channel to bring public-service grievances directly to the attention of the Chief
                Minister&apos;s Office, and to ensure that each grievance is routed, acted upon and
                closed with a verifiable record.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-6 lg:grid-cols-3">
          <div className="card p-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <Eye className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-semibold">Vision</h2>
            <p className="mt-2.5 text-[13px] leading-6 text-muted">
              A Kerala where no public grievance is ignored because it reached the wrong desk — and
              where every citizen can see the state responding to their concern.
            </p>
          </div>
          <div className="card p-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <Compass className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-semibold">Mission</h2>
            <p className="mt-2.5 text-[13px] leading-6 text-muted">
              Deliver a trustworthy grievance redressal platform that captures citizen issues
              accurately, routes them to the correct department quickly, and records every action
              taken on the case.
            </p>
          </div>
          <div className="card p-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <Flag className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-semibold">Commitment</h2>
            <p className="mt-2.5 text-[13px] leading-6 text-muted">
              No grievance closes without a department&apos;s action-taken report and a CMO review.
              Citizens can disagree with the outcome and reopen the case.
            </p>
          </div>
        </div>
      </section>

      <section className="section border-y border-line bg-white">
        <div className="container-page">
          <SectionHeading
            eyebrow="Objectives"
            title="What this portal sets out to achieve"
            description="Four practical objectives shape every screen and every API in the system."
            align="center"
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {OBJECTIVES.map((objective) => (
              <div key={objective.title} className="flex gap-4 rounded-2xl border border-line p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-700 text-white">
                  <objective.icon className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-sans text-[15px] font-semibold">{objective.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-6 text-muted">{objective.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <SectionHeading
            eyebrow="Guiding principles"
            title="How decisions are made"
            description="The workflow is deliberately strict about who can do what, because a grievance system is only as credible as its audit trail."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {PRINCIPLES.map((principle, index) => (
              <div key={principle.title} className="rounded-2xl border border-line bg-white p-5">
                <p className="font-display text-2xl font-semibold text-brand-200">0{index + 1}</p>
                <h3 className="mt-2 font-sans text-[14px] font-semibold">{principle.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-6 text-muted">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-page">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-brand-900 p-8 text-white sm:flex-row sm:items-center sm:p-10">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-gold-300">
                <Landmark className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-2xl font-semibold">Built for accountable governance</h2>
                <p className="mt-2 max-w-xl text-[13px] leading-6 text-brand-100/70">
                  Every grievance is routed, reviewed and resolved through a single auditable
                  workflow — with each step timestamped, attributed and open to citizen review.
                </p>
              </div>
            </div>
            <Link href="/register" className="btn shrink-0 bg-white text-brand-900 hover:bg-brand-50">
              <Users className="h-4 w-4" aria-hidden="true" />
              Try the citizen portal
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
