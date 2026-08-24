import { getLatestReleases, getMediaUrlMap } from "@/lib/public/home-data";

const KIND_LABELS: Record<string, string> = {
  ARTICLE: "Artigo",
  NEWS: "Notícia",
  EVENT: "Evento",
};

const KIND_HREF_PREFIX: Record<string, string> = {
  ARTICLE: "/artigos",
  NEWS: "/noticias",
  EVENT: "/eventos",
};

export async function LatestReleasesSection() {
  const items = await getLatestReleases();

  // Seção inteira some se não houver nada publicado na semana editorial
  // corrente — nunca renderiza um bloco vazio (Seção 11 do Prompt Mestre).
  if (items.length === 0) return null;

  const mediaMap = await getMediaUrlMap(items.map((i) => i.coverMediaId));

  return (
    <section id="ultimos-lancamentos" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-ivory">Últimos Lançamentos</h2>
        <span className="text-xs text-ivory/40">Esta semana</span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const coverUrl = item.coverMediaId ? mediaMap.get(item.coverMediaId) : null;
          return (
            <a
              key={`${item.kind}-${item.id}`}
              href={`${KIND_HREF_PREFIX[item.kind]}/${item.slug}`}
              className="block overflow-hidden rounded border border-bronze/20 bg-charcoal"
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
                <p className="mt-1 text-sm text-ivory">{item.title}</p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
