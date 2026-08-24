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
  | { kind: "EPISODE"; id: string; title: string; slug: string; publishedAt: Date; coverMediaId: string | null }
  | { kind: "ARTICLE"; id: string; title: string; slug: string; publishedAt: Date; coverMediaId: string | null }
  | { kind: "NEWS"; id: string; title: string; slug: string; publishedAt: Date; coverMediaId: string | null }
  | { kind: "EVENT"; id: string; title: string; slug: string; publishedAt: Date; coverMediaId: string | null };

/**
 * Agregação da seção "Últimos Lançamentos" — semana editorial corrente
 * (segunda→domingo, America/Sao_Paulo), por `publishedAt` (Seção 11 do
 * Prompt Mestre). Agora completa: Episódio + Artigo + Notícia + Evento
 * (Episódio entrou na Sprint 5, depois do módulo de Episódios existir).
 */
export async function getLatestReleases(): Promise<LatestReleaseItem[]> {
  const { start, end } = getCurrentEditorialWeekRange();
  const publishedInWeek = { status: "PUBLISHED" as const, publishedAt: { gte: start, lte: end } };

  const [episodes, articles, news, events] = await Promise.all([
    prisma.episode.findMany({
      where: { ...publishedInWeek, deletedAt: null },
      select: { id: true, title: true, slug: true, publishedAt: true, coverMediaId: true },
    }),
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
    ...episodes.map((ep: RawItem) => ({ kind: "EPISODE" as const, ...ep, publishedAt: ep.publishedAt! })),
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

export async function getPublishedArticles() {
  return prisma.article.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findFirst({
    where: { slug, status: "PUBLISHED", deletedAt: null },
    include: { author: { select: { name: true } } },
  });
}

export async function getRelatedArticles(currentId: string, limit = 3) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED", deletedAt: null, id: { not: currentId } },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getPublishedNewsList() {
  return prisma.news.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getNewsBySlug(slug: string) {
  return prisma.news.findFirst({
    where: { slug, status: "PUBLISHED", deletedAt: null },
    include: { author: { select: { name: true } } },
  });
}

export async function getPublishedEventsList() {
  return prisma.event.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { eventStartAt: "desc" },
  });
}

export async function getEventBySlug(slug: string) {
  return prisma.event.findFirst({
    where: { slug, status: "PUBLISHED", deletedAt: null },
  });
}

export async function getPublishedEpisodes(limit?: number) {
  return prisma.episode.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { publishedAt: "desc" },
    ...(limit ? { take: limit } : {}),
  });
}

export async function getEpisodeBySlug(slug: string) {
  return prisma.episode.findFirst({
    where: { slug, status: "PUBLISHED", deletedAt: null },
    include: { platformLinks: { include: { platform: true } } },
  });
}

/**
 * Episódio anterior/próximo — ordenados por `publishedAt` (Seção 4 do
 * Prompt Mestre: navegação entre episódios na página individual).
 */
export async function getAdjacentEpisodes(publishedAt: Date, currentId: string) {
  const [previous, next] = await Promise.all([
    prisma.episode.findFirst({
      where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lt: publishedAt }, id: { not: currentId } },
      orderBy: { publishedAt: "desc" },
      select: { slug: true, title: true },
    }),
    prisma.episode.findFirst({
      where: { status: "PUBLISHED", deletedAt: null, publishedAt: { gt: publishedAt }, id: { not: currentId } },
      orderBy: { publishedAt: "asc" },
      select: { slug: true, title: true },
    }),
  ]);
  return { previous, next };
}

export async function getRelatedEpisodes(currentId: string, limit = 3) {
  return prisma.episode.findMany({
    where: { status: "PUBLISHED", deletedAt: null, id: { not: currentId } },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getMediaUrlMap(mediaIds: (string | null)[]): Promise<Map<string, string>> {
  const ids = [...new Set(mediaIds.filter((id): id is string => !!id))];
  if (ids.length === 0) return new Map();
  const media = await prisma.media.findMany({ where: { id: { in: ids } }, select: { id: true, url: true } });
  return new Map(media.map((m: { id: string; url: string }) => [m.id, m.url]));
}
