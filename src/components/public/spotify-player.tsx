import { getSpotifyEmbedUrl } from "@/lib/spotify";

interface SpotifyPlayerProps {
  spotifyUrl: string | null;
}

export function SpotifyPlayer({ spotifyUrl }: SpotifyPlayerProps) {
  const embedUrl = spotifyUrl ? getSpotifyEmbedUrl(spotifyUrl) : null;

  if (embedUrl) {
    return (
      <iframe
        title="Player Spotify"
        src={embedUrl}
        width="100%"
        height="152"
        style={{ borderRadius: 12 }}
        frameBorder="0"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    );
  }

  // Fallback: sem embed disponível (sem link cadastrado, ou URL não
  // reconhecida) — nunca falha silenciosamente, sempre oferece um
  // caminho para ouvir (Seção 11 do Prompt Mestre).
  if (spotifyUrl) {
    return (
      <a
        href={spotifyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded border border-bronze/30 px-4 py-3 text-center text-sm text-ivory/90 hover:border-terracotta"
      >
        Ouvir no Spotify
      </a>
    );
  }

  return null;
}
