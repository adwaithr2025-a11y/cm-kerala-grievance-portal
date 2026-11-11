import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { handleRouteError, jsonOk } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { grievances: true } },
        ...(user
          ? {
              officers: {
                where: { role: "OFFICER", isActive: true },
                select: { id: true, name: true, designation: true },
                orderBy: { name: "asc" },
              },
            }
          : {}),
      },
    });
    return jsonOk({ departments });
  } catch (error) {
    return handleRouteError(error);
  }
}
