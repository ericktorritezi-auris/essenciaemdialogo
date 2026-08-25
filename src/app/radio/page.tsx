import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/public/seo";
import { getSpotifyEmbedUrl } from "@/lib/spotify";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Rádio / ON AIR",
  description: "Ouça o Essência em Diálogo ao vivo.",
  path: "/radio",
});

interface PlaylistItem {
  title: string;
  url: string;
}

export default async function RadioPage() {
  const config = await prisma.radioConfiguration.findFirst();
  const content = (config?.content as Record<string, unknown>) ?? {};

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <span className="rounded bg-terracotta px-3 py-1 text-xs font-medium text-ivory">ON AIR</span>
        <h1 className="mt-4 font-display text-3xl text-ivory sm:text-4xl">
          {config?.title ?? "Rádio Essência em Diálogo"}
        </h1>
        {config?.description && (
          <p className="mx-auto mt-3 max-w-lg text-ivory/60">{config.description}</p>
        )}

        <div className="mt-10">
          {!config || !config.enabled ? (
            <p className="rounded-lg border border-bronze/20 bg-charcoal p-8 text-ivory/50">
              A rádio ainda não está disponível — estamos preparando esse espaço. Enquanto isso,
              ouça os episódios já publicados.
            </p>
          ) : (
            <RadioPlayer mode={config.mode} content={content} />
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function RadioPlayer({ mode, content }: { mode: string; content: Record<string, unknown> }) {
  if ((mode === "spotify" || mode === "external") && typeof content.embedUrl === "string") {
    const embedUrl = mode === "spotify" ? getSpotifyEmbedUrl(content.embedUrl) : content.embedUrl;
    if (embedUrl) {
      return (
        <iframe
          title="Rádio"
          src={embedUrl}
          width="100%"
          height="352"
          style={{ borderRadius: 12 }}
          frameBorder="0"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      );
    }
    return (
      <a
        href={content.embedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block rounded bg-terracotta px-7 py-3.5 text-sm font-medium text-ivory"
      >
        Ouvir agora
      </a>
    );
  }

  if (mode === "own_audio" && typeof content.audioUrl === "string") {
    return <audio controls src={content.audioUrl} className="w-full" />;
  }

  if (mode === "editorial_playlist" && Array.isArray(content.items) && content.items.length > 0) {
    return (
      <ul className="space-y-2 text-left">
        {(content.items as PlaylistItem[]).map((item) => (
          <li key={item.url}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="content-card block p-4 text-ivory hover:text-terracotta"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p className="rounded-lg border border-bronze/20 bg-charcoal p-8 text-ivory/50">
      Conteúdo da rádio ainda não configurado.
    </p>
  );
}
