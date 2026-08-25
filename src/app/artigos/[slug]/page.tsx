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
      <main id="main-content" className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
        {coverUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-petrol shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}

        <h1 className="mt-7 font-display text-3xl leading-tight text-ivory sm:text-4xl">{article.title}</h1>
        {article.subtitle && <p className="mt-3 text-lg leading-relaxed text-bronze">{article.subtitle}</p>}
        <p className="mt-3 text-xs uppercase tracking-wide text-ivory/40">
          Por {article.author.name}
          {article.publishedAt &&
            ` · ${article.publishedAt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}`}
        </p>

        <div
          className="mt-10 space-y-4 text-[1.05rem] leading-relaxed text-ivory/80 [&_a]:text-terracotta [&_h2]:font-display [&_h2]:text-xl [&_h2]:text-ivory [&_h3]:font-display [&_h3]:text-lg [&_h3]:text-ivory [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-bronze [&_blockquote]:pl-4 [&_blockquote]:italic [&_img]:rounded-lg"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {related.length > 0 && (
          <div className="mt-14 border-t border-bronze/15 pt-10">
            <h2 className="font-display text-xl text-ivory">Leia também</h2>
            <div className="mt-5 grid grid-cols-3 gap-4">
              {related.map((r: RelatedItem) => {
                const relCover = r.coverMediaId ? mediaMap.get(r.coverMediaId) : null;
                return (
                  <a key={r.id} href={`/artigos/${r.slug}`} className="content-card">
                    <div className="aspect-video bg-petrol">
                      {relCover && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={relCover} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <p className="p-2.5 text-xs leading-snug text-ivory">{r.title}</p>
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
