import type { Metadata } from "next";
import { getPublishedNewsList, getMediaUrlMap } from "@/lib/public/home-data";
import { buildMetadata } from "@/lib/public/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Notícias",
  description: "Acompanhamentos e coberturas relacionadas aos temas do podcast Essência em Diálogo.",
  path: "/noticias",
});

interface NewsListItem {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  coverMediaId: string | null;
}

export default async function NewsPage() {
  const news: NewsListItem[] = await getPublishedNewsList();
  const mediaMap = await getMediaUrlMap(news.map((n: NewsListItem) => n.coverMediaId));

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h1 className="font-display text-3xl text-ivory sm:text-4xl">Notícias</h1>
        <p className="mt-3 max-w-lg text-ivory/60">
          Acompanhamentos e coberturas relacionadas aos temas do podcast.
        </p>

        {news.length === 0 && <p className="mt-12 text-ivory/50">Nenhuma notícia publicada ainda.</p>}

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((item: NewsListItem) => {
            const coverUrl = item.coverMediaId ? mediaMap.get(item.coverMediaId) : null;
            return (
              <a key={item.id} href={`/noticias/${item.slug}`} className="content-card">
                <div className="aspect-video bg-petrol">
                  {coverUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverUrl} alt="" className="h-full w-full object-cover"  loading="lazy" />
                  )}
                </div>
                <div className="p-5">
                  <p className="font-display text-base text-ivory">{item.title}</p>
                  {item.summary && <p className="mt-2 line-clamp-2 text-sm text-ivory/50">{item.summary}</p>}
                </div>
              </a>
            );
          })}
        </div>
      </main>
  );
}
