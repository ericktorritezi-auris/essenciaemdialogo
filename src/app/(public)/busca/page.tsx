import type { Metadata } from "next";
import { searchContent, getSearchResultHref } from "@/lib/public/search";
import { buildMetadata } from "@/lib/public/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Buscar",
  path: "/busca",
  noIndex: true,
});

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
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
        <h1 className="font-display text-3xl text-ivory sm:text-4xl">Buscar</h1>

        <form method="GET" className="mt-7">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Buscar episódios, artigos, notícias, eventos…"
            className="w-full rounded-lg border border-bronze/30 bg-charcoal px-4 py-3.5 text-ivory placeholder:text-ivory/30"
            autoFocus
          />
        </form>

        {query.trim().length >= 2 && (
          <p className="mt-5 text-sm text-ivory/50">
            {results.length} resultado(s) para &quot;{query}&quot;
          </p>
        )}

        {query.trim().length > 0 && query.trim().length < 2 && (
          <p className="mt-5 text-sm text-ivory/50">Digite pelo menos 2 caracteres.</p>
        )}

        <div className="mt-6 space-y-3">
          {results.map((item) => (
            <a key={`${item.kind}-${item.id}`} href={getSearchResultHref(item)} className="content-card block p-5">
              <span className="text-xs uppercase tracking-wide text-bronze">{KIND_LABELS[item.kind]}</span>
              <p className="mt-1.5 text-ivory">{item.title}</p>
              {item.snippet && <p className="mt-1 text-sm text-ivory/50">{item.snippet}</p>}
            </a>
          ))}
        </div>
      </main>
  );
}
