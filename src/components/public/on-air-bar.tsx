import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getSpotifyEmbedUrl } from "@/lib/spotify";

interface PlaylistItem {
  title: string;
  url: string;
}

/**
 * Barra ON AIR — vive no layout compartilhado (Sprint 11), por isso
 * agora persiste durante a navegação em vez de recarregar a cada
 * página. Isso permite embutir o player real do Spotify (compacto,
 * 80px) sem ele reiniciar a cada clique.
 */
export async function OnAirBar() {
  const config = await prisma.radioConfiguration.findFirst();

  if (!config || !config.enabled) return null;

  const content = (config.content as Record<string, unknown>) ?? {};

  return (
    <div className="border-b border-bronze/20 bg-warm-black px-4 py-2 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3 text-sm">
          <span className="rounded bg-terracotta px-2 py-0.5 text-xs font-medium text-ivory">ON AIR</span>
          <span className="text-ivory/80">{config.title ?? "Rádio Essência em Diálogo"}</span>

          {/* Externo: sem embed compacto garantido para qualquer
              provedor — mantém como link seguro para /radio, onde o
              iframe completo é mostrado. */}
          {config.mode === "external" && typeof content.embedUrl === "string" && (
            <Link href="/radio" className="text-terracotta">
              Ouvir agora
            </Link>
          )}

          {config.mode === "editorial_playlist" && Array.isArray(content.items) && (
            <Link href="/radio" className="text-terracotta">
              Ver playlist completa
            </Link>
          )}
        </div>

        {/* Spotify: player compacto real (80px) embutido na própria
            barra — como o layout agora é compartilhado, o iframe
            persiste e continua tocando ao navegar pelo site. */}
        {config.mode === "spotify" && typeof content.embedUrl === "string" && (
          <SpotifyCompactEmbed url={content.embedUrl} />
        )}

        {/* Áudio próprio: <audio> nativo — persiste automaticamente
            pelo mesmo motivo (elemento não é mais remontado a cada
            navegação). */}
        {config.mode === "own_audio" && typeof content.audioUrl === "string" && (
          <audio controls src={content.audioUrl} className="mt-2 h-10 w-full max-w-md" />
        )}
      </div>
    </div>
  );
}

function SpotifyCompactEmbed({ url }: { url: string }) {
  const embedUrl = getSpotifyEmbedUrl(url);

  if (!embedUrl) {
    // URL não reconhecida — nunca falha silenciosamente, oferece um
    // caminho alternativo (Seção 11 do Prompt Mestre).
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-terracotta">
        Ouvir no Spotify
      </a>
    );
  }

  return (
    <iframe
      title="Rádio — Spotify"
      src={embedUrl}
      width="100%"
      height="80"
      style={{ borderRadius: 8, marginTop: 8 }}
      frameBorder="0"
      allowFullScreen
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="eager"
    />
  );
}
