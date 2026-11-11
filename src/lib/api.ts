import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "./auth";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status = 400, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function jsonError(
  message: string,
  status = 400,
  details?: unknown,
) {
  return NextResponse.json({ ok: false, error: message, details }, { status });
}

function fieldErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || "form",
    message: issue.message,
  }));
}

export function handleRouteError(error: unknown) {
  if (error instanceof ApiError) {
    return jsonError(error.message, error.status, error.details);
  }
  if (error instanceof AuthError) {
    return jsonError(error.message, error.status);
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please correct the highlighted fields.",
        details: fieldErrors(error),
      },
      { status: 422 },
    );
  }
  console.error("[api] Unhandled error:", error);
  return jsonError("Something went wrong. Please try again.", 500);
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiError("Request body must be valid JSON.", 400);
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
