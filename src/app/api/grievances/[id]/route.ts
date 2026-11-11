import { requireApiUser } from "@/lib/auth";
import { handleRouteError, jsonOk } from "@/lib/api";
import { getGrievanceForActor } from "@/lib/grievance-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const grievance = await getGrievanceForActor(id, user);
    return jsonOk({ grievance });
  } catch (error) {
    return handleRouteError(error);
  }
}
