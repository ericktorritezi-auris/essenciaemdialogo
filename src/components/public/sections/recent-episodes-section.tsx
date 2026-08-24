import { prisma } from "@/lib/prisma";
import { getMediaUrlMap } from "@/lib/public/home-data";

interface RecentEpisodesSectionProps {
  content: Record<string, unknown>;
}

export async function RecentEpisodesSection({ content }: RecentEpisodesSectionProps) {
  const title = typeof content.title === "string" ? content.title : "Episódios recentes";

  const episodes = await prisma.episode.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { publishedAt: "desc" },
    take: 4,
  });

  if (episodes.length === 0) return null;

  type EpisodeItem = { id: string; slug: string; title: string; coverMediaId: string | null };

  const mediaMap = await getMediaUrlMap(episodes.map((e: EpisodeItem) => e.coverMediaId));

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="font-display text-2xl text-ivory">{title}</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {episodes.map((episode: EpisodeItem) => {
          const coverUrl = episode.coverMediaId ? mediaMap.get(episode.coverMediaId) : null;
          return (
            <a
              key={episode.id}
              href={`/episodios/${episode.slug}`}
              className="block overflow-hidden rounded border border-bronze/20 bg-charcoal"
            >
              <div className="aspect-square bg-petrol">
                {coverUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverUrl} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <p className="p-3 text-sm text-ivory">{episode.title}</p>
            </a>
          );
        })}
      </div>
    </section>
  );
}
