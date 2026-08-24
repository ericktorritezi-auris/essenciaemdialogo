import { getPublishedNewsList, getMediaUrlMap } from "@/lib/public/home-data";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

export const dynamic = "force-dynamic";

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
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl text-ivory">Notícias</h1>

        {news.length === 0 && <p className="mt-8 text-ivory/50">Nenhuma notícia publicada ainda.</p>}

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((item: NewsListItem) => {
            const coverUrl = item.coverMediaId ? mediaMap.get(item.coverMediaId) : null;
            return (
              <a
                key={item.id}
                href={`/noticias/${item.slug}`}
                className="block overflow-hidden rounded border border-bronze/20 bg-charcoal"
              >
                <div className="aspect-video bg-petrol">
                  {coverUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm text-ivory">{item.title}</p>
                  {item.summary && <p className="mt-1 line-clamp-2 text-xs text-ivory/50">{item.summary}</p>}
                </div>
              </a>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
