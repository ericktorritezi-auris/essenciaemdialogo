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
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <h2 className="font-display text-2xl text-ivory sm:text-3xl">{title}</h2>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {articles.map((article: ArticleItem) => {
          const coverUrl = article.coverMediaId ? mediaMap.get(article.coverMediaId) : null;
          return (
            <a key={article.id} href={`/artigos/${article.slug}`} className="content-card">
              <div className="aspect-video bg-petrol">
                {coverUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverUrl} alt="" className="h-full w-full object-cover" />
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
    </section>
  );
}
