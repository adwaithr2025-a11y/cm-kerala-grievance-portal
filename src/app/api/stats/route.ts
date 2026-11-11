import { requireApiUser } from "@/lib/auth";
import { handleRouteError, jsonOk } from "@/lib/api";
import { getCmoStats } from "@/lib/grievance-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireApiUser(["CMO_ADMIN"]);
    const stats = await getCmoStats();
    return jsonOk({ stats });
  } catch (error) {
    return handleRouteError(error);
  }
}
