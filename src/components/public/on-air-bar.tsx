import { prisma } from "@/lib/prisma";

interface PlaylistItem {
  title: string;
  url: string;
}

export async function OnAirBar() {
  const config = await prisma.radioConfiguration.findFirst();

  if (!config || !config.enabled) return null;

  const content = (config.content as Record<string, unknown>) ?? {};

  return (
    <div className="border-b border-bronze/20 bg-charcoal px-4 py-2 text-sm sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
        <span className="rounded bg-terracotta px-2 py-0.5 text-xs font-medium text-ivory">ON AIR</span>
        <span className="text-ivory/80">{config.title ?? "Rádio Essência em Diálogo"}</span>

        {/* Spotify/externo: só um link — o player completo do Spotify
            (152px) fica pesado demais para um cabeçalho fixo. Uma
            página dedicada /radio com o embed completo é uma iteração
            futura possível, se fizer sentido (ver docs/RADIO.md). */}
        {(config.mode === "spotify" || config.mode === "external") && typeof content.embedUrl === "string" && (
          <a href={content.embedUrl} target="_blank" rel="noopener noreferrer" className="text-terracotta">
            Ouvir agora
          </a>
        )}

        {config.mode === "own_audio" && typeof content.audioUrl === "string" && (
          <audio controls src={content.audioUrl} className="h-8" />
        )}

        {config.mode === "editorial_playlist" && Array.isArray(content.items) && (
          <div className="flex gap-3">
            {(content.items as PlaylistItem[]).slice(0, 3).map((item) => (
              <a
                key={item.url}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-terracotta"
              >
                {item.title}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
