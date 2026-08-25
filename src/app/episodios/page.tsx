import type { Metadata } from "next";
import { getPublishedEpisodes, getMediaUrlMap } from "@/lib/public/home-data";
import { buildMetadata } from "@/lib/public/seo";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Episódios",
  description: "Todos os episódios do podcast Essência em Diálogo — duas perspectivas em diálogo, semana a semana.",
  path: "/episodios",
});

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
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h1 className="font-display text-3xl text-ivory sm:text-4xl">Episódios</h1>
        <p className="mt-3 max-w-lg text-ivory/60">
          Todas as conversas, semana a semana — duas perspectivas em diálogo.
        </p>

        {episodes.length === 0 && (
          <p className="mt-12 text-ivory/50">Nenhum episódio publicado ainda.</p>
        )}

        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {episodes.map((episode: EpisodeListItem) => {
            const coverUrl = episode.coverMediaId ? mediaMap.get(episode.coverMediaId) : null;
            return (
              <a key={episode.id} href={`/episodios/${episode.slug}`} className="content-card">
                <div className="aspect-square bg-petrol">
                  {coverUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverUrl} alt="" className="h-full w-full object-cover"  loading="lazy" />
                  )}
                </div>
                <div className="p-3.5">
                  <p className="text-sm leading-snug text-ivory">{episode.title}</p>
                  {episode.shortDescription && (
                    <p className="mt-1.5 line-clamp-2 text-xs text-ivory/50">{episode.shortDescription}</p>
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
