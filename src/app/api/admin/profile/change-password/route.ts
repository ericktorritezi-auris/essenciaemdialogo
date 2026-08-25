import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAnyRole, ForbiddenError, UnauthorizedError } from "@/lib/auth/rbac";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { logAudit } from "@/lib/audit";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(12, "A nova senha precisa ter pelo menos 12 caracteres."),
});

/**
 * POST /api/admin/profile/change-password
 * Qualquer usuário autenticado troca a própria senha — sempre exige a
 * senha atual (nunca confia só em estar logado; alguém que pegasse uma
 * sessão aberta não deveria conseguir trocar a senha sem saber a atual).
 */
export async function POST(request: NextRequest) {
  let actor;
  try {
    actor = await requireAnyRole();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    throw error;
  }

  const parsed = changePasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }
  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: actor.id } });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  const currentValid = await verifyPassword(user.passwordHash, currentPassword);
  if (!currentValid) {
    await logAudit({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "PASSWORD_CHANGE_FAILED",
      entityType: "User",
      entityId: actor.id,
      metadata: { reason: "current_password_invalid" },
    });
    return NextResponse.json({ error: "Senha atual incorreta." }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: actor.id },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "PASSWORD_CHANGED",
    entityType: "User",
    entityId: actor.id,
    entityLabel: user.email,
  });

  return NextResponse.json({ ok: true });
}
