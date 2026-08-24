import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAnyRole, ForbiddenError, UnauthorizedError } from "@/lib/auth/rbac";

/** GET /api/admin/media — lista a biblioteca de mídia (mais recentes primeiro). */
export async function GET(request: NextRequest) {
  try {
    await requireAnyRole();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    throw error;
  }

  const searchParams = request.nextUrl.searchParams;
  const take = Math.min(Number(searchParams.get("take") ?? 50), 100);

  const media = await prisma.media.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take,
  });

  return NextResponse.json({ media });
}
