import { prisma } from "@/lib/db";
import { getClientIp, handleRouteError, jsonError, jsonOk, readJson } from "@/lib/api";
import { loginSchema } from "@/lib/validation";
import { createSession, verifyPassword } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { ROLE_META } from "@/lib/constants";

const DUMMY_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const body = (await readJson(request)) as { email?: string; password?: string };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const limit = rateLimit(`login:${ip}:${email}`, 10, 15 * 60 * 1000);
    if (!limit.ok) {
      return jsonError("Too many sign-in attempts. Please wait 15 minutes and try again.", 429);
    }

    const input = loginSchema.parse(body);
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    if (!user || !user.isActive) {
      await verifyPassword(input.password, DUMMY_HASH);
      return jsonError("Invalid email or password.", 401);
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      return jsonError("Invalid email or password.", 401);
    }

    await createSession({ id: user.id, role: user.role, name: user.name, email: user.email });

    return jsonOk({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      redirectTo: ROLE_META[user.role].home,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
