import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAnyRole, ForbiddenError, UnauthorizedError } from "@/lib/auth/rbac";
import { slugify, isValidSlug } from "@/lib/content/slug";
import { sanitizeContentHtml, sanitizePlainText } from "@/lib/sanitize";
import { logAudit } from "@/lib/audit";

const createArticleSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().optional(),
  subtitle: z.string().max(300).optional(),
  summary: z.string().max(500).optional(),
  content: z.string().min(1),
  coverMediaId: z.string().uuid().optional(),
});

/** GET /api/admin/articles — lista com filtro opcional por status. */
export async function GET(request: NextRequest) {
  try {
    await requireAnyRole();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    throw error;
  }

  const status = request.nextUrl.searchParams.get("status");

  const articles = await prisma.article.findMany({
    where: {
      deletedAt: null,
      ...(status ? { status: status as never } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: { author: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ articles });
}

/** POST /api/admin/articles — cria um artigo em DRAFT, autor = quem está logado. */
export async function POST(request: NextRequest) {
  let actor;
  try {
    actor = await requireAnyRole();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    throw error;
  }

  const parsed = createArticleSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }
  const { title, subtitle, summary, content, coverMediaId } = parsed.data;

  let slug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(title);
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: "Slug inválido." }, { status: 400 });
  }

  // Garante unicidade — se já existir, sufixa com um contador.
  let finalSlug = slug;
  let counter = 2;
  while (await prisma.article.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${slug}-${counter}`;
    counter += 1;
  }

  const article = await prisma.article.create({
    data: {
      title: sanitizePlainText(title),
      slug: finalSlug,
      subtitle: subtitle ? sanitizePlainText(subtitle) : null,
      summary: summary ? sanitizePlainText(summary) : null,
      content: sanitizeContentHtml(content),
      coverMediaId: coverMediaId ?? null,
      authorId: actor.id,
      status: "DRAFT",
    },
  });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "ARTICLE_CREATED",
    entityType: "Article",
    entityId: article.id,
    entityLabel: article.title,
  });

  return NextResponse.json({ article }, { status: 201 });
}
