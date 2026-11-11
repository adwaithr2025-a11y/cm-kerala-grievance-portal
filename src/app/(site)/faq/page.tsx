import Link from "next/link";
import { ArrowRight, HelpCircle, MessageCircleQuestion } from "lucide-react";
import { PageHeader } from "@/components/ui";

const GROUPS = [
  {
    title: "Submitting a grievance",
    items: [
      {
        question: "Who can submit a grievance through this portal?",
        answer:
          "Any citizen can register with a name, email address, mobile number and password. Registration is free and takes less than a minute.",
      },
      {
        question: "What information do I need to file a grievance?",
        answer:
          "You need to choose the district and category, write a subject and a detailed description, and optionally attach a supporting image or PDF (up to 4 MB). The description must be at least 30 characters so that the reviewing officer understands the issue.",
      },
      {
        question: "Can I attach a photograph or document?",
        answer:
          "Yes. PNG, JPG, WebP and PDF files up to 4 MB are supported. Attachments are stored securely with the grievance and can be viewed only by you, the CMO office and the department officer handling the case.",
      },
      {
        question: "Will I get a reference number?",
        answer:
          "Yes. Immediately after submission the system generates a unique reference number in the format KLG-2026-ABC123. Keep it safe — you will need it to track the grievance, even if you are not signed in.",
      },
    ],
  },
  {
    title: "Tracking and updates",
    items: [
      {
        question: "How do I track my grievance?",
        answer:
          "Open the Track page and enter your reference number. You can see the current status, the department assigned to the case, the due date and the public activity timeline. No password is needed for tracking.",
      },
      {
        question: "What do the statuses mean?",
        answer:
          "Submitted means the portal has received the complaint. Under Review means the CMO office is examining it. In Progress means a department is investigating or acting on it. Resolved means the CMO confirmed the action-taken report. Reopened means the issue has been sent back for further action.",
      },
      {
        question: "Can I see internal government notes?",
        answer:
          "No. The portal clearly separates internal remarks (visible only to CMO staff and the handling department) from public updates. Your tracking timeline shows only the updates intended for citizens.",
      },
      {
        question: "What happens if the department is late?",
        answer:
          "Every priority level has a service-level target: High 3 days, Medium 7 days and Low 14 days. Cases past their due date are marked overdue across dashboards and can be escalated by the CMO office, which raises their priority.",
      },
    ],
  },
  {
    title: "Resolutions and feedback",
    items: [
      {
        question: "Who decides that my grievance is resolved?",
        answer:
          "The department files an action-taken report, but only the CMO office can mark the grievance Resolved after reviewing that report. A department cannot close a case on its own.",
      },
      {
        question: "What if I am not satisfied with the resolution?",
        answer:
          "You can reopen the grievance from your citizen dashboard with a reason. The case returns to the CMO queue for further action. You can also rate the resolution and leave feedback after it is resolved.",
      },
      {
        question: "Does the AI assistant decide my grievance?",
        answer:
          "No. The AI assistant only suggests a department, category and priority and writes a summary for the CMO. Every suggestion is advisory and must be reviewed by a human. If the AI service is unavailable, a clearly labelled fallback analyser is used instead.",
      },
      {
        question: "Is this portal connected to the Government of Kerala?",
        answer:
          "This is an independent demonstration environment. It is not affiliated with, authorised by, or endorsed by the Government of Kerala or the Chief Minister's Office. All records shown are sample data.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-page py-14 sm:py-16">
          <PageHeader
            eyebrow="Frequently asked questions"
            title="Answers before you file."
            description="How submission, tracking, departmental action and resolutions work — and what the AI assistant can and cannot do."
            actions={
              <Link href="/contact" className="btn btn-secondary">
                <MessageCircleQuestion className="h-4 w-4" aria-hidden="true" />
                Ask a different question
              </Link>
            }
          />
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[0.32fr_0.68fr] lg:items-start">
          <aside className="lg:sticky lg:top-32">
            <div className="card p-5">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-800">
                <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Quick help
              </p>
              <nav className="mt-4 space-y-1" aria-label="FAQ sections">
                {GROUPS.map((group, index) => (
                  <a
                    key={group.title}
                    href={`#faq-${index + 1}`}
                    className="block rounded-lg px-2.5 py-2 text-[12.5px] font-medium text-muted transition hover:bg-brand-50 hover:text-brand-800"
                  >
                    {group.title}
                  </a>
                ))}
              </nav>
              <div className="mt-5 rounded-xl bg-canvas p-4">
                <p className="text-[12px] font-semibold">Still stuck?</p>
                <p className="mt-1 text-[11.5px] leading-5 text-muted">
                  The CMO help desk replies to portal enquiries within two working days.
                </p>
                <Link href="/contact" className="btn btn-sm btn-primary mt-3 w-full">
                  Contact support
                </Link>
              </div>
            </div>
          </aside>

          <div className="space-y-10">
            {GROUPS.map((group, groupIndex) => (
              <section key={group.title} id={`faq-${groupIndex + 1}`} className="scroll-mt-32">
                <h2 className="flex items-center gap-3 text-xl font-semibold">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-800">
                    {groupIndex + 1}
                  </span>
                  {group.title}
                </h2>
                <div className="mt-4 space-y-2.5">
                  {group.items.map((item) => (
                    <details key={item.question} className="group card overflow-hidden">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[13.5px] font-semibold text-ink marker:content-none hover:bg-brand-50/40">
                        {item.question}
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line text-muted transition group-open:rotate-45 group-open:border-brand-300 group-open:text-brand-700">
                          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                          </svg>
                        </span>
                      </summary>
                      <div className="border-t border-line px-5 py-4 text-[13px] leading-7 text-muted">
                        {item.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-page">
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-brand-900 px-6 py-12 text-center text-white">
            <h2 className="max-w-xl text-2xl font-semibold sm:text-3xl">Your grievance deserves an accountable process.</h2>
            <p className="max-w-xl text-[13px] leading-6 text-brand-100/70">
              Create an account, describe the issue in your own words, and follow the case as it is
              reviewed by the CMO office and acted upon by the responsible department.
            </p>
            <Link href="/register" className="btn bg-white text-brand-900 hover:bg-brand-50">
              Submit a grievance
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
