"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client/fetch";
import { StatusBadge } from "@/components/admin/status-badge";

interface ArticleListItem {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
  author: { id: string; name: string };
}

export default function ArticlesListPage() {
  const [articles, setArticles] = useState<ArticleListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ articles: ArticleListItem[] }>("/api/admin/articles")
      .then((data) => setArticles(data.articles))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Artigos</h1>
        <Link
          href="/admin/articles/new"
          className="rounded bg-terracotta px-4 py-2 text-sm font-medium text-ivory"
        >
          Novo artigo
        </Link>
      </div>

      {error && <p className="mt-4 text-terracotta">{error}</p>}

      {!articles && !error && <p className="mt-8 text-ivory/50">Carregando…</p>}

      {articles && articles.length === 0 && (
        <p className="mt-8 text-ivory/50">Nenhum artigo ainda.</p>
      )}

      {articles && articles.length > 0 && (
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-bronze/20 text-ivory/50">
              <th className="py-2 font-normal">Título</th>
              <th className="py-2 font-normal">Autor</th>
              <th className="py-2 font-normal">Status</th>
              <th className="py-2 font-normal">Atualizado</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-b border-bronze/10">
                <td className="py-3">
                  <Link href={`/admin/articles/${article.id}`} className="hover:text-terracotta">
                    {article.title}
                  </Link>
                </td>
                <td className="py-3 text-ivory/70">{article.author?.name}</td>
                <td className="py-3">
                  <StatusBadge status={article.status} />
                </td>
                <td className="py-3 text-ivory/50">
                  {new Date(article.updatedAt).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
