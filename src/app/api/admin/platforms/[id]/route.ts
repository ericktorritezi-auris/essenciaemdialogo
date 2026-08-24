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
  name: z.string().min(1).max(60).optional(),
  active: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Apenas administradores." }, { status: 403 });
    throw error;
  }

  const existing = await prisma.platform.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Plataforma não encontrada." }, { status: 404 });
  }

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const data = parsed.data;

  const platform = await prisma.platform.update({
    where: { id: params.id },
    data: {
      ...(data.name !== undefined ? { name: sanitizePlainText(data.name) } : {}),
      ...(data.active !== undefined ? { active: data.active } : {}),
      ...(data.order !== undefined ? { order: data.order } : {}),
    },
  });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "PLATFORM_UPDATED",
    entityType: "Platform",
    entityId: platform.id,
    entityLabel: platform.name,
    beforeState: { active: existing.active },
    afterState: { active: platform.active },
  });

  return NextResponse.json({ platform });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Apenas administradores." }, { status: 403 });
    throw error;
  }

  const existing = await prisma.platform.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Plataforma não encontrada." }, { status: 404 });
  }

  const linkCount = await prisma.episodePlatformLink.count({ where: { platformId: params.id } });
  if (linkCount > 0) {
    return NextResponse.json(
      { error: `Esta plataforma está vinculada a ${linkCount} episódio(s) e não pode ser excluída.` },
      { status: 409 },
    );
  }

  await prisma.platform.delete({ where: { id: params.id } });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "PLATFORM_DELETED",
    entityType: "Platform",
    entityId: existing.id,
    entityLabel: existing.name,
  });

  return NextResponse.json({ ok: true });
}
