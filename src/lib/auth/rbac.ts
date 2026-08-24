import type { User, UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/current-user";

export class UnauthorizedError extends Error {
  constructor() {
    super("Não autenticado.");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super("Sem permissão para este recurso.");
    this.name = "ForbiddenError";
  }
}

/**
 * Exige um usuário autenticado com um dos papéis permitidos.
 * Uso obrigatório em TODO endpoint/rota administrativa — nunca confiar
 * apenas em esconder um item de menu no frontend (Seção 95 do Prompt
 * Mestre / Seção 8 do Plano Técnico).
 *
 * Lança erro tipado em vez de retornar null — quem chama decide como
 * traduzir isso em resposta HTTP (401/403) ou redirect.
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError();
  }

  return user;
}

export async function requireAdmin(): Promise<User> {
  return requireRole(["ADMIN"]);
}

export async function requireAnyRole(): Promise<User> {
  return requireRole(["ADMIN", "COLLABORATOR"]);
}
