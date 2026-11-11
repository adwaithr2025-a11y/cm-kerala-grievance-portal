import { requireApiUser } from "@/lib/auth";
import { handleRouteError, jsonOk, readJson } from "@/lib/api";
import { feedbackSchema } from "@/lib/validation";
import { addFeedback } from "@/lib/grievance-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiUser(["CITIZEN"]);
    const { id } = await params;
    const input = feedbackSchema.parse(await readJson(request));
    await addFeedback(user, id, input.rating, input.comments || undefined);
    return jsonOk({ message: "Thank you. Your feedback has been recorded." });
  } catch (error) {
    return handleRouteError(error);
  }
}
