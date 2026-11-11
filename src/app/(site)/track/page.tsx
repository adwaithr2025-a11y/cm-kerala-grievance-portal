import Link from "next/link";
import { ClipboardList, Lock, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { TrackForm } from "./track-form";

export const metadata = {
  title: "Track a grievance",
  description: "Check the status, assigned department and public timeline of a grievance using its reference number.",
};

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const params = await searchParams;
  const initialReference = typeof params.ref === "string" ? params.ref.slice(0, 40) : undefined;

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-page py-14 sm:py-16">
          <PageHeader
            eyebrow="Grievance tracking"
            title="See exactly where your case stands."
            description="Enter the KLG reference number you received after submitting a grievance. No password is required for tracking."
          />
        </div>
      </section>

      <section className="section pt-10">
        <div className="container-page grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
          <TrackForm initialReference={initialReference} />

          <aside className="space-y-4 lg:sticky lg:top-32">
            <div className="card p-5">
              <h2 className="flex items-center gap-2 text-[14px] font-semibold">
                <ClipboardList className="h-4 w-4 text-brand-700" aria-hidden="true" />
                Where to find your reference
              </h2>
              <p className="mt-2 text-[12px] leading-6 text-muted">
                The reference number is shown on the confirmation screen immediately after submission,
                and again on your citizen dashboard under the grievance subject.
              </p>
            </div>
            <div className="card p-5">
              <h2 className="flex items-center gap-2 text-[14px] font-semibold">
                <Lock className="h-4 w-4 text-brand-700" aria-hidden="true" />
                Private by default
              </h2>
              <p className="mt-2 text-[12px] leading-6 text-muted">
                Public tracking shows the status and citizen-facing updates only. Internal government
                remarks, personal contact details and attachments require a signed-in account.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="flex items-center gap-2 text-[13px] font-semibold text-amber-900">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Secure tracking
              </h2>
              <p className="mt-2 text-[11.5px] leading-5 text-amber-900/80">
                Anyone with a reference number can view the public status timeline. Keep it private
                and share it only with people you trust.
              </p>
            </div>
            <Link href="/register" className="btn btn-primary w-full">
              Submit a new grievance
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
