import { prisma } from "@/lib/prisma";

export type SearchResultItem =
  | { kind: "EPISODE"; id: string; title: string; slug: string; snippet: string | null }
  | { kind: "ARTICLE"; id: string; title: string; slug: string; snippet: string | null }
  | { kind: "NEWS"; id: string; title: string; slug: string; snippet: string | null }
  | { kind: "EVENT"; id: string; title: string; slug: string; snippet: string | null };

const KIND_HREF_PREFIX: Record<SearchResultItem["kind"], string> = {
  EPISODE: "/episodios",
  ARTICLE: "/artigos",
  NEWS: "/noticias",
  EVENT: "/eventos",
};

export function getSearchResultHref(item: SearchResultItem): string {
  return `${KIND_HREF_PREFIX[item.kind]}/${item.slug}`;
}

/**
 * Busca global por título/resumo (case-insensitive, `contains`).
 *
 * Decisão de escopo desta sprint: o Plano Técnico previa PostgreSQL
 * Full Text Search (tsvector/GIN) como solução ideal. Implementar FTS
 * de verdade exige colunas geradas e índice GIN via SQL — algo que só
 * dá para fazer com segurança rodando `migrate dev` contra um banco
 * real (que não tenho acesso daqui) e testando de verdade. Um `ILIKE`
 * por título/resumo é bem mais simples, funciona corretamente para o
 * volume de conteúdo atual, e não fica pior nem melhor — só menos
 * sofisticado que relevância por ranking. Documentado em docs/SEARCH.md
 * com o critério de quando vale a pena migrar para FTS de verdade.
 */
export async function searchContent(query: string, limit = 20): Promise<SearchResultItem[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const contains = { contains: q, mode: "insensitive" as const };

  const [episodes, articles, news, events] = await Promise.all([
    prisma.episode.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        OR: [{ title: contains }, { shortDescription: contains }],
      },
      select: { id: true, title: true, slug: true, shortDescription: true },
      take: limit,
    }),
    prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        OR: [{ title: contains }, { summary: contains }],
      },
      select: { id: true, title: true, slug: true, summary: true },
      take: limit,
    }),
    prisma.news.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        OR: [{ title: contains }, { summary: contains }],
      },
      select: { id: true, title: true, slug: true, summary: true },
      take: limit,
    }),
    prisma.event.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        OR: [{ title: contains }, { description: contains }],
      },
      select: { id: true, title: true, slug: true, description: true },
      take: limit,
    }),
  ]);

  type RawItem = { id: string; title: string; slug: string; [key: string]: unknown };

  function toSnippet(raw: RawItem, field: string): string | null {
    const value = raw[field];
    return typeof value === "string" ? value.slice(0, 160) : null;
  }

  const results: SearchResultItem[] = [
    ...episodes.map((e: RawItem) => ({ kind: "EPISODE" as const, id: e.id, title: e.title, slug: e.slug, snippet: toSnippet(e, "shortDescription") })),
    ...articles.map((a: RawItem) => ({ kind: "ARTICLE" as const, id: a.id, title: a.title, slug: a.slug, snippet: toSnippet(a, "summary") })),
    ...news.map((n: RawItem) => ({ kind: "NEWS" as const, id: n.id, title: n.title, slug: n.slug, snippet: toSnippet(n, "summary") })),
    ...events.map((ev: RawItem) => ({ kind: "EVENT" as const, id: ev.id, title: ev.title, slug: ev.slug, snippet: toSnippet(ev, "description") })),
  ];

  return results.slice(0, limit);
}
