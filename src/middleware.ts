import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session-constants";

/**
 * Este middleware é só um atalho de UX: se não existe cookie de sessão
 * nenhum, redireciona direto para o login sem gastar uma consulta ao
 * banco. Ele NÃO é a fronteira de segurança do RBAC.
 *
 * A fronteira de segurança real é sempre server-side, em cada layout/
 * route handler administrativo, via requireRole()/getCurrentUser()
 * (src/lib/auth/rbac.ts), que decripta a sessão E revalida papel/status
 * do usuário no banco a cada request (Seção 95 do Prompt Mestre —
 * "RBAC nunca só na UI/edge", aqui levado a sério até no próprio
 * desenho do middleware).
 */
export function middleware(request: NextRequest) {
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);

  if (!hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
