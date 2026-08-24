import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/auth/rbac";
import { sanitizePlainText } from "@/lib/sanitize";
import { logAudit } from "@/lib/audit";

const createSchema = z.object({
  label: z.string().min(1).max(50),
  href: z.string().min(1).max(300),
  openInNewTab: z.boolean().optional(),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Apenas administradores." }, { status: 403 });
    throw error;
  }

  const items = await prisma.navigationItem.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Apenas administradores." }, { status: 403 });
    throw error;
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const maxOrder = await prisma.navigationItem.aggregate({ _max: { order: true } });
  const item = await prisma.navigationItem.create({
    data: {
      label: sanitizePlainText(parsed.data.label),
      href: parsed.data.href,
      openInNewTab: parsed.data.openInNewTab ?? false,
      order: (maxOrder._max.order ?? -1) + 1,
      enabled: true,
    },
  });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "NAVIGATION_ITEM_CREATED",
    entityType: "NavigationItem",
    entityId: item.id,
    entityLabel: item.label,
  });

  return NextResponse.json({ item }, { status: 201 });
}
