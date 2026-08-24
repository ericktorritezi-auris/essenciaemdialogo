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

const updateArticleSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  subtitle: z.string().max(300).nullable().optional(),
  summary: z.string().max(500).nullable().optional(),
  content: z.string().min(1).optional(),
  coverMediaId: z.string().uuid().nullable().optional(),
  featured: z.boolean().optional(),
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

  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: { author: { select: { id: true, name: true } } },
  });

  if (!article || article.deletedAt) {
    return NextResponse.json({ error: "Artigo não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ article });
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

  const existing = await prisma.article.findUnique({ where: { id: params.id } });
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ error: "Artigo não encontrado." }, { status: 404 });
  }

  // Colaborador só edita o próprio artigo; Admin edita qualquer um.
  if (actor.role === "COLLABORATOR" && existing.authorId !== actor.id) {
    return NextResponse.json({ error: "Você só pode editar seus próprios artigos." }, { status: 403 });
  }

  const parsed = updateArticleSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }
  const data = parsed.data;

  if (data.status) {
    try {
      assertValidTransition(existing.status as ContentStatus, data.status, actor.role);
    } catch (error) {
      if (error instanceof InvalidTransitionError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error instanceof TransitionForbiddenError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      throw error;
    }
  }

  const publishedAt = data.status && shouldSetPublishedAt(existing.publishedAt, data.status)
    ? new Date()
    : undefined;

  const article = await prisma.article.update({
    where: { id: params.id },
    data: {
      ...(data.title !== undefined ? { title: sanitizePlainText(data.title) } : {}),
      ...(data.subtitle !== undefined ? { subtitle: data.subtitle ? sanitizePlainText(data.subtitle) : null } : {}),
      ...(data.summary !== undefined ? { summary: data.summary ? sanitizePlainText(data.summary) : null } : {}),
      ...(data.content !== undefined ? { content: sanitizeContentHtml(data.content) } : {}),
      ...(data.coverMediaId !== undefined ? { coverMediaId: data.coverMediaId } : {}),
      ...(data.featured !== undefined ? { featured: data.featured } : {}),
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
    action: data.status && data.status !== existing.status ? "ARTICLE_STATUS_CHANGED" : "ARTICLE_UPDATED",
    entityType: "Article",
    entityId: article.id,
    entityLabel: article.title,
    beforeState: { status: existing.status },
    afterState: { status: article.status },
  });

  return NextResponse.json({ article });
}

/** DELETE — soft delete (Seção 9/Lixeira). Admin sempre pode; Colaborador só o próprio DRAFT. */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  let actor;
  try {
    actor = await requireAnyRole();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    throw error;
  }

  const existing = await prisma.article.findUnique({ where: { id: params.id } });
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ error: "Artigo não encontrado." }, { status: 404 });
  }

  const isOwnDraft = existing.authorId === actor.id && existing.status === "DRAFT";
  if (actor.role !== "ADMIN" && !isOwnDraft) {
    return NextResponse.json(
      { error: "Colaboradores só podem excluir os próprios rascunhos." },
      { status: 403 },
    );
  }

  await prisma.article.update({
    where: { id: params.id },
    data: { deletedAt: new Date() },
  });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "ARTICLE_DELETED",
    entityType: "Article",
    entityId: existing.id,
    entityLabel: existing.title,
  });

  return NextResponse.json({ ok: true });
}
