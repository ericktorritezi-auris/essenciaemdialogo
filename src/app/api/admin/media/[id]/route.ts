import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/auth/rbac";
import { deleteObject } from "@/lib/storage/r2";
import { logAudit } from "@/lib/audit";

interface RouteParams {
  params: { id: string };
}

/**
 * DELETE /api/admin/media/:id
 * Exclusão restrita a Admin. Verifica uso antes de apagar (Seção 10 do
 * Plano Técnico) — nunca remove um arquivo que ainda está referenciado
 * por algum conteúdo publicado ou não.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Apenas administradores." }, { status: 403 });
    throw error;
  }

  const media = await prisma.media.findUnique({ where: { id: params.id } });
  if (!media || media.deletedAt) {
    return NextResponse.json({ error: "Mídia não encontrada." }, { status: 404 });
  }

  const [articleUses, newsUses, eventUses] = await Promise.all([
    prisma.article.count({ where: { coverMediaId: media.id, deletedAt: null } }),
    prisma.news.count({ where: { coverMediaId: media.id, deletedAt: null } }),
    prisma.event.count({ where: { coverMediaId: media.id, deletedAt: null } }),
  ]);

  const totalUses = articleUses + newsUses + eventUses;
  if (totalUses > 0) {
    return NextResponse.json(
      {
        error: `Esta mídia está em uso em ${totalUses} conteúdo(s) e não pode ser excluída.`,
        usage: { articles: articleUses, news: newsUses, events: eventUses },
      },
      { status: 409 },
    );
  }

  // Soft delete no banco primeiro; o objeto no R2 só é removido depois
  // do registro confirmado como apagado (evita órfão no banco se a
  // chamada ao storage falhar no meio do caminho).
  await prisma.media.update({
    where: { id: media.id },
    data: { deletedAt: new Date() },
  });

  await deleteObject(media.storageKey).catch((error) => {
    console.error("[media] falha ao remover objeto do R2, registro já marcado como excluído", error);
  });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "MEDIA_DELETED",
    entityType: "Media",
    entityId: media.id,
    entityLabel: media.url,
  });

  return NextResponse.json({ ok: true });
}
