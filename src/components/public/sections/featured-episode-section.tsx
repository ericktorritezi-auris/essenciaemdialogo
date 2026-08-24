import { prisma } from "@/lib/prisma";
import { getMediaUrlMap } from "@/lib/public/home-data";

interface FeaturedEpisodeSectionProps {
  content: Record<string, unknown>;
}

export async function FeaturedEpisodeSection({ content }: FeaturedEpisodeSectionProps) {
  const title = typeof content.title === "string" ? content.title : "Episódio em destaque";

  const episode = await prisma.episode.findFirst({
    where: { status: "PUBLISHED", featured: true, deletedAt: null },
    orderBy: { publishedAt: "desc" },
  });

  if (!episode) return null;

  const mediaMap = await getMediaUrlMap([episode.coverMediaId]);
  const coverUrl = episode.coverMediaId ? mediaMap.get(episode.coverMediaId) : null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h2 className="font-display text-2xl text-ivory">{title}</h2>
      <a
        href={`/episodios/${episode.slug}`}
        className="mt-6 flex flex-col gap-6 overflow-hidden rounded border border-bronze/20 bg-charcoal sm:flex-row"
      >
        <div className="aspect-square bg-petrol sm:w-64 sm:shrink-0">
          {coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="p-4 sm:py-6 sm:pr-6">
          <p className="text-lg text-ivory">{episode.title}</p>
          {episode.shortDescription && (
            <p className="mt-2 text-sm text-ivory/60">{episode.shortDescription}</p>
          )}
        </div>
      </a>
    </section>
  );
}
