import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { handleRouteError, ApiError } from "@/lib/api";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const attachment = await prisma.attachment.findUnique({
      where: { id },
      include: {
        grievance: {
          select: { citizenId: true, departmentId: true, referenceNo: true },
        },
      },
    });
    if (!attachment) throw new ApiError("Attachment not found.", 404);

    const allowed =
      user.role === "CMO_ADMIN" ||
      (user.role === "CITIZEN" && attachment.grievance.citizenId === user.id) ||
      (user.role === "OFFICER" && attachment.grievance.departmentId === user.department?.id);

    if (!allowed) throw new ApiError("You do not have access to this attachment.", 403);

    const safeName = attachment.filename.replace(/[^\w.\- ]/g, "_");
    const url = new URL(_request.url);
    const download = url.searchParams.get("download") === "1";

    return new NextResponse(Buffer.from(attachment.data), {
      status: 200,
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Length": String(attachment.size),
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${safeName}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
