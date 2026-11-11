import { requireApiUser } from "@/lib/auth";
import { handleRouteError, jsonOk, readJson } from "@/lib/api";
import { reviewResolutionSchema } from "@/lib/validation";
import { reviewResolution } from "@/lib/grievance-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiUser(["CMO_ADMIN"]);
    const { id } = await params;
    const input = reviewResolutionSchema.parse(await readJson(request));
    await reviewResolution(user, id, input.action, input.note || undefined);
    return jsonOk({
      message:
        input.action === "APPROVE"
          ? "Resolution confirmed. The citizen can now see the outcome."
          : "Resolution rejected. The grievance has been reopened.",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
