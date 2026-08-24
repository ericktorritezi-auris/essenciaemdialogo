import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import type { User } from "@prisma/client";

/**
 * Fonte única de verdade de "quem está logado e com qual papel".
 *
 * Deliberadamente NÃO confia no papel gravado no cookie — sempre
 * revalida no banco a cada chamada. Isso garante que desativar um
 * usuário (Seção 8/33) tem efeito imediato, mesmo com sessão válida,
 * e é a peça central de "RBAC nunca só na UI" (Seção 95).
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user || !user.active || user.deletedAt) return null;

  return user;
}
