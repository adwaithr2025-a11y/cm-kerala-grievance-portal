import { destroySession } from "@/lib/auth";
import { handleRouteError, jsonOk } from "@/lib/api";

export async function POST() {
  try {
    await destroySession();
    return jsonOk({ loggedOut: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
