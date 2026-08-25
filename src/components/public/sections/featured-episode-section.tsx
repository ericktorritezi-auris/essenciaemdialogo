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
    <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <h2 className="font-display text-2xl text-ivory sm:text-3xl">{title}</h2>
      <a
        href={`/episodios/${episode.slug}`}
        className="content-card mt-8 flex flex-col sm:flex-row"
      >
        <div className="aspect-square bg-petrol sm:w-72 sm:shrink-0">
          {coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" className="h-full w-full object-cover"  loading="lazy" />
          )}
        </div>
        <div className="p-6 sm:py-8 sm:pr-8">
          <p className="font-display text-xl text-ivory">{episode.title}</p>
          {episode.shortDescription && (
            <p className="mt-3 text-sm leading-relaxed text-ivory/60">{episode.shortDescription}</p>
          )}
          <span className="mt-5 inline-block text-sm text-terracotta">Ouvir episódio →</span>
        </div>
      </a>
    </section>
  );
}
