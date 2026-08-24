import type { UserRole } from "@prisma/client";

/**
 * Camada única de regras do fluxo editorial (Seção 33 do Plano Técnico —
 * opção B: Colaborador cria/edita e envia para revisão; só Admin publica).
 *
 * Nunca duplicar esta lógica em cada endpoint — toda rota de conteúdo
 * (Article/News/Event) importa e usa isto, para o comportamento ser
 * idêntico nos três tipos e para uma mudança de regra futura acontecer
 * num lugar só.
 */

export type ContentStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "SCHEDULED"
  | "PUBLISHED"
  | "PAUSED"
  | "ARCHIVED";

interface TransitionRule {
  to: ContentStatus;
  allowedRoles: UserRole[];
}

const TRANSITIONS: Record<ContentStatus, TransitionRule[]> = {
  DRAFT: [
    { to: "IN_REVIEW", allowedRoles: ["ADMIN", "COLLABORATOR"] },
    { to: "PUBLISHED", allowedRoles: ["ADMIN"] },
    { to: "SCHEDULED", allowedRoles: ["ADMIN"] },
    { to: "ARCHIVED", allowedRoles: ["ADMIN", "COLLABORATOR"] },
  ],
  IN_REVIEW: [
    { to: "DRAFT", allowedRoles: ["ADMIN", "COLLABORATOR"] }, // devolvido para ajuste
    { to: "SCHEDULED", allowedRoles: ["ADMIN"] },
    { to: "PUBLISHED", allowedRoles: ["ADMIN"] },
    { to: "ARCHIVED", allowedRoles: ["ADMIN"] },
  ],
  SCHEDULED: [
    { to: "PUBLISHED", allowedRoles: ["ADMIN"] },
    { to: "DRAFT", allowedRoles: ["ADMIN"] },
    { to: "ARCHIVED", allowedRoles: ["ADMIN"] },
  ],
  PUBLISHED: [
    { to: "PAUSED", allowedRoles: ["ADMIN"] },
    { to: "ARCHIVED", allowedRoles: ["ADMIN"] },
  ],
  PAUSED: [
    { to: "PUBLISHED", allowedRoles: ["ADMIN"] },
    { to: "ARCHIVED", allowedRoles: ["ADMIN"] },
  ],
  ARCHIVED: [
    { to: "DRAFT", allowedRoles: ["ADMIN"] }, // reabrir um arquivado
  ],
};

export class InvalidTransitionError extends Error {
  constructor(from: ContentStatus, to: ContentStatus) {
    super(`Transição de "${from}" para "${to}" não é permitida.`);
    this.name = "InvalidTransitionError";
  }
}

export class TransitionForbiddenError extends Error {
  constructor(from: ContentStatus, to: ContentStatus, role: UserRole) {
    super(`Papel "${role}" não pode transicionar de "${from}" para "${to}".`);
    this.name = "TransitionForbiddenError";
  }
}

/**
 * Valida uma transição de status. Lança erro tipado se a transição não
 * existir na máquina de estados OU se o papel do usuário não tiver
 * permissão para ela — nunca aplicar um `status` vindo do client sem
 * passar por aqui primeiro.
 */
export function assertValidTransition(
  from: ContentStatus,
  to: ContentStatus,
  role: UserRole,
): void {
  if (from === to) return; // no-op é sempre permitido (ex.: salvar sem mudar status)

  const rule = TRANSITIONS[from]?.find((t) => t.to === to);
  if (!rule) {
    throw new InvalidTransitionError(from, to);
  }
  if (!rule.allowedRoles.includes(role)) {
    throw new TransitionForbiddenError(from, to, role);
  }
}

/** `publishedAt` só é definido a primeira vez que o conteúdo é publicado. */
export function shouldSetPublishedAt(
  currentPublishedAt: Date | null,
  newStatus: ContentStatus,
): boolean {
  return newStatus === "PUBLISHED" && currentPublishedAt === null;
}
