import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/auth/rbac";
import { sanitizePlainText } from "@/lib/sanitize";
import { logAudit } from "@/lib/audit";

const updateSchema = z.object({
  enabled: z.boolean().optional(),
  mode: z.enum(["spotify", "external", "own_audio", "editorial_playlist"]).optional(),
  title: z.string().max(100).nullable().optional(),
  description: z.string().max(300).nullable().optional(),
  content: z.record(z.unknown()).optional(),
});

async function getOrCreateSingleton() {
  const existing = await prisma.radioConfiguration.findFirst();
  if (existing) return existing;
  return prisma.radioConfiguration.create({ data: { enabled: false, mode: "spotify" } });
}

/** GET /api/admin/radio */
export async function GET() {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Apenas administradores." }, { status: 403 });
    throw error;
  }

  const config = await getOrCreateSingleton();
  return NextResponse.json({ config });
}

/** PATCH /api/admin/radio */
export async function PATCH(request: NextRequest) {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Apenas administradores." }, { status: 403 });
    throw error;
  }

  const existing = await getOrCreateSingleton();

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const data = parsed.data;

  const config = await prisma.radioConfiguration.update({
    where: { id: existing.id },
    data: {
      ...(data.enabled !== undefined ? { enabled: data.enabled } : {}),
      ...(data.mode !== undefined ? { mode: data.mode } : {}),
      ...(data.title !== undefined ? { title: data.title ? sanitizePlainText(data.title) : null } : {}),
      ...(data.description !== undefined
        ? { description: data.description ? sanitizePlainText(data.description) : null }
        : {}),
      ...(data.content !== undefined ? { content: data.content as Prisma.InputJsonValue } : {}),
    },
  });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "RADIO_CONFIG_UPDATED",
    entityType: "RadioConfiguration",
    entityId: config.id,
    beforeState: { enabled: existing.enabled, mode: existing.mode },
    afterState: { enabled: config.enabled, mode: config.mode },
  });

  return NextResponse.json({ config });
}
