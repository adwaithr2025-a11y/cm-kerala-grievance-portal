import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { getClientIp, handleRouteError, jsonError, jsonOk, readJson } from "@/lib/api";
import { contactSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000);
    if (!limit.ok) {
      return jsonError("Too many messages sent. Please try again later.", 429);
    }
    const input = contactSchema.parse(await readJson(request));
    const enquiry = await prisma.contactEnquiry.create({
      data: {
        name: input.name,
        email: input.email,
        subject: input.subject,
        message: input.message,
      },
      select: { id: true, createdAt: true },
    });
    return jsonOk(
      {
        id: enquiry.id,
        message: "Your message has been received. The CMO office will respond by email.",
      },
      201,
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function GET() {
  try {
    await requireApiUser(["CMO_ADMIN"]);
    const enquiries = await prisma.contactEnquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return jsonOk({ enquiries });
  } catch (error) {
    return handleRouteError(error);
  }
}
