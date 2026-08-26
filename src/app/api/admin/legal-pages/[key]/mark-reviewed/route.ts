import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/auth/rbac";
import { logAudit } from "@/lib/audit";

interface RouteParams {
  params: { key: string };
}

/**
 * POST /api/admin/legal-pages/:key/mark-reviewed
 * O "OK" formal — enquanto `reviewedAt` for null, a página pública
 * mostra o aviso de minuta técnica. Marcar aqui remove esse aviso.
 */
export async function POST(_request: NextRequest, { params }: RouteParams) {
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

  const page = await prisma.legalPage.update({
    where: { key: params.key },
    data: { reviewedAt: new Date(), reviewedBy: actor.name },
  });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "LEGAL_PAGE_REVIEWED",
    entityType: "LegalPage",
    entityId: page.id,
    entityLabel: page.title,
  });

  return NextResponse.json({ page });
}
