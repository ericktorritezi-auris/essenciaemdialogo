import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/auth/rbac";

/**
 * GET /api/admin/audit-log
 * Admin only — auditoria é justamente sobre quem fez o quê, então só
 * o Admin visualiza (Colaborador não deveria ver ações de outros
 * usuários, incluindo as próprias tentativas de login malsucedidas).
 *
 * Filtros opcionais via query string: entityType, action, actorUserId.
 * Paginação simples por `page` (1-indexed) + `pageSize` fixo.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Apenas administradores." }, { status: 403 });
    throw error;
  }

  const params = request.nextUrl.searchParams;
  const entityType = params.get("entityType") || undefined;
  const action = params.get("action") || undefined;
  const actorUserId = params.get("actorUserId") || undefined;
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const pageSize = 50;

  const where = {
    ...(entityType ? { entityType } : {}),
    ...(action ? { action } : {}),
    ...(actorUserId ? { actorUserId } : {}),
  };

  const [entries, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { actor: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return NextResponse.json({ entries, total, page, pageSize });
}
