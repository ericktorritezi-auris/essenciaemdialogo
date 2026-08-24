import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/auth/rbac";
import { sanitizePlainText } from "@/lib/sanitize";
import { logAudit } from "@/lib/audit";

const createSchema = z.object({
  key: z.string().min(1).max(50).regex(/^[a-z0-9_]+$/, "Use apenas letras minúsculas, números e underscore."),
  name: z.string().min(1).max(60),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Apenas administradores." }, { status: 403 });
    throw error;
  }

  const platforms = await prisma.platform.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ platforms });
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
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const existing = await prisma.platform.findUnique({ where: { key: parsed.data.key } });
  if (existing) {
    return NextResponse.json({ error: "Já existe uma plataforma com essa chave." }, { status: 409 });
  }

  const maxOrder = await prisma.platform.aggregate({ _max: { order: true } });
  const platform = await prisma.platform.create({
    data: {
      key: parsed.data.key,
      name: sanitizePlainText(parsed.data.name),
      active: true,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "PLATFORM_CREATED",
    entityType: "Platform",
    entityId: platform.id,
    entityLabel: platform.name,
  });

  return NextResponse.json({ platform }, { status: 201 });
}
