import { requirePageUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { GrievanceForm } from "./grievance-form";

export const metadata = { title: "Submit a grievance" };

export default async function NewGrievancePage() {
  await requirePageUser(["CITIZEN"]);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="New grievance"
        title="Tell us what needs to be fixed."
        description="Provide the location, describe the issue and attach evidence if you have it. The AI assistant can recommend the right department before you submit."
      />
      <GrievanceForm />
    </div>
  );
}
