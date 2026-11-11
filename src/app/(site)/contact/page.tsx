import Link from "next/link";
import { Clock3, Mail, MapPin, MessageSquare, Phone, Search } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { ContactForm } from "./contact-form";

const CHANNELS = [
  {
    icon: Mail,
    title: "Email",
    value: "grievances@cmokerala.demo",
    hint: "For general enquiries and portal feedback.",
  },
  {
    icon: Phone,
    title: "Help desk",
    value: "0471-251 0000",
    hint: "Monday to Friday, 9 am – 5 pm IST.",
  },
  {
    icon: MapPin,
    title: "Office",
    value: "CMO, Government Secretariat",
    hint: "Thiruvananthapuram 695001.",
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-page py-14 sm:py-16">
          <PageHeader
            eyebrow="Contact us"
            title="Talk to the Chief Minister's Office"
            description="Send a general enquiry, share feedback about the portal, or ask for help using the grievance workflow. Every message is stored in the portal database."
          />
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <ContactForm />

          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-800">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                Need to file a grievance?
              </p>
              <p className="mt-2 text-[12.5px] leading-6 text-amber-900/80">
                The contact form is for general enquiries only. To create a trackable complaint with
                a reference number, use the citizen grievance form.
              </p>
              <Link href="/register" className="btn btn-sm mt-4 bg-amber-800 text-white hover:bg-amber-900">
                Submit a grievance
              </Link>
            </div>

            {CHANNELS.map((channel) => (
              <div key={channel.title} className="card flex items-start gap-4 p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <channel.icon className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-sans text-[13px] font-semibold">{channel.title}</h2>
                  <p className="mt-1 text-[13px] font-semibold text-brand-800">{channel.value}</p>
                  <p className="mt-1 text-[11.5px] leading-5 text-muted">{channel.hint}</p>
                </div>
              </div>
            ))}

            <div className="card p-5">
              <h2 className="flex items-center gap-2 font-sans text-[13px] font-semibold">
                <MessageSquare className="h-4 w-4 text-brand-700" aria-hidden="true" />
                Already submitted a grievance?
              </h2>
              <p className="mt-1.5 text-[11.5px] leading-5 text-muted">
                Use your KLG reference number to see the status, the assigned department and the
                public timeline without contacting us.
              </p>
              <Link href="/track" className="btn btn-secondary btn-sm mt-3">
                <Search className="h-3.5 w-3.5" aria-hidden="true" />
                Track a grievance
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
