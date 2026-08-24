import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const session = await getSession();
  const userId = session.userId;

  session.destroy();

  if (userId) {
    await logAudit({
      actorUserId: userId,
      action: "LOGOUT",
      entityType: "User",
      entityId: userId,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });
  }

  return NextResponse.json({ ok: true });
}
