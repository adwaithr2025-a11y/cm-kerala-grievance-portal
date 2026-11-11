import { requireApiUser } from "@/lib/auth";
import { handleRouteError, jsonOk, readJson } from "@/lib/api";
import { resolutionSchema } from "@/lib/validation";
import { submitResolution } from "@/lib/grievance-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiUser(["OFFICER"]);
    const { id } = await params;
    const input = resolutionSchema.parse(await readJson(request));
    await submitResolution(user, id, input.report);
    return jsonOk({
      message: "Action-taken report submitted. The CMO office will review it before closing the case.",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
