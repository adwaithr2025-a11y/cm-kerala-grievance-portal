import { requirePageUser } from "@/lib/auth";
import { PortalShell } from "@/components/portal-shell";

export default async function OfficerLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser(["OFFICER"]);
  return (
    <PortalShell
      role="OFFICER"
      user={{ name: user.name, email: user.email, department: user.department }}
    >
      {children}
    </PortalShell>
  );
}
