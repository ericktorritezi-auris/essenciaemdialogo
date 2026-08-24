"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api-client/fetch";

interface Platform {
  id: string;
  key: string;
  name: string;
  active: boolean;
  order: number;
}

export default function AdminPlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newKey, setNewKey] = useState("");
  const [newName, setNewName] = useState("");

  function load() {
    apiFetch<{ platforms: Platform[] }>("/api/admin/platforms")
      .then((data) => setPlatforms(data.platforms))
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function toggleActive(platform: Platform) {
    try {
      await apiFetch(`/api/admin/platforms/${platform.id}`, {
        method: "PATCH",
        body: JSON.stringify({ active: !platform.active }),
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao atualizar.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover esta plataforma?")) return;
    try {
      await apiFetch(`/api/admin/platforms/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao remover.");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiFetch("/api/admin/platforms", {
        method: "POST",
        body: JSON.stringify({ key: newKey, name: newName }),
      });
      setNewKey("");
      setNewName("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao criar plataforma.");
    }
  }

  return (
    <main className="p-8">
      <h1 className="font-display text-2xl">Plataformas</h1>
      <p className="mt-2 text-sm text-ivory/50">
        Ative as plataformas onde o podcast está disponível — só as ativas aparecem para
        vincular episódios e na seção &quot;Ouça também em&quot; da Home.
      </p>

      {error && <p className="mt-4 text-terracotta">{error}</p>}

      <form onSubmit={handleCreate} className="mt-6 flex flex-wrap gap-2">
        <input
          required
          placeholder="chave (ex: deezer)"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="rounded border border-bronze/30 bg-charcoal px-3 py-2 text-sm text-ivory"
        />
        <input
          required
          placeholder="Nome (ex: Deezer)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="rounded border border-bronze/30 bg-charcoal px-3 py-2 text-sm text-ivory"
        />
        <button type="submit" className="rounded bg-terracotta px-4 py-2 text-sm text-ivory">
          Adicionar
        </button>
      </form>

      {!platforms && !error && <p className="mt-8 text-ivory/50">Carregando…</p>}

      {platforms && platforms.length > 0 && (
        <div className="mt-6 space-y-2">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className="flex items-center justify-between rounded border border-bronze/20 bg-charcoal p-3"
            >
              <div>
                <p className="text-ivory">{platform.name}</p>
                <p className="text-xs text-ivory/40">{platform.key}</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-ivory/70">
                  <input type="checkbox" checked={platform.active} onChange={() => toggleActive(platform)} />
                  Ativa
                </label>
                <button type="button" onClick={() => handleDelete(platform.id)} className="text-sm text-terracotta">
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
