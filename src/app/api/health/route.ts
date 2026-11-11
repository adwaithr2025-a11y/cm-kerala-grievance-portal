import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  let database = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = true;
  } catch {
    database = false;
  }
  return NextResponse.json(
    {
      ok: database,
      service: "cm-kerala-grievance-portal",
      database,
      aiConfigured: Boolean(process.env.AI_API_KEY),
      time: new Date().toISOString(),
    },
    { status: database ? 200 : 503 },
  );
}
