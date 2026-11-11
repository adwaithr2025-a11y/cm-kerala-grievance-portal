import { requirePageUser } from "@/lib/auth";
import { PortalShell } from "@/components/portal-shell";

export default async function CmoLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser(["CMO_ADMIN"]);
  return (
    <PortalShell role="CMO_ADMIN" user={{ name: user.name, email: user.email }}>
      {children}
    </PortalShell>
  );
}
