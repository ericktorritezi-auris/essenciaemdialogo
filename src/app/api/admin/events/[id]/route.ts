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

const updateEventSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  type: z.enum(["OWN", "RECOMMENDED"]).optional(),
  description: z.string().max(2000).nullable().optional(),
  coverMediaId: z.string().uuid().nullable().optional(),
  organizer: z.string().max(150).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  state: z.string().max(100).nullable().optional(),
  country: z.string().max(100).nullable().optional(),
  modality: z.enum(["online", "presencial", "hibrido"]).nullable().optional(),
  eventStartAt: z.string().datetime({ offset: true }).optional(),
  eventEndAt: z.string().datetime({ offset: true }).nullable().optional(),
  url: z.string().url().nullable().optional(),
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

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: { author: { select: { id: true, name: true } } },
  });
  if (!event || event.deletedAt) {
    return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
  }
  return NextResponse.json({ event });
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

  const existing = await prisma.event.findUnique({ where: { id: params.id } });
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
  }
  if (actor.role === "COLLABORATOR" && existing.authorId !== actor.id) {
    return NextResponse.json({ error: "Você só pode editar seus próprios eventos." }, { status: 403 });
  }

  const parsed = updateEventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }
  const data = parsed.data;

  const nextStart = data.eventStartAt ? new Date(data.eventStartAt) : existing.eventStartAt;
  const nextEnd = data.eventEndAt !== undefined
    ? (data.eventEndAt ? new Date(data.eventEndAt) : null)
    : existing.eventEndAt;
  if (nextEnd && nextEnd < nextStart) {
    return NextResponse.json({ error: "A data de término não pode ser antes do início." }, { status: 400 });
  }

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

  const event = await prisma.event.update({
    where: { id: params.id },
    data: {
      ...(data.title !== undefined ? { title: sanitizePlainText(data.title) } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.description !== undefined ? { description: data.description ? sanitizeContentHtml(data.description) : null } : {}),
      ...(data.coverMediaId !== undefined ? { coverMediaId: data.coverMediaId } : {}),
      ...(data.organizer !== undefined ? { organizer: data.organizer ? sanitizePlainText(data.organizer) : null } : {}),
      ...(data.city !== undefined ? { city: data.city ? sanitizePlainText(data.city) : null } : {}),
      ...(data.state !== undefined ? { state: data.state ? sanitizePlainText(data.state) : null } : {}),
      ...(data.country !== undefined ? { country: data.country ? sanitizePlainText(data.country) : null } : {}),
      ...(data.modality !== undefined ? { modality: data.modality } : {}),
      ...(data.eventStartAt !== undefined ? { eventStartAt: nextStart } : {}),
      ...(data.eventEndAt !== undefined ? { eventEndAt: nextEnd } : {}),
      ...(data.url !== undefined ? { url: data.url } : {}),
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
    action: data.status && data.status !== existing.status ? "EVENT_STATUS_CHANGED" : "EVENT_UPDATED",
    entityType: "Event",
    entityId: event.id,
    entityLabel: event.title,
    beforeState: { status: existing.status },
    afterState: { status: event.status },
  });

  return NextResponse.json({ event });
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

  const existing = await prisma.event.findUnique({ where: { id: params.id } });
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
  }

  const isOwnDraft = existing.authorId === actor.id && existing.status === "DRAFT";
  if (actor.role !== "ADMIN" && !isOwnDraft) {
    return NextResponse.json({ error: "Colaboradores só podem excluir os próprios rascunhos." }, { status: 403 });
  }

  await prisma.event.update({ where: { id: params.id }, data: { deletedAt: new Date() } });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "EVENT_DELETED",
    entityType: "Event",
    entityId: existing.id,
    entityLabel: existing.title,
  });

  return NextResponse.json({ ok: true });
}
