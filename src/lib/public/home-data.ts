import { prisma } from "@/lib/prisma";
import { getCurrentEditorialWeekRange } from "@/lib/time";
import type { HomeSectionKey } from "@/lib/content/home-sections";

export interface HomeSectionData {
  key: HomeSectionKey;
  content: Record<string, unknown>;
}

export async function getEnabledHomeSections(): Promise<HomeSectionData[]> {
  const sections = await prisma.homeSection.findMany({
    where: { enabled: true },
    orderBy: { order: "asc" },
  });
  return sections.map((s: { key: string; content: unknown }) => ({
    key: s.key as HomeSectionKey,
    content: (s.content as Record<string, unknown>) ?? {},
  }));
}

export async function getEnabledNavigationItems() {
  return prisma.navigationItem.findMany({
    where: { enabled: true },
    orderBy: { order: "asc" },
  });
}

export type LatestReleaseItem =
  | { kind: "ARTICLE"; id: string; title: string; slug: string; publishedAt: Date; coverMediaId: string | null }
  | { kind: "NEWS"; id: string; title: string; slug: string; publishedAt: Date; coverMediaId: string | null }
  | { kind: "EVENT"; id: string; title: string; slug: string; publishedAt: Date; coverMediaId: string | null };

/**
 * Agregação da seção "Últimos Lançamentos" — semana editorial corrente
 * (segunda→domingo, America/Sao_Paulo), por `publishedAt` (Seção 11 do
 * Prompt Mestre). Episódios entram aqui a partir da Sprint 4 — por
 * enquanto a agregação já roda certa para Artigos/Notícias/Eventos, só
 * falta a quarta fonte.
 */
export async function getLatestReleases(): Promise<LatestReleaseItem[]> {
  const { start, end } = getCurrentEditorialWeekRange();
  const publishedInWeek = { status: "PUBLISHED" as const, publishedAt: { gte: start, lte: end } };

  const [articles, news, events] = await Promise.all([
    prisma.article.findMany({
      where: { ...publishedInWeek, deletedAt: null },
      select: { id: true, title: true, slug: true, publishedAt: true, coverMediaId: true },
    }),
    prisma.news.findMany({
      where: { ...publishedInWeek, deletedAt: null },
      select: { id: true, title: true, slug: true, publishedAt: true, coverMediaId: true },
    }),
    prisma.event.findMany({
      where: { ...publishedInWeek, deletedAt: null },
      select: { id: true, title: true, slug: true, publishedAt: true, coverMediaId: true },
    }),
  ]);

  type RawItem = { id: string; title: string; slug: string; publishedAt: Date | null; coverMediaId: string | null };

  const items: LatestReleaseItem[] = [
    ...articles.map((a: RawItem) => ({ kind: "ARTICLE" as const, ...a, publishedAt: a.publishedAt! })),
    ...news.map((n: RawItem) => ({ kind: "NEWS" as const, ...n, publishedAt: n.publishedAt! })),
    ...events.map((e: RawItem) => ({ kind: "EVENT" as const, ...e, publishedAt: e.publishedAt! })),
  ];

  return items.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

export async function getUpcomingEvents(limit = 3) {
  return prisma.event.findMany({
    where: { status: "PUBLISHED", deletedAt: null, eventStartAt: { gte: new Date() } },
    orderBy: { eventStartAt: "asc" },
    take: limit,
  });
}

export async function getFeaturedArticles(limit = 3) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getActivePlatforms() {
  return prisma.platform.findMany({ where: { active: true }, orderBy: { order: "asc" } });
}

export async function getMediaUrlMap(mediaIds: (string | null)[]): Promise<Map<string, string>> {
  const ids = [...new Set(mediaIds.filter((id): id is string => !!id))];
  if (ids.length === 0) return new Map();
  const media = await prisma.media.findMany({ where: { id: { in: ids } }, select: { id: true, url: true } });
  return new Map(media.map((m: { id: string; url: string }) => [m.id, m.url]));
}
