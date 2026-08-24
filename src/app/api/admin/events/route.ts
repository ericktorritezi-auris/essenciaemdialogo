import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAnyRole, ForbiddenError, UnauthorizedError } from "@/lib/auth/rbac";
import { slugify, isValidSlug } from "@/lib/content/slug";
import { sanitizeContentHtml, sanitizePlainText } from "@/lib/sanitize";
import { logAudit } from "@/lib/audit";

const createEventSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().optional(),
  type: z.enum(["OWN", "RECOMMENDED"]),
  description: z.string().max(2000).optional(),
  coverMediaId: z.string().uuid().optional(),
  organizer: z.string().max(150).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  modality: z.enum(["online", "presencial", "hibrido"]).optional(),
  // Sempre recebido em ISO 8601 com offset explícito do client — nunca
  // um horário "solto" sem timezone (Seção 13 do Plano Técnico).
  eventStartAt: z.string().datetime({ offset: true }),
  eventEndAt: z.string().datetime({ offset: true }).optional(),
  url: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireAnyRole();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    throw error;
  }

  const status = request.nextUrl.searchParams.get("status");

  const events = await prisma.event.findMany({
    where: { deletedAt: null, ...(status ? { status: status as never } : {}) },
    orderBy: { eventStartAt: "asc" },
    include: { author: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ events });
}

export async function POST(request: NextRequest) {
  let actor;
  try {
    actor = await requireAnyRole();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    throw error;
  }

  const parsed = createEventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }
  const data = parsed.data;

  if (data.eventEndAt && new Date(data.eventEndAt) < new Date(data.eventStartAt)) {
    return NextResponse.json({ error: "A data de término não pode ser antes do início." }, { status: 400 });
  }

  let slug = data.slug ? slugify(data.slug) : slugify(data.title);
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: "Slug inválido." }, { status: 400 });
  }
  let finalSlug = slug;
  let counter = 2;
  while (await prisma.event.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${slug}-${counter}`;
    counter += 1;
  }

  const event = await prisma.event.create({
    data: {
      title: sanitizePlainText(data.title),
      slug: finalSlug,
      type: data.type,
      description: data.description ? sanitizeContentHtml(data.description) : null,
      coverMediaId: data.coverMediaId ?? null,
      organizer: data.organizer ? sanitizePlainText(data.organizer) : null,
      city: data.city ? sanitizePlainText(data.city) : null,
      state: data.state ? sanitizePlainText(data.state) : null,
      country: data.country ? sanitizePlainText(data.country) : null,
      modality: data.modality ?? null,
      eventStartAt: new Date(data.eventStartAt),
      eventEndAt: data.eventEndAt ? new Date(data.eventEndAt) : null,
      url: data.url ?? null,
      authorId: actor.id,
      status: "DRAFT",
    },
  });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "EVENT_CREATED",
    entityType: "Event",
    entityId: event.id,
    entityLabel: event.title,
  });

  return NextResponse.json({ event }, { status: 201 });
}
