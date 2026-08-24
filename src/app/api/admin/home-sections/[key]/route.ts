import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/auth/rbac";
import { logAudit } from "@/lib/audit";

interface RouteParams {
  params: { key: string };
}

const updateSchema = z.object({
  enabled: z.boolean().optional(),
  order: z.number().int().optional(),
  content: z.record(z.unknown()).optional(),
});

/** PATCH /api/admin/home-sections/:key */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Apenas administradores." }, { status: 403 });
    throw error;
  }

  const existing = await prisma.homeSection.findUnique({ where: { key: params.key } });
  if (!existing) {
    return NextResponse.json({ error: "Seção não encontrada." }, { status: 404 });
  }

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const data = parsed.data;

  const section = await prisma.homeSection.update({
    where: { key: params.key },
    data: {
      ...(data.enabled !== undefined ? { enabled: data.enabled } : {}),
      ...(data.order !== undefined ? { order: data.order } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
    },
  });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "HOME_SECTION_UPDATED",
    entityType: "HomeSection",
    entityId: section.id,
    entityLabel: section.key,
    beforeState: { enabled: existing.enabled, order: existing.order },
    afterState: { enabled: section.enabled, order: section.order },
  });

  return NextResponse.json({ section });
}
