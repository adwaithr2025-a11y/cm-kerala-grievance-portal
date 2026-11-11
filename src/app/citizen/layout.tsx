import { requirePageUser } from "@/lib/auth";
import { PortalShell } from "@/components/portal-shell";

export default async function CitizenLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser(["CITIZEN"]);
  return (
    <PortalShell role="CITIZEN" user={{ name: user.name, email: user.email }}>
      {children}
    </PortalShell>
  );
}
