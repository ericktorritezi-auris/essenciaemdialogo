import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/public/seo";

/**
 * Sitemap gerado dinamicamente a partir do banco — nunca precisa ser
 * atualizado manualmente quando um conteúdo novo é publicado (Seção 20
 * do Prompt Mestre).
 *
 * `force-dynamic`: consulta o banco, então não pode ser pré-gerado em
 * build time (banco não acessível no build — mesma causa raiz já
 * corrigida na Home na Sprint 3; faltou aplicar aqui também).
 */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/quem-somos`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/episodios`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/artigos`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/noticias`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/eventos`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/radio`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/termos`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const [episodes, articles, news, events] = await Promise.all([
    prisma.episode.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
    prisma.news.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
    prisma.event.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  type Item = { slug: string; updatedAt: Date };

  const contentRoutes: MetadataRoute.Sitemap = [
    ...episodes.map((e: Item) => ({
      url: `${siteUrl}/episodios/${e.slug}`,
      lastModified: e.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...articles.map((a: Item) => ({
      url: `${siteUrl}/artigos/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...news.map((n: Item) => ({
      url: `${siteUrl}/noticias/${n.slug}`,
      lastModified: n.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...events.map((ev: Item) => ({
      url: `${siteUrl}/eventos/${ev.slug}`,
      lastModified: ev.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];

  return [...staticRoutes, ...contentRoutes];
}
