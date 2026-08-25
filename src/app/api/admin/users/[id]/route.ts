import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/auth/rbac";
import { sanitizePlainText } from "@/lib/sanitize";
import { logAudit } from "@/lib/audit";

interface RouteParams {
  params: { id: string };
}

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(["ADMIN", "COLLABORATOR"]).optional(),
  active: z.boolean().optional(),
});

/**
 * PATCH /api/admin/users/:id
 * Admin edita nome/papel/status de qualquer usuário — exceto a si
 * mesmo neste endpoint (mudar o próprio papel/status por aqui seria
 * uma forma de se auto-rebaixar ou se desativar sem querer; troca de
 * nome própria já existe em /admin/profile).
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Apenas administradores." }, { status: 403 });
    throw error;
  }

  if (params.id === actor.id) {
    return NextResponse.json(
      { error: "Use /admin/profile para editar sua própria conta." },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { id: params.id } });
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const data = parsed.data;

  const wouldRemoveLastAdmin =
    existing.role === "ADMIN" &&
    ((data.role && data.role !== "ADMIN") || data.active === false);

  if (wouldRemoveLastAdmin) {
    const otherActiveAdmins = await prisma.user.count({
      where: { role: "ADMIN", active: true, deletedAt: null, id: { not: existing.id } },
    });
    if (otherActiveAdmins === 0) {
      return NextResponse.json(
        { error: "Não é possível remover o último administrador ativo do sistema." },
        { status: 409 },
      );
    }
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      ...(data.name !== undefined ? { name: sanitizePlainText(data.name) } : {}),
      ...(data.role !== undefined ? { role: data.role } : {}),
      ...(data.active !== undefined ? { active: data.active } : {}),
    },
  });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "USER_UPDATED",
    entityType: "User",
    entityId: user.id,
    entityLabel: user.email,
    beforeState: { role: existing.role, active: existing.active },
    afterState: { role: user.role, active: user.active },
  });

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, active: user.active },
  });
}
