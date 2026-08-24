import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAnyRole, ForbiddenError, UnauthorizedError } from "@/lib/auth/rbac";
import { slugify, isValidSlug } from "@/lib/content/slug";
import { sanitizeContentHtml, sanitizePlainText } from "@/lib/sanitize";
import { logAudit } from "@/lib/audit";

const createEpisodeSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().optional(),
  season: z.number().int().positive().optional(),
  number: z.number().int().positive().optional(),
  shortDescription: z.string().max(500).optional(),
  fullDescription: z.string().optional(),
  duration: z.number().int().positive().optional(),
  coverMediaId: z.string().uuid().optional(),
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

  const episodes = await prisma.episode.findMany({
    where: { deletedAt: null, ...(status ? { status: status as never } : {}) },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ episodes });
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

  const parsed = createEpisodeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }
  const data = parsed.data;

  let slug = data.slug ? slugify(data.slug) : slugify(data.title);
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: "Slug inválido." }, { status: 400 });
  }
  let finalSlug = slug;
  let counter = 2;
  while (await prisma.episode.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${slug}-${counter}`;
    counter += 1;
  }

  const episode = await prisma.episode.create({
    data: {
      title: sanitizePlainText(data.title),
      slug: finalSlug,
      season: data.season ?? null,
      number: data.number ?? null,
      shortDescription: data.shortDescription ? sanitizePlainText(data.shortDescription) : null,
      fullDescription: data.fullDescription ? sanitizeContentHtml(data.fullDescription) : null,
      duration: data.duration ?? null,
      coverMediaId: data.coverMediaId ?? null,
      status: "DRAFT",
      createdBy: actor.id,
      updatedBy: actor.id,
    },
  });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "EPISODE_CREATED",
    entityType: "Episode",
    entityId: episode.id,
    entityLabel: episode.title,
  });

  return NextResponse.json({ episode }, { status: 201 });
}
