import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import { requirePageUser } from "@/lib/auth";
import { EmptyState, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contact enquiries" };

export default async function CmoEnquiriesPage() {
  await requirePageUser(["CMO_ADMIN"]);
  const enquiries = await prisma.contactEnquiry.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  const newCount = enquiries.filter((enquiry) => enquiry.status === "NEW").length;

  return (
    <div className="space-y-5">
      <div>
        <Link href="/cmo" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted transition hover:text-brand-800">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to command centre
        </Link>
      </div>
      <PageHeader
        eyebrow="Public enquiries"
        title="Contact enquiries"
        description="Messages submitted through the public Contact Us form. These are general enquiries — grievances must be filed through the citizen portal."
        actions={
          <span className="rounded-full bg-brand-50 px-3 py-1.5 text-[11px] font-semibold text-brand-800">
            {enquiries.length} total · {newCount} new
          </span>
        }
      />

      {enquiries.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No enquiries yet"
          description="Messages sent from the public contact form will appear here."
          action={<Link href="/contact" className="btn btn-secondary">Open contact page</Link>}
        />
      ) : (
        <div className="space-y-3">
          {enquiries.map((enquiry) => (
            <article key={enquiry.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-[14px] font-semibold text-ink">{enquiry.subject}</h2>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-muted">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" aria-hidden="true" />
                      {enquiry.name} · {enquiry.email}
                    </span>
                    <span>{formatDateTime(enquiry.createdAt)}</span>
                  </p>
                </div>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-amber-800 ring-1 ring-inset ring-amber-200">
                  {enquiry.status.replaceAll("_", " ")}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-line rounded-xl bg-canvas/60 px-4 py-3 text-[12px] leading-6 text-ink/80">
                {enquiry.message}
              </p>
              <div className="mt-3 flex justify-end">
                <a
                  href={`mailto:${enquiry.email}?subject=${encodeURIComponent(`Re: ${enquiry.subject} — CM Kerala Grievance Portal`)}`}
                  className="btn btn-secondary btn-sm"
                >
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  Reply by email
                </a>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-line bg-white p-4">
        <p className="flex items-center gap-2 text-[11.5px] font-semibold text-ink">
          <Phone className="h-4 w-4 text-brand-700" aria-hidden="true" />
          CMO help desk
        </p>
        <p className="mt-1 text-[11px] leading-5 text-muted">
          Enquiries submitted through the public contact form are listed here for review.
        </p>
      </div>
    </div>
  );
}
