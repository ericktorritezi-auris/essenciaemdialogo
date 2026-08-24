import { notFound } from "next/navigation";
import { getArticleBySlug, getRelatedArticles, getMediaUrlMap } from "@/lib/public/home-data";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

export const dynamic = "force-dynamic";

interface ArticlePageProps {
  params: { slug: string };
}

interface RelatedItem {
  id: string;
  slug: string;
  title: string;
  coverMediaId: string | null;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const related: RelatedItem[] = await getRelatedArticles(article.id);
  const mediaMap = await getMediaUrlMap([article.coverMediaId, ...related.map((r: RelatedItem) => r.coverMediaId)]);
  const coverUrl = article.coverMediaId ? mediaMap.get(article.coverMediaId) : null;

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        {coverUrl && (
          <div className="aspect-video w-full overflow-hidden rounded bg-petrol">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}

        <h1 className="mt-6 font-display text-2xl text-ivory sm:text-3xl">{article.title}</h1>
        {article.subtitle && <p className="mt-2 text-lg text-bronze">{article.subtitle}</p>}
        <p className="mt-2 text-xs text-ivory/40">
          Por {article.author.name}
          {article.publishedAt &&
            ` · ${article.publishedAt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}`}
        </p>

        <div
          className="mt-8 space-y-4 text-ivory/80 [&_a]:text-terracotta [&_h2]:font-display [&_h2]:text-xl [&_h2]:text-ivory [&_h3]:font-display [&_h3]:text-lg [&_h3]:text-ivory [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-bronze [&_blockquote]:pl-4 [&_blockquote]:italic [&_img]:rounded"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {related.length > 0 && (
          <div className="mt-12 border-t border-bronze/20 pt-8">
            <h2 className="font-display text-xl text-ivory">Leia também</h2>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {related.map((r: RelatedItem) => {
                const relCover = r.coverMediaId ? mediaMap.get(r.coverMediaId) : null;
                return (
                  <a key={r.id} href={`/artigos/${r.slug}`} className="block">
                    <div className="aspect-video overflow-hidden rounded bg-petrol">
                      {relCover && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={relCover} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <p className="mt-2 text-xs text-ivory/70">{r.title}</p>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
