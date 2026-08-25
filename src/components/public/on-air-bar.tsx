import { prisma } from "@/lib/prisma";
import Link from "next/link";

export async function OnAirBar() {
  const config = await prisma.radioConfiguration.findFirst();

  if (!config || !config.enabled) return null;

  const content = (config.content as Record<string, unknown>) ?? {};

  return (
    <div className="border-b border-bronze/20 bg-charcoal px-4 py-2 text-sm sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
        <span className="rounded bg-terracotta px-2 py-0.5 text-xs font-medium text-ivory">ON AIR</span>
        <span className="text-ivory/80">{config.title ?? "Rádio Essência em Diálogo"}</span>

        {(config.mode === "spotify" || config.mode === "external") && typeof content.embedUrl === "string" && (
          <Link href="/radio" className="text-terracotta">
            Ouvir agora
          </Link>
        )}

        {config.mode === "own_audio" && typeof content.audioUrl === "string" && (
          <audio controls src={content.audioUrl} className="h-8" />
        )}

        {config.mode === "editorial_playlist" && Array.isArray(content.items) && (
          <Link href="/radio" className="text-terracotta">
            Ver playlist completa
          </Link>
        )}
      </div>
    </div>
  );
}
