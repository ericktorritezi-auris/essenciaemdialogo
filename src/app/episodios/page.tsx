import { getPublishedEpisodes, getMediaUrlMap } from "@/lib/public/home-data";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

export const dynamic = "force-dynamic";

interface EpisodeListItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  coverMediaId: string | null;
}

export default async function EpisodesPage() {
  const episodes: EpisodeListItem[] = await getPublishedEpisodes();
  const mediaMap = await getMediaUrlMap(episodes.map((e: EpisodeListItem) => e.coverMediaId));

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl text-ivory">Episódios</h1>

        {episodes.length === 0 && (
          <p className="mt-8 text-ivory/50">Nenhum episódio publicado ainda.</p>
        )}

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {episodes.map((episode: EpisodeListItem) => {
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
                <div className="p-3">
                  <p className="text-sm text-ivory">{episode.title}</p>
                  {episode.shortDescription && (
                    <p className="mt-1 line-clamp-2 text-xs text-ivory/50">{episode.shortDescription}</p>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
