import { getClientIp, handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { getPublicTracking } from "@/lib/grievance-service";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`track:${ip}`, 60, 15 * 60 * 1000);
    if (!limit.ok) return jsonError("Too many lookups. Please try again shortly.", 429);

    const { reference } = await params;
    const clean = decodeURIComponent(reference).trim();
    if (!/^KLG-\d{4}-[A-Z0-9]{6}$/i.test(clean)) {
      return jsonError("Reference numbers look like KLG-2026-ABC123.", 422);
    }

    const grievance = await getPublicTracking(clean);
    if (!grievance) {
      return jsonError("No grievance was found for this reference number.", 404);
    }
    return jsonOk({ grievance });
  } catch (error) {
    return handleRouteError(error);
  }
}
