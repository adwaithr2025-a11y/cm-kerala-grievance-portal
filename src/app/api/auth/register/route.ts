import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { handleRouteError, jsonOk, readJson, jsonError, getClientIp } from "@/lib/api";
import { registerSchema } from "@/lib/validation";
import { createSession, hashPassword } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { ROLE_META } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
    if (!limit.ok) {
      return jsonError("Too many registration attempts. Please try again later.", 429);
    }

    const input = registerSchema.parse(await readJson(request));
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      return jsonError("An account with this email already exists. Please sign in.", 409);
    }

    const passwordHash = await hashPassword(input.password);

    try {
      const user = await prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          mobile: input.mobile,
          passwordHash,
          role: "CITIZEN",
        },
        select: { id: true, name: true, email: true, role: true },
      });

      await createSession({ id: user.id, role: user.role, name: user.name, email: user.email });
      return jsonOk({ user, redirectTo: ROLE_META[user.role].home }, 201);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return jsonError("An account with this email already exists. Please sign in.", 409);
      }
      throw error;
    }
  } catch (error) {
    return handleRouteError(error);
  }
}
