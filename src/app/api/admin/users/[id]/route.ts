import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/auth/rbac";
import { sanitizePlainText } from "@/lib/sanitize";
import { logAudit } from "@/lib/audit";

interface RouteParams {
  params: { id: string };
}

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(["ADMIN", "COLLABORATOR"]).optional(),
  active: z.boolean().optional(),
});

/**
 * PATCH /api/admin/users/:id
 * Admin edita nome/papel/status de qualquer usuário — exceto a si
 * mesmo neste endpoint (mudar o próprio papel/status por aqui seria
 * uma forma de se auto-rebaixar ou se desativar sem querer; troca de
 * nome própria já existe em /admin/profile).
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Apenas administradores." }, { status: 403 });
    throw error;
  }

  if (params.id === actor.id) {
    return NextResponse.json(
      { error: "Use /admin/profile para editar sua própria conta." },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { id: params.id } });
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const data = parsed.data;

  if (data.email && data.email.toLowerCase() !== existing.email) {
    const emailTaken = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (emailTaken) {
      return NextResponse.json({ error: "Já existe um usuário com esse e-mail." }, { status: 409 });
    }
  }

  const wouldRemoveLastAdmin =
    existing.role === "ADMIN" &&
    ((data.role && data.role !== "ADMIN") || data.active === false);

  if (wouldRemoveLastAdmin) {
    const otherActiveAdmins = await prisma.user.count({
      where: { role: "ADMIN", active: true, deletedAt: null, id: { not: existing.id } },
    });
    if (otherActiveAdmins === 0) {
      return NextResponse.json(
        { error: "Não é possível remover o último administrador ativo do sistema." },
        { status: 409 },
      );
    }
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      ...(data.name !== undefined ? { name: sanitizePlainText(data.name) } : {}),
      ...(data.email !== undefined ? { email: data.email.toLowerCase() } : {}),
      ...(data.role !== undefined ? { role: data.role } : {}),
      ...(data.active !== undefined ? { active: data.active } : {}),
    },
  });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "USER_UPDATED",
    entityType: "User",
    entityId: user.id,
    entityLabel: user.email,
    beforeState: { role: existing.role, active: existing.active, email: existing.email },
    afterState: { role: user.role, active: user.active, email: user.email },
  });

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, active: user.active },
  });
}

/**
 * DELETE /api/admin/users/:id
 * Exclusão de verdade (não é soft delete) — pensada para limpar contas
 * de teste, como a de Colaborador criada automaticamente na Sprint 10.
 *
 * Só permite excluir se o usuário **não for autor de nenhum conteúdo**
 * (Artigo, Notícia, Evento, Episódio) — excluir de verdade um autor
 * com conteúdo publicado quebraria a referência (`authorId`/`createdBy`
 * apontando para um usuário que não existe mais). Nesse caso, a
 * recomendação é desativar em vez de excluir.
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Apenas administradores." }, { status: 403 });
    throw error;
  }

  if (params.id === actor.id) {
    return NextResponse.json({ error: "Você não pode excluir a própria conta." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id: params.id } });
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  if (existing.role === "ADMIN") {
    const otherActiveAdmins = await prisma.user.count({
      where: { role: "ADMIN", active: true, deletedAt: null, id: { not: existing.id } },
    });
    if (otherActiveAdmins === 0) {
      return NextResponse.json(
        { error: "Não é possível excluir o último administrador ativo do sistema." },
        { status: 409 },
      );
    }
  }

  const [articleCount, newsCount, eventCount, episodeCount] = await Promise.all([
    prisma.article.count({ where: { authorId: existing.id, deletedAt: null } }),
    prisma.news.count({ where: { authorId: existing.id, deletedAt: null } }),
    prisma.event.count({ where: { authorId: existing.id, deletedAt: null } }),
    prisma.episode.count({ where: { createdBy: existing.id, deletedAt: null } }),
  ]);
  const totalAuthored = articleCount + newsCount + eventCount + episodeCount;

  if (totalAuthored > 0) {
    return NextResponse.json(
      {
        error: `Este usuário é autor de ${totalAuthored} conteúdo(s) ativo(s) e não pode ser excluído — desative a conta em vez disso.`,
        usage: { articles: articleCount, news: newsCount, events: eventCount, episodes: episodeCount },
      },
      { status: 409 },
    );
  }

  // O usuário pode ter conteúdo já excluído (soft delete — continua na
  // lixeira, invisível nas telas, mas fisicamente no banco apontando
  // para ele). Como `authorId`/`createdBy` é uma referência obrigatória,
  // o banco recusaria apagar o usuário enquanto esses registros
  // existirem. Como já estão na lixeira (o usuário já pediu para
  // "excluir" esse conteúdo antes), apagar de vez agora é a extensão
  // natural dessa decisão, não uma perda de dado nova.
  const [purgedArticles, purgedNews, purgedEvents, purgedEpisodes] = await prisma.$transaction([
    prisma.article.deleteMany({ where: { authorId: existing.id, deletedAt: { not: null } } }),
    prisma.news.deleteMany({ where: { authorId: existing.id, deletedAt: { not: null } } }),
    prisma.event.deleteMany({ where: { authorId: existing.id, deletedAt: { not: null } } }),
    prisma.episode.deleteMany({ where: { createdBy: existing.id, deletedAt: { not: null } } }),
  ]);

  await prisma.user.delete({ where: { id: existing.id } });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "USER_DELETED",
    entityType: "User",
    entityId: existing.id,
    entityLabel: existing.email,
    metadata: {
      purgedTrashedContent: {
        articles: purgedArticles.count,
        news: purgedNews.count,
        events: purgedEvents.count,
        episodes: purgedEpisodes.count,
      },
    },
  });

  return NextResponse.json({ ok: true });
}
