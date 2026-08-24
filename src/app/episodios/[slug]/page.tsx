import { notFound } from "next/navigation";
import { getEpisodeBySlug, getAdjacentEpisodes, getRelatedEpisodes, getMediaUrlMap } from "@/lib/public/home-data";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { SpotifyPlayer } from "@/components/public/spotify-player";

export const dynamic = "force-dynamic";

interface EpisodePageProps {
  params: { slug: string };
}

interface PlatformLinkItem {
  platformId: string;
  url: string;
  platform: { key: string; name: string };
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const episode = await getEpisodeBySlug(params.slug);
  if (!episode) notFound();

  const platformLinks = episode.platformLinks as PlatformLinkItem[];
  const spotifyLink = platformLinks.find((l: PlatformLinkItem) => l.platform.key === "spotify");
  const otherLinks = platformLinks.filter((l: PlatformLinkItem) => l.platform.key !== "spotify");

  const [{ previous, next }, related] = await Promise.all([
    episode.publishedAt
      ? getAdjacentEpisodes(episode.publishedAt, episode.id)
      : Promise.resolve({ previous: null, next: null }),
    getRelatedEpisodes(episode.id),
  ]);

  interface RelatedEpisodeItem {
    id: string;
    slug: string;
    title: string;
    coverMediaId: string | null;
  }
  const relatedEpisodes = related as RelatedEpisodeItem[];

  const mediaMap = await getMediaUrlMap([
    episode.coverMediaId,
    ...relatedEpisodes.map((r: RelatedEpisodeItem) => r.coverMediaId),
  ]);
  const coverUrl = episode.coverMediaId ? mediaMap.get(episode.coverMediaId) : null;

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="aspect-square w-full max-w-sm mx-auto overflow-hidden rounded bg-petrol sm:mx-0">
          {coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>

        <h1 className="mt-6 font-display text-2xl text-ivory sm:text-3xl">{episode.title}</h1>
        {(episode.season || episode.number) && (
          <p className="mt-1 text-sm text-bronze">
            {episode.season ? `Temporada ${episode.season}` : ""}
            {episode.season && episode.number ? " · " : ""}
            {episode.number ? `Episódio ${episode.number}` : ""}
          </p>
        )}

        {episode.shortDescription && (
          <p className="mt-4 text-ivory/70">{episode.shortDescription}</p>
        )}

        <div className="mt-6">
          <SpotifyPlayer spotifyUrl={spotifyLink?.url ?? null} />
        </div>

        {otherLinks.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {otherLinks.map((link: PlatformLinkItem) => (
              <a
                key={link.platformId}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-bronze/30 px-4 py-2 text-sm text-ivory/90 hover:border-terracotta"
              >
                Ouvir/assistir no {link.platform.name}
              </a>
            ))}
          </div>
        )}

        {episode.fullDescription && (
          <div
            className="mt-8 space-y-4 text-ivory/80 [&_a]:text-terracotta [&_h2]:font-display [&_h2]:text-xl [&_h2]:text-ivory [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: episode.fullDescription }}
          />
        )}

        {(previous || next) && (
          <div className="mt-12 flex justify-between border-t border-bronze/20 pt-6 text-sm">
            {previous ? (
              <a href={`/episodios/${previous.slug}`} className="text-ivory/70 hover:text-terracotta">
                ← {previous.title}
              </a>
            ) : (
              <span />
            )}
            {next && (
              <a href={`/episodios/${next.slug}`} className="text-ivory/70 hover:text-terracotta">
                {next.title} →
              </a>
            )}
          </div>
        )}

        {related.length > 0 && (
          <div className="mt-12 border-t border-bronze/20 pt-8">
            <h2 className="font-display text-xl text-ivory">Você também pode gostar</h2>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {relatedEpisodes.map((r: RelatedEpisodeItem) => {
                const relCoverUrl = r.coverMediaId ? mediaMap.get(r.coverMediaId) : null;
                return (
                  <a key={r.id} href={`/episodios/${r.slug}`} className="block">
                    <div className="aspect-square overflow-hidden rounded bg-petrol">
                      {relCoverUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={relCoverUrl} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <p className="mt-2 text-xs text-ivory/70">{r.title}</p>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
