import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/auth/rbac";

/**
 * GET /api/admin/contact-submissions/unread-count
 * Contador de perguntas ainda não vistas — compara `createdAt` das
 * submissões com o último acesso do admin a /admin/contact-submissions
 * (`User.contactSubmissionsViewedAt`). Nunca visitou = tudo é "não visto".
 */
export async function GET() {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Apenas administradores." }, { status: 403 });
    throw error;
  }

  const count = await prisma.contactSubmission.count({
    where: actor.contactSubmissionsViewedAt
      ? { createdAt: { gt: actor.contactSubmissionsViewedAt } }
      : {},
  });

  return NextResponse.json({ count });
}
