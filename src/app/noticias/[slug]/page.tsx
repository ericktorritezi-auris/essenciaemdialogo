import { notFound } from "next/navigation";
import { getNewsBySlug, getMediaUrlMap } from "@/lib/public/home-data";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

export const dynamic = "force-dynamic";

interface NewsPageProps {
  params: { slug: string };
}

export default async function NewsDetailPage({ params }: NewsPageProps) {
  const news = await getNewsBySlug(params.slug);
  if (!news) notFound();

  const mediaMap = await getMediaUrlMap([news.coverMediaId]);
  const coverUrl = news.coverMediaId ? mediaMap.get(news.coverMediaId) : null;

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

        <h1 className="mt-6 font-display text-2xl text-ivory sm:text-3xl">{news.title}</h1>
        <p className="mt-2 text-xs text-ivory/40">
          Por {news.author.name}
          {news.publishedAt &&
            ` · ${news.publishedAt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}`}
        </p>

        <div
          className="mt-8 space-y-4 text-ivory/80 [&_a]:text-terracotta [&_h2]:font-display [&_h2]:text-xl [&_h2]:text-ivory [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />

        {news.sourceName && (
          <p className="mt-8 border-t border-bronze/20 pt-4 text-xs text-ivory/40">
            Fonte:{" "}
            {news.sourceUrl ? (
              <a href={news.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-terracotta">
                {news.sourceName}
              </a>
            ) : (
              news.sourceName
            )}
          </p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
