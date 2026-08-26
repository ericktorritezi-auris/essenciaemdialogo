import type { Metadata } from "next";
import { getPublishedArticles, getMediaUrlMap } from "@/lib/public/home-data";
import { buildMetadata } from "@/lib/public/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Artigos",
  description: "Reflexões escritas sobre autoconhecimento, emoções e relacionamentos.",
  path: "/artigos",
});

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
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h1 className="font-display text-3xl text-ivory sm:text-4xl">Artigos</h1>
        <p className="mt-3 max-w-lg text-ivory/60">
          Reflexões escritas sobre autoconhecimento, emoções e relacionamentos.
        </p>

        {articles.length === 0 && (
          <p className="mt-12 text-ivory/50">Nenhum artigo publicado ainda.</p>
        )}

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article: ArticleListItem) => {
            const coverUrl = article.coverMediaId ? mediaMap.get(article.coverMediaId) : null;
            return (
              <a key={article.id} href={`/artigos/${article.slug}`} className="content-card">
                <div className="aspect-video bg-petrol">
                  {coverUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverUrl} alt="" className="h-full w-full object-cover"  loading="lazy" />
                  )}
                </div>
                <div className="p-5">
                  <p className="font-display text-base text-ivory">{article.title}</p>
                  {article.summary && (
                    <p className="mt-2 line-clamp-2 text-sm text-ivory/50">{article.summary}</p>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </main>
  );
}
