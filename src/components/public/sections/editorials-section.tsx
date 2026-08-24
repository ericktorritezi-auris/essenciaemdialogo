import { getFeaturedArticles, getMediaUrlMap } from "@/lib/public/home-data";

interface EditorialsSectionProps {
  content: Record<string, unknown>;
}

export async function EditorialsSection({ content }: EditorialsSectionProps) {
  const title = typeof content.title === "string" ? content.title : "Editoriais";
  const articles = await getFeaturedArticles();

  if (articles.length === 0) return null; // some se não houver artigos publicados ainda

  type ArticleItem = { id: string; slug: string; title: string; summary: string | null; coverMediaId: string | null };

  const mediaMap = await getMediaUrlMap(articles.map((a: ArticleItem) => a.coverMediaId));

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="font-display text-2xl text-ivory">{title}</h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {articles.map((article: ArticleItem) => {
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
    </section>
  );
}
