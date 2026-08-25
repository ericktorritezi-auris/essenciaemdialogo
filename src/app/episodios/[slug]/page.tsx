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
      <main id="main-content" className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-lg bg-petrol shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] sm:mx-0">
          {coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>

        <h1 className="mt-7 font-display text-3xl leading-tight text-ivory sm:text-4xl">{episode.title}</h1>
        {(episode.season || episode.number) && (
          <p className="mt-2 text-sm uppercase tracking-wide text-bronze">
            {episode.season ? `Temporada ${episode.season}` : ""}
            {episode.season && episode.number ? " · " : ""}
            {episode.number ? `Episódio ${episode.number}` : ""}
          </p>
        )}

        {episode.shortDescription && (
          <p className="mt-5 text-lg leading-relaxed text-ivory/70">{episode.shortDescription}</p>
        )}

        <div className="mt-7">
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
                className="rounded border border-bronze/30 px-4 py-2 text-sm text-ivory/90 transition-colors hover:border-terracotta hover:text-terracotta"
              >
                Ouvir/assistir no {link.platform.name}
              </a>
            ))}
          </div>
        )}

        {episode.fullDescription && (
          <div
            className="mt-10 space-y-4 text-[1.05rem] leading-relaxed text-ivory/80 [&_a]:text-terracotta [&_h2]:font-display [&_h2]:text-xl [&_h2]:text-ivory [&_h3]:font-display [&_h3]:text-lg [&_h3]:text-ivory [&_ul]:list-disc [&_ul]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-bronze [&_blockquote]:pl-4 [&_blockquote]:italic"
            dangerouslySetInnerHTML={{ __html: episode.fullDescription }}
          />
        )}

        {(previous || next) && (
          <div className="mt-14 flex justify-between gap-4 border-t border-bronze/15 pt-6 text-sm">
            {previous ? (
              <a href={`/episodios/${previous.slug}`} className="text-ivory/70 transition-colors hover:text-terracotta">
                ← {previous.title}
              </a>
            ) : (
              <span />
            )}
            {next && (
              <a href={`/episodios/${next.slug}`} className="text-right text-ivory/70 transition-colors hover:text-terracotta">
                {next.title} →
              </a>
            )}
          </div>
        )}

        {related.length > 0 && (
          <div className="mt-14 border-t border-bronze/15 pt-10">
            <h2 className="font-display text-xl text-ivory">Você também pode gostar</h2>
            <div className="mt-5 grid grid-cols-3 gap-4">
              {relatedEpisodes.map((r: RelatedEpisodeItem) => {
                const relCoverUrl = r.coverMediaId ? mediaMap.get(r.coverMediaId) : null;
                return (
                  <a key={r.id} href={`/episodios/${r.slug}`} className="content-card">
                    <div className="aspect-square bg-petrol">
                      {relCoverUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={relCoverUrl} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <p className="p-2.5 text-xs leading-snug text-ivory">{r.title}</p>
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
