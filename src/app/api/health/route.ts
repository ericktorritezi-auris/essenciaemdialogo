import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/health
 * Readiness check — Railway só promove o deploy se este endpoint
 * responder 200. Não expõe detalhes internos (Seção 64).
 *
 * `force-dynamic`: consulta o banco (`$queryRaw`) — sem isso, o Next
 * pode tentar avaliar esta rota estaticamente em build time (rotas
 * GET "puras", sem usar cookies/headers/searchParams, são elegíveis
 * para otimização estática por padrão), o que falharia porque o banco
 * não está acessível durante o build. Essa lacuna existia desde a
 * Sprint 0 — só não tinha aparecido até agora porque eu vinha
 * presumindo (errado) que toda rota /api/ já era dinâmica por padrão.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch {
    return NextResponse.json({ status: "unavailable" }, { status: 503 });
  }
}
