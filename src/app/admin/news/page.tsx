"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client/fetch";
import { StatusBadge } from "@/components/admin/status-badge";

interface NewsListItem {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
  author: { id: string; name: string };
}

export default function NewsListPage() {
  const [news, setNews] = useState<NewsListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ news: NewsListItem[] }>("/api/admin/news")
      .then((data) => setNews(data.news))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Notícias</h1>
        <Link href="/admin/news/new" className="rounded bg-terracotta px-4 py-2 text-sm font-medium text-ivory">
          Nova notícia
        </Link>
      </div>

      {error && <p className="mt-4 text-terracotta">{error}</p>}
      {!news && !error && <p className="mt-8 text-ivory/50">Carregando…</p>}
      {news && news.length === 0 && <p className="mt-8 text-ivory/50">Nenhuma notícia ainda.</p>}

      {news && news.length > 0 && (
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
            {news.map((item) => (
              <tr key={item.id} className="border-b border-bronze/10">
                <td className="py-3">
                  <Link href={`/admin/news/${item.id}`} className="hover:text-terracotta">
                    {item.title}
                  </Link>
                </td>
                <td className="py-3 text-ivory/70">{item.author?.name}</td>
                <td className="py-3"><StatusBadge status={item.status} /></td>
                <td className="py-3 text-ivory/50">{new Date(item.updatedAt).toLocaleDateString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
