import { getPublishedArticles, getMediaUrlMap } from "@/lib/public/home-data";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

export const dynamic = "force-dynamic";

interface ArticleListItem {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  coverMediaId: string | null;
}

export default async function ArticlesPage() {
  const articles: ArticleListItem[] = await getPublishedArticles();
  const mediaMap = await getMediaUrlMap(articles.map((a: ArticleListItem) => a.coverMediaId));

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl text-ivory">Artigos</h1>

        {articles.length === 0 && (
          <p className="mt-8 text-ivory/50">Nenhum artigo publicado ainda.</p>
        )}

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article: ArticleListItem) => {
            const coverUrl = article.coverMediaId ? mediaMap.get(article.coverMediaId) : null;
            return (
              <a
                key={article.id}
                href={`/artigos/${article.slug}`}
                className="block overflow-hidden rounded border border-bronze/20 bg-charcoal"
              >
                <div className="aspect-video bg-petrol">
                  {coverUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm text-ivory">{article.title}</p>
                  {article.summary && (
                    <p className="mt-1 line-clamp-2 text-xs text-ivory/50">{article.summary}</p>
                  )}
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
