import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export interface AuditLogInput {
  actorUserId?: string | null;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  entityLabel?: string | null;
  beforeState?: Prisma.InputJsonValue | null;
  afterState?: Prisma.InputJsonValue | null;
  metadata?: Prisma.InputJsonValue | null;
  ip?: string | null;
  userAgent?: string | null;
  correlationId?: string | null;
}

/**
 * Camada única de auditoria (Seção 9 do Plano Técnico). Toda ação
 * administrativa relevante passa por aqui — nunca gravar diretamente
 * em AuditLog fora deste módulo, para não haver caminho de escrita
 * divergente do padrão (before/after state, sem segredos).
 *
 * Nunca loga senha, token, ou segredo — quem chama é responsável por
 * já ter removido esses campos de before/afterState antes de passar
 * para cá; este serviço não tenta adivinhar o que é sensível.
 */
export async function logAudit(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: input.actorUserId ?? null,
        actorRole: input.actorRole ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        entityLabel: input.entityLabel ?? null,
        beforeState: input.beforeState ?? undefined,
        afterState: input.afterState ?? undefined,
        metadata: input.metadata ?? undefined,
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
        correlationId: input.correlationId ?? null,
      },
    });
  } catch (error) {
    // Auditoria não pode derrubar a operação principal, mas a falha
    // precisa ficar visível nos logs de aplicação (Seção 69 — nunca
    // misturar os dois, mas um precisa alertar sobre o outro).
    console.error("[audit] falha ao gravar log de auditoria", error);
  }
}
