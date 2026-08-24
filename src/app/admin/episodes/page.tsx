"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client/fetch";
import { StatusBadge } from "@/components/admin/status-badge";

interface EpisodeListItem {
  id: string;
  title: string;
  season: number | null;
  number: number | null;
  status: string;
  updatedAt: string;
}

export default function EpisodesListPage() {
  const [episodes, setEpisodes] = useState<EpisodeListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ episodes: EpisodeListItem[] }>("/api/admin/episodes")
      .then((data) => setEpisodes(data.episodes))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Episódios</h1>
        <Link href="/admin/episodes/new" className="rounded bg-terracotta px-4 py-2 text-sm font-medium text-ivory">
          Novo episódio
        </Link>
      </div>

      {error && <p className="mt-4 text-terracotta">{error}</p>}
      {!episodes && !error && <p className="mt-8 text-ivory/50">Carregando…</p>}
      {episodes && episodes.length === 0 && <p className="mt-8 text-ivory/50">Nenhum episódio ainda.</p>}

      {episodes && episodes.length > 0 && (
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-bronze/20 text-ivory/50">
              <th className="py-2 font-normal">Título</th>
              <th className="py-2 font-normal">Temp./Núm.</th>
              <th className="py-2 font-normal">Status</th>
              <th className="py-2 font-normal">Atualizado</th>
            </tr>
          </thead>
          <tbody>
            {episodes.map((episode) => (
              <tr key={episode.id} className="border-b border-bronze/10">
                <td className="py-3">
                  <Link href={`/admin/episodes/${episode.id}`} className="hover:text-terracotta">
                    {episode.title}
                  </Link>
                </td>
                <td className="py-3 text-ivory/70">
                  {episode.season ? `T${episode.season}` : ""} {episode.number ? `#${episode.number}` : "—"}
                </td>
                <td className="py-3"><StatusBadge status={episode.status} /></td>
                <td className="py-3 text-ivory/50">{new Date(episode.updatedAt).toLocaleDateString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
