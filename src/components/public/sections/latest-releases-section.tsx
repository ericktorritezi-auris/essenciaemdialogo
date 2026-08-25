import { getLatestReleases, getMediaUrlMap, type LatestReleaseItem } from "@/lib/public/home-data";

const KIND_LABELS: Record<string, string> = {
  EPISODE: "Episódio",
  ARTICLE: "Artigo",
  NEWS: "Notícia",
  EVENT: "Evento",
};

const KIND_HREF_PREFIX: Record<string, string> = {
  EPISODE: "/episodios",
  ARTICLE: "/artigos",
  NEWS: "/noticias",
  EVENT: "/eventos",
};

export async function LatestReleasesSection() {
  const items = await getLatestReleases();

  // Seção inteira some se não houver nada publicado na semana editorial
  // corrente — nunca renderiza um bloco vazio (Seção 11 do Prompt Mestre).
  if (items.length === 0) return null;

  const mediaMap = await getMediaUrlMap(items.map((i: LatestReleaseItem) => i.coverMediaId));

  return (
    <section id="ultimos-lancamentos" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl text-ivory sm:text-3xl">Últimos Lançamentos</h2>
        <span className="text-xs uppercase tracking-wide text-ivory/40">Esta semana</span>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item: LatestReleaseItem) => {
          const coverUrl = item.coverMediaId ? mediaMap.get(item.coverMediaId) : null;
          return (
            <a
              key={`${item.kind}-${item.id}`}
              href={`${KIND_HREF_PREFIX[item.kind]}/${item.slug}`}
              className="content-card"
            >
              <div className="aspect-video bg-petrol">
                {coverUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverUrl} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="p-4">
                <span className="text-xs uppercase tracking-wide text-bronze">
                  {KIND_LABELS[item.kind]}
                </span>
                <p className="mt-1.5 text-sm leading-snug text-ivory">{item.title}</p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
