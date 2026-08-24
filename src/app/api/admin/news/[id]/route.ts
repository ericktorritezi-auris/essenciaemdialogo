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

const updateNewsSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  summary: z.string().max(500).nullable().optional(),
  content: z.string().min(1).optional(),
  coverMediaId: z.string().uuid().nullable().optional(),
  sourceName: z.string().max(150).nullable().optional(),
  sourceUrl: z.string().url().nullable().optional(),
  sourceDate: z.string().datetime().nullable().optional(),
  seoTitle: z.string().max(70).nullable().optional(),
  seoDescription: z.string().max(160).nullable().optional(),
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

  const news = await prisma.news.findUnique({
    where: { id: params.id },
    include: { author: { select: { id: true, name: true } } },
  });
  if (!news || news.deletedAt) {
    return NextResponse.json({ error: "Notícia não encontrada." }, { status: 404 });
  }
  return NextResponse.json({ news });
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

  const existing = await prisma.news.findUnique({ where: { id: params.id } });
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ error: "Notícia não encontrada." }, { status: 404 });
  }
  if (actor.role === "COLLABORATOR" && existing.authorId !== actor.id) {
    return NextResponse.json({ error: "Você só pode editar suas próprias notícias." }, { status: 403 });
  }

  const parsed = updateNewsSchema.safeParse(await request.json().catch(() => null));
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

  const news = await prisma.news.update({
    where: { id: params.id },
    data: {
      ...(data.title !== undefined ? { title: sanitizePlainText(data.title) } : {}),
      ...(data.summary !== undefined ? { summary: data.summary ? sanitizePlainText(data.summary) : null } : {}),
      ...(data.content !== undefined ? { content: sanitizeContentHtml(data.content) } : {}),
      ...(data.coverMediaId !== undefined ? { coverMediaId: data.coverMediaId } : {}),
      ...(data.sourceName !== undefined ? { sourceName: data.sourceName ? sanitizePlainText(data.sourceName) : null } : {}),
      ...(data.sourceUrl !== undefined ? { sourceUrl: data.sourceUrl } : {}),
      ...(data.sourceDate !== undefined ? { sourceDate: data.sourceDate ? new Date(data.sourceDate) : null } : {}),
      ...(data.seoTitle !== undefined ? { seoTitle: data.seoTitle ? sanitizePlainText(data.seoTitle) : null } : {}),
      ...(data.seoDescription !== undefined
        ? { seoDescription: data.seoDescription ? sanitizePlainText(data.seoDescription) : null }
        : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(publishedAt ? { publishedAt } : {}),
    },
  });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: data.status && data.status !== existing.status ? "NEWS_STATUS_CHANGED" : "NEWS_UPDATED",
    entityType: "News",
    entityId: news.id,
    entityLabel: news.title,
    beforeState: { status: existing.status },
    afterState: { status: news.status },
  });

  return NextResponse.json({ news });
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

  const existing = await prisma.news.findUnique({ where: { id: params.id } });
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ error: "Notícia não encontrada." }, { status: 404 });
  }

  const isOwnDraft = existing.authorId === actor.id && existing.status === "DRAFT";
  if (actor.role !== "ADMIN" && !isOwnDraft) {
    return NextResponse.json({ error: "Colaboradores só podem excluir os próprios rascunhos." }, { status: 403 });
  }

  await prisma.news.update({ where: { id: params.id }, data: { deletedAt: new Date() } });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "NEWS_DELETED",
    entityType: "News",
    entityId: existing.id,
    entityLabel: existing.title,
  });

  return NextResponse.json({ ok: true });
}
