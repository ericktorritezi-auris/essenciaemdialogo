"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api-client/fetch";

interface NavItem {
  id: string;
  label: string;
  href: string;
  order: number;
  enabled: boolean;
  openInNewTab: boolean;
}

export default function AdminMenuPage() {
  const [items, setItems] = useState<NavItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newHref, setNewHref] = useState("");

  function load() {
    apiFetch<{ items: NavItem[] }>("/api/admin/navigation")
      .then((data) => setItems(data.items))
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function toggleEnabled(item: NavItem) {
    try {
      await apiFetch(`/api/admin/navigation/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ enabled: !item.enabled }),
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao atualizar.");
    }
  }

  async function move(item: NavItem, direction: "up" | "down") {
    if (!items) return;
    const sorted = [...items].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((i) => i.id === item.id);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= sorted.length) return;

    const other = sorted[swapWith];
    if (!other) return;
    try {
      await Promise.all([
        apiFetch(`/api/admin/navigation/${item.id}`, {
          method: "PATCH",
          body: JSON.stringify({ order: other.order }),
        }),
        apiFetch(`/api/admin/navigation/${other.id}`, {
          method: "PATCH",
          body: JSON.stringify({ order: item.order }),
        }),
      ]);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao reordenar.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este item do menu?")) return;
    try {
      await apiFetch(`/api/admin/navigation/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao remover.");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiFetch("/api/admin/navigation", {
        method: "POST",
        body: JSON.stringify({ label: newLabel, href: newHref }),
      });
      setNewLabel("");
      setNewHref("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao criar item.");
    }
  }

  const sorted = items ? [...items].sort((a, b) => a.order - b.order) : [];

  return (
    <main className="p-8">
      <h1 className="font-display text-2xl">Menu</h1>
      <p className="mt-2 text-sm text-ivory/50">
        Itens desabilitados não aparecem no header do site — útil para ligar cada seção
        (Episódios, Artigos...) só quando a página correspondente estiver pronta.
      </p>

      {error && <p className="mt-4 text-terracotta">{error}</p>}

      <form onSubmit={handleCreate} className="mt-6 flex flex-wrap gap-2">
        <input
          required
          placeholder="Rótulo"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          className="rounded border border-bronze/30 bg-charcoal px-3 py-2 text-sm text-ivory"
        />
        <input
          required
          placeholder="/destino"
          value={newHref}
          onChange={(e) => setNewHref(e.target.value)}
          className="rounded border border-bronze/30 bg-charcoal px-3 py-2 text-sm text-ivory"
        />
        <button type="submit" className="rounded bg-terracotta px-4 py-2 text-sm text-ivory">
          Adicionar
        </button>
      </form>

      {sorted.length > 0 && (
        <div className="mt-6 space-y-2">
          {sorted.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded border border-bronze/20 bg-charcoal p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => move(item, "up")}
                    className="text-xs text-ivory/50 disabled:opacity-20"
                    aria-label="Mover para cima"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    disabled={index === sorted.length - 1}
                    onClick={() => move(item, "down")}
                    className="text-xs text-ivory/50 disabled:opacity-20"
                    aria-label="Mover para baixo"
                  >
                    ▼
                  </button>
                </div>
                <div>
                  <p className="text-ivory">{item.label}</p>
                  <p className="text-xs text-ivory/40">{item.href}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-ivory/70">
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={() => toggleEnabled(item)}
                  />
                  Ativo
                </label>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="text-sm text-terracotta"
                >
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
