import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/auth/rbac";

/** GET /api/admin/legal-pages — admin only (é conteúdo estrutural do site). */
export async function GET() {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Apenas administradores." }, { status: 403 });
    throw error;
  }

  const pages = await prisma.legalPage.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json({ pages });
}
