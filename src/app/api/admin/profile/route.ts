import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAnyRole, ForbiddenError, UnauthorizedError } from "@/lib/auth/rbac";
import { sanitizePlainText } from "@/lib/sanitize";
import { logAudit } from "@/lib/audit";

const updateSchema = z.object({
  name: z.string().min(2).max(100),
});

/** PATCH /api/admin/profile — o próprio usuário edita o próprio nome. */
export async function PATCH(request: NextRequest) {
  let actor;
  try {
    actor = await requireAnyRole();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    throw error;
  }

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: actor.id },
    data: { name: sanitizePlainText(parsed.data.name) },
  });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "PROFILE_UPDATED",
    entityType: "User",
    entityId: actor.id,
    entityLabel: user.name,
  });

  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
