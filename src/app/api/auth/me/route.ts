import { getCurrentUser } from "@/lib/auth";
import { handleRouteError, jsonOk } from "@/lib/api";
import { ROLE_META } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonOk({ user: null });
    return jsonOk({ user, menu: ROLE_META[user.role] });
  } catch (error) {
    return handleRouteError(error);
  }
}
