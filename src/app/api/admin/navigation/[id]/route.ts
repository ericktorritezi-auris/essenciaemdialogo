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
  label: z.string().min(1).max(50).optional(),
  href: z.string().min(1).max(300).optional(),
  enabled: z.boolean().optional(),
  openInNewTab: z.boolean().optional(),
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

  const existing = await prisma.navigationItem.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
  }

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const data = parsed.data;

  const item = await prisma.navigationItem.update({
    where: { id: params.id },
    data: {
      ...(data.label !== undefined ? { label: sanitizePlainText(data.label) } : {}),
      ...(data.href !== undefined ? { href: data.href } : {}),
      ...(data.enabled !== undefined ? { enabled: data.enabled } : {}),
      ...(data.openInNewTab !== undefined ? { openInNewTab: data.openInNewTab } : {}),
      ...(data.order !== undefined ? { order: data.order } : {}),
    },
  });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "NAVIGATION_ITEM_UPDATED",
    entityType: "NavigationItem",
    entityId: item.id,
    entityLabel: item.label,
    beforeState: { enabled: existing.enabled, order: existing.order, href: existing.href },
    afterState: { enabled: item.enabled, order: item.order, href: item.href },
  });

  return NextResponse.json({ item });
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

  const existing = await prisma.navigationItem.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
  }

  await prisma.navigationItem.delete({ where: { id: params.id } });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "NAVIGATION_ITEM_DELETED",
    entityType: "NavigationItem",
    entityId: existing.id,
    entityLabel: existing.label,
  });

  return NextResponse.json({ ok: true });
}
