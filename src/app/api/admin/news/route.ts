import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAnyRole, ForbiddenError, UnauthorizedError } from "@/lib/auth/rbac";
import { slugify, isValidSlug } from "@/lib/content/slug";
import { sanitizeContentHtml, sanitizePlainText } from "@/lib/sanitize";
import { logAudit } from "@/lib/audit";

const createNewsSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().optional(),
  summary: z.string().max(500).optional(),
  content: z.string().min(1),
  coverMediaId: z.string().uuid().optional(),
  sourceName: z.string().max(150).optional(),
  sourceUrl: z.string().url().optional(),
  sourceDate: z.string().datetime().optional(),
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

  const news = await prisma.news.findMany({
    where: { deletedAt: null, ...(status ? { status: status as never } : {}) },
    orderBy: { updatedAt: "desc" },
    include: { author: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ news });
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

  const parsed = createNewsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }
  const { title, summary, content, coverMediaId, sourceName, sourceUrl, sourceDate } = parsed.data;

  let slug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(title);
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: "Slug inválido." }, { status: 400 });
  }
  let finalSlug = slug;
  let counter = 2;
  while (await prisma.news.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${slug}-${counter}`;
    counter += 1;
  }

  const news = await prisma.news.create({
    data: {
      title: sanitizePlainText(title),
      slug: finalSlug,
      summary: summary ? sanitizePlainText(summary) : null,
      content: sanitizeContentHtml(content),
      coverMediaId: coverMediaId ?? null,
      authorId: actor.id,
      sourceName: sourceName ? sanitizePlainText(sourceName) : null,
      sourceUrl: sourceUrl ?? null,
      sourceDate: sourceDate ? new Date(sourceDate) : null,
      status: "DRAFT",
    },
  });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "NEWS_CREATED",
    entityType: "News",
    entityId: news.id,
    entityLabel: news.title,
  });

  return NextResponse.json({ news }, { status: 201 });
}
