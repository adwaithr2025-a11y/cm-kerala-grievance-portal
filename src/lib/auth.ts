import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "./db";
import { ROLE_META } from "./constants";

export const SESSION_COOKIE = "klg_session";
const SESSION_DAYS = 7;
const ISSUER = "cm-kerala-grievance-portal";

export type SessionUser = {
  id: string;
  role: Role;
  name: string;
  email: string;
};

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 32) {
    return new TextEncoder().encode(secret);
  }
  if (process.env.NODE_ENV !== "production") {
    return new TextEncoder().encode(
      "development-only-secret-change-me-please-32chars",
    );
  }
  throw new Error(
    "AUTH_SECRET is missing or too short (minimum 32 characters). Set it in the environment before starting the app.",
  );
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser): Promise<void> {
  const token = await new SignJWT({
    role: user.role,
    name: user.name,
    email: user.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecretKey());

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: ISSUER,
      algorithms: ["HS256"],
    });
    if (!payload.sub || typeof payload.role !== "string") return null;
    return {
      id: payload.sub,
      role: payload.role as Role,
      name: typeof payload.name === "string" ? payload.name : "User",
      email: typeof payload.email === "string" ? payload.email : "",
    };
  } catch {
    return null;
  }
}

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  role: Role;
  designation: string | null;
  department: { id: string; name: string; code: string } | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSessionUser();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      designation: true,
      isActive: true,
      department: { select: { id: true, name: true, code: true } },
    },
  });
  if (!user || !user.isActive) return null;
  const { isActive: _isActive, ...rest } = user;
  return rest;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export async function requireApiUser(
  allowedRoles?: Role[],
): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError("Please sign in to continue.", 401);
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new AuthError("You do not have permission to perform this action.", 403);
  }
  return user;
}

export async function requirePageUser(
  allowedRoles?: Role[],
): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
    throw new Error("Redirecting to login");
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const { redirect } = await import("next/navigation");
    redirect(ROLE_META[user.role]?.home ?? "/");
  }
  return user;
}
