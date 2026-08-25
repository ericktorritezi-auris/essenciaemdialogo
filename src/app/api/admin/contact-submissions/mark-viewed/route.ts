import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/auth/rbac";

/**
 * POST /api/admin/contact-submissions/mark-viewed
 * Zera o contador de não lidas para o admin logado — "tudo visto de
 * uma vez", não marca mensagem por mensagem individualmente (decisão
 * combinada com o Erick na Sprint 6).
 */
export async function POST() {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Apenas administradores." }, { status: 403 });
    throw error;
  }

  await prisma.user.update({
    where: { id: actor.id },
    data: { contactSubmissionsViewedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
