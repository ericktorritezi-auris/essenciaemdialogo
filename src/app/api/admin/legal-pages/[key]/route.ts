import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/auth/rbac";
import { sanitizeContentHtml, sanitizePlainText } from "@/lib/sanitize";
import { logAudit } from "@/lib/audit";

interface RouteParams {
  params: { key: string };
}

const updateSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  content: z.string().min(1).optional(),
});

/**
 * PATCH /api/admin/legal-pages/:key
 * Editar título/conteúdo automaticamente **zera a revisão** (volta a
 * mostrar o aviso de minuta na página pública) — se o texto mudou,
 * o "OK" anterior não vale mais para o texto novo.
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

  const existing = await prisma.legalPage.findUnique({ where: { key: params.key } });
  if (!existing) {
    return NextResponse.json({ error: "Página não encontrada." }, { status: 404 });
  }

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const data = parsed.data;

  const page = await prisma.legalPage.update({
    where: { key: params.key },
    data: {
      ...(data.title !== undefined ? { title: sanitizePlainText(data.title) } : {}),
      ...(data.content !== undefined ? { content: sanitizeContentHtml(data.content) } : {}),
      // Qualquer edição de conteúdo invalida a revisão anterior.
      ...(data.content !== undefined ? { reviewedAt: null, reviewedBy: null } : {}),
    },
  });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "LEGAL_PAGE_UPDATED",
    entityType: "LegalPage",
    entityId: page.id,
    entityLabel: page.title,
  });

  return NextResponse.json({ page });
}
