import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAnyRole, ForbiddenError, UnauthorizedError } from "@/lib/auth/rbac";
import { sanitizeContentHtml, sanitizePlainText } from "@/lib/sanitize";
import {
  assertValidTransition,
  shouldSetPublishedAt,
  InvalidTransitionError,
  TransitionForbiddenError,
  type ContentStatus,
} from "@/lib/content/status";
import { logAudit } from "@/lib/audit";

interface RouteParams {
  params: { id: string };
}

const platformLinkSchema = z.object({
  platformId: z.string().uuid(),
  url: z.string().url(),
});

const updateEpisodeSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  season: z.number().int().positive().nullable().optional(),
  number: z.number().int().positive().nullable().optional(),
  shortDescription: z.string().max(500).nullable().optional(),
  fullDescription: z.string().nullable().optional(),
  duration: z.number().int().positive().nullable().optional(),
  coverMediaId: z.string().uuid().nullable().optional(),
  featured: z.boolean().optional(),
  seoTitle: z.string().max(70).nullable().optional(),
  seoDescription: z.string().max(160).nullable().optional(),
  platformLinks: z.array(platformLinkSchema).optional(),
  status: z
    .enum(["DRAFT", "IN_REVIEW", "SCHEDULED", "PUBLISHED", "PAUSED", "ARCHIVED"])
    .optional(),
});

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAnyRole();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    throw error;
  }

  const episode = await prisma.episode.findUnique({
    where: { id: params.id },
    include: { platformLinks: { include: { platform: true } } },
  });
  if (!episode || episode.deletedAt) {
    return NextResponse.json({ error: "Episódio não encontrado." }, { status: 404 });
  }
  return NextResponse.json({ episode });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  let actor;
  try {
    actor = await requireAnyRole();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    throw error;
  }

  const existing = await prisma.episode.findUnique({ where: { id: params.id } });
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ error: "Episódio não encontrado." }, { status: 404 });
  }
  if (actor.role === "COLLABORATOR" && existing.createdBy !== actor.id) {
    return NextResponse.json({ error: "Você só pode editar seus próprios episódios." }, { status: 403 });
  }

  const parsed = updateEpisodeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }
  const data = parsed.data;

  if (data.status) {
    try {
      assertValidTransition(existing.status as ContentStatus, data.status, actor.role);
    } catch (error) {
      if (error instanceof InvalidTransitionError) return NextResponse.json({ error: error.message }, { status: 400 });
      if (error instanceof TransitionForbiddenError) return NextResponse.json({ error: error.message }, { status: 403 });
      throw error;
    }
  }

  const publishedAt = data.status && shouldSetPublishedAt(existing.publishedAt, data.status)
    ? new Date()
    : undefined;

  const episode = await prisma.episode.update({
    where: { id: params.id },
    data: {
      ...(data.title !== undefined ? { title: sanitizePlainText(data.title) } : {}),
      ...(data.season !== undefined ? { season: data.season } : {}),
      ...(data.number !== undefined ? { number: data.number } : {}),
      ...(data.shortDescription !== undefined
        ? { shortDescription: data.shortDescription ? sanitizePlainText(data.shortDescription) : null }
        : {}),
      ...(data.fullDescription !== undefined
        ? { fullDescription: data.fullDescription ? sanitizeContentHtml(data.fullDescription) : null }
        : {}),
      ...(data.duration !== undefined ? { duration: data.duration } : {}),
      ...(data.coverMediaId !== undefined ? { coverMediaId: data.coverMediaId } : {}),
      ...(data.featured !== undefined ? { featured: data.featured } : {}),
      ...(data.seoTitle !== undefined ? { seoTitle: data.seoTitle ? sanitizePlainText(data.seoTitle) : null } : {}),
      ...(data.seoDescription !== undefined
        ? { seoDescription: data.seoDescription ? sanitizePlainText(data.seoDescription) : null }
        : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(publishedAt ? { publishedAt } : {}),
      updatedBy: actor.id,
    },
  });

  // Sincroniza os links de plataforma, se enviados — substitui o
  // conjunto inteiro por simplicidade (episódio raramente tem mais de
  // 3-4 links, não compensa um diff granular).
  if (data.platformLinks !== undefined) {
    await prisma.episodePlatformLink.deleteMany({ where: { episodeId: episode.id } });
    if (data.platformLinks.length > 0) {
      await prisma.episodePlatformLink.createMany({
        data: data.platformLinks.map((link) => ({
          episodeId: episode.id,
          platformId: link.platformId,
          url: link.url,
        })),
      });
    }
  }

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: data.status && data.status !== existing.status ? "EPISODE_STATUS_CHANGED" : "EPISODE_UPDATED",
    entityType: "Episode",
    entityId: episode.id,
    entityLabel: episode.title,
    beforeState: { status: existing.status },
    afterState: { status: episode.status },
  });

  return NextResponse.json({ episode });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  let actor;
  try {
    actor = await requireAnyRole();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    throw error;
  }

  const existing = await prisma.episode.findUnique({ where: { id: params.id } });
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ error: "Episódio não encontrado." }, { status: 404 });
  }

  const isOwnDraft = existing.createdBy === actor.id && existing.status === "DRAFT";
  if (actor.role !== "ADMIN" && !isOwnDraft) {
    return NextResponse.json({ error: "Colaboradores só podem excluir os próprios rascunhos." }, { status: 403 });
  }

  await prisma.episode.update({ where: { id: params.id }, data: { deletedAt: new Date() } });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "EPISODE_DELETED",
    entityType: "Episode",
    entityId: existing.id,
    entityLabel: existing.title,
  });

  return NextResponse.json({ ok: true });
}
