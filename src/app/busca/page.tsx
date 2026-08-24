import { searchContent, getSearchResultHref } from "@/lib/public/search";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

export const dynamic = "force-dynamic";

const KIND_LABELS: Record<string, string> = {
  EPISODE: "Episódio",
  ARTICLE: "Artigo",
  NEWS: "Notícia",
  EVENT: "Evento",
};

interface SearchPageProps {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q ?? "";
  const results = query.trim().length >= 2 ? await searchContent(query) : [];

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl text-ivory">Buscar</h1>

        <form method="GET" className="mt-6">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Buscar episódios, artigos, notícias, eventos…"
            className="w-full rounded border border-bronze/30 bg-charcoal px-4 py-3 text-ivory"
            autoFocus
          />
        </form>

        {query.trim().length >= 2 && (
          <p className="mt-4 text-sm text-ivory/50">
            {results.length} resultado(s) para &quot;{query}&quot;
          </p>
        )}

        {query.trim().length > 0 && query.trim().length < 2 && (
          <p className="mt-4 text-sm text-ivory/50">Digite pelo menos 2 caracteres.</p>
        )}

        <div className="mt-6 space-y-4">
          {results.map((item) => (
            <a
              key={`${item.kind}-${item.id}`}
              href={getSearchResultHref(item)}
              className="block rounded border border-bronze/20 bg-charcoal p-4 hover:border-terracotta"
            >
              <span className="text-xs uppercase tracking-wide text-bronze">{KIND_LABELS[item.kind]}</span>
              <p className="mt-1 text-ivory">{item.title}</p>
              {item.snippet && <p className="mt-1 text-sm text-ivory/50">{item.snippet}</p>}
            </a>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
