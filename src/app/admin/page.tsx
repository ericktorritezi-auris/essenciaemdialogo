import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";

/**
 * Dashboard com indicadores editoriais reais (Sprint 2). Cada card é um
 * atalho — a contagem em si é só orientativa, não pretende ser um
 * relatório; relatórios/gráficos mais ricos ficam para depois, se
 * fizerem falta.
 */
export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isOwn = user.role === "COLLABORATOR" ? { authorId: user.id } : {};
  const isOwnEpisode = user.role === "COLLABORATOR" ? { createdBy: user.id } : {};

  const [episodeCount, articleCount, newsCount, eventCount, mediaCount, inReviewCount] = await Promise.all([
    prisma.episode.count({ where: { deletedAt: null, ...isOwnEpisode } }),
    prisma.article.count({ where: { deletedAt: null, ...isOwn } }),
    prisma.news.count({ where: { deletedAt: null, ...isOwn } }),
    prisma.event.count({ where: { deletedAt: null, ...isOwn } }),
    prisma.media.count({ where: { deletedAt: null } }),
    user.role === "ADMIN"
      ? prisma.article.count({ where: { deletedAt: null, status: "IN_REVIEW" } })
      : Promise.resolve(0),
  ]);

  const cards = [
    { label: "Episódios", count: episodeCount, href: "/admin/episodes" },
    { label: "Artigos", count: articleCount, href: "/admin/articles" },
    { label: "Notícias", count: newsCount, href: "/admin/news" },
    { label: "Eventos", count: eventCount, href: "/admin/events" },
    { label: "Mídia", count: mediaCount, href: "/admin/media" },
  ];

  return (
    <main className="p-8">
      <h1 className="font-display text-2xl">Painel administrativo</h1>
      <p className="mt-2 text-ivory/70">
        Olá, {user.name} — papel: {user.role === "ADMIN" ? "Administrador" : "Colaborador"}
      </p>

      {user.role === "ADMIN" && inReviewCount > 0 && (
        <p className="mt-4 rounded border border-bronze/30 bg-charcoal px-4 py-2 text-sm text-bronze">
          {inReviewCount} artigo(s) aguardando revisão.
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded border border-bronze/20 bg-charcoal p-4 hover:border-terracotta"
          >
            <p className="text-2xl font-display">{card.count}</p>
            <p className="mt-1 text-sm text-ivory/60">{card.label}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
