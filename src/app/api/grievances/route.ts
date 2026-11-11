import { requireApiUser } from "@/lib/auth";
import { getClientIp, handleRouteError, jsonError, jsonOk, readJson } from "@/lib/api";
import { grievanceSubmitSchema, validateAttachment } from "@/lib/validation";
import { createGrievance, listGrievances } from "@/lib/grievance-service";
import { ALLOWED_ATTACHMENT_TYPES } from "@/lib/constants";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireApiUser();
    const url = new URL(request.url);
    const result = await listGrievances(user, {
      district: url.searchParams.get("district") ?? undefined,
      category: url.searchParams.get("category") ?? undefined,
      priority: url.searchParams.get("priority") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      departmentId: url.searchParams.get("departmentId") ?? undefined,
      q: url.searchParams.get("q") ?? undefined,
      overdue: url.searchParams.get("overdue") ?? undefined,
      view: url.searchParams.get("view") ?? undefined,
      page: url.searchParams.get("page") ?? undefined,
    });
    return jsonOk(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(["CITIZEN"]);
    const ip = getClientIp(request);
    const limit = rateLimit(`grievance:${user.id}:${ip}`, 10, 60 * 60 * 1000);
    if (!limit.ok) {
      return jsonError("You have reached the submission limit. Please try again later.", 429);
    }

    const contentType = request.headers.get("content-type") ?? "";
    let raw: Record<string, unknown> = {};
    let attachment: { filename: string; mimeType: string; size: number; data: Uint8Array } | null = null;
    let attachmentError: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const aiRaw = form.get("ai");
      if (typeof aiRaw === "string" && aiRaw.trim()) {
        try {
          raw = JSON.parse(aiRaw) as Record<string, unknown>;
        } catch {
          return jsonError("AI analysis data was malformed.", 422);
        }
      }
      raw = {
        ...raw,
        district: form.get("district"),
        category: form.get("category"),
        subject: form.get("subject"),
        description: form.get("description"),
        priority: form.get("priority") ?? "MEDIUM",
      };

      const file = form.get("attachment");
      if (file instanceof File && file.size > 0) {
        attachmentError = validateAttachment(file);
        if (!attachmentError && !ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
          attachmentError = "Attach a PNG, JPG, WebP image or a PDF document.";
        }
        if (!attachmentError) {
          const buffer = Buffer.from(await file.arrayBuffer());
          attachment = {
            filename: file.name.slice(0, 180),
            mimeType: file.type,
            size: file.size,
            data: new Uint8Array(buffer),
          };
        }
      }
    } else {
      raw = (await readJson(request)) as Record<string, unknown>;
    }

    if (attachmentError) return jsonError(attachmentError, 422);

    const input = grievanceSubmitSchema.parse(raw);
    const created = await createGrievance(user, input, attachment);
    return jsonOk(
      {
        id: created.id,
        referenceNo: created.referenceNo,
        message: `Grievance submitted. Your reference number is ${created.referenceNo}.`,
      },
      201,
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
