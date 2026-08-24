"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api-client/fetch";
import { HOME_SECTION_LABELS, type HomeSectionKey } from "@/lib/content/home-sections";

interface Section {
  id: string;
  key: HomeSectionKey;
  enabled: boolean;
  order: number;
  content: Record<string, unknown>;
}

export default function AdminHomePage() {
  const [sections, setSections] = useState<Section[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingJson, setEditingJson] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    apiFetch<{ sections: Section[] }>("/api/admin/home-sections")
      .then((data) => setSections(data.sections))
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function toggleEnabled(section: Section) {
    try {
      await apiFetch(`/api/admin/home-sections/${section.key}`, {
        method: "PATCH",
        body: JSON.stringify({ enabled: !section.enabled }),
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao atualizar.");
    }
  }

  async function move(section: Section, direction: "up" | "down") {
    if (!sections) return;
    const sorted = [...sections].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((s) => s.id === section.id);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= sorted.length) return;

    const other = sorted[swapWith];
    if (!other) return;
    try {
      await Promise.all([
        apiFetch(`/api/admin/home-sections/${section.key}`, {
          method: "PATCH",
          body: JSON.stringify({ order: other.order }),
        }),
        apiFetch(`/api/admin/home-sections/${other.key}`, {
          method: "PATCH",
          body: JSON.stringify({ order: section.order }),
        }),
      ]);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao reordenar.");
    }
  }

  function startEditing(section: Section) {
    setEditingKey(section.key);
    setEditingJson(JSON.stringify(section.content, null, 2));
  }

  async function saveContent(key: string) {
    setSaving(true);
    setError(null);
    try {
      const parsed = JSON.parse(editingJson);
      await apiFetch(`/api/admin/home-sections/${key}`, {
        method: "PATCH",
        body: JSON.stringify({ content: parsed }),
      });
      setEditingKey(null);
      load();
    } catch (err) {
      setError(
        err instanceof SyntaxError
          ? "JSON inválido — confira a formatação."
          : err instanceof ApiError
            ? err.message
            : "Erro ao salvar.",
      );
    } finally {
      setSaving(false);
    }
  }

  const sorted = sections ? [...sections].sort((a, b) => a.order - b.order) : [];

  return (
    <main className="p-8">
      <h1 className="font-display text-2xl">Seções da Home</h1>
      <p className="mt-2 text-sm text-ivory/50">
        Ative, ordene e edite o texto de cada seção. Nada aqui é hardcoded — o que estiver
        desabilitado simplesmente não aparece no site.
      </p>

      {error && <p className="mt-4 text-terracotta">{error}</p>}
      {!sections && !error && <p className="mt-8 text-ivory/50">Carregando…</p>}

      {sorted.length > 0 && (
        <div className="mt-6 space-y-2">
          {sorted.map((section, index) => (
            <div key={section.id} className="rounded border border-bronze/20 bg-charcoal p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => move(section, "up")}
                      className="text-xs text-ivory/50 disabled:opacity-20"
                      aria-label="Mover para cima"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={index === sorted.length - 1}
                      onClick={() => move(section, "down")}
                      className="text-xs text-ivory/50 disabled:opacity-20"
                      aria-label="Mover para baixo"
                    >
                      ▼
                    </button>
                  </div>
                  <span className="text-ivory">{HOME_SECTION_LABELS[section.key]}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => startEditing(section)}
                    className="text-sm text-bronze hover:text-terracotta"
                  >
                    Editar texto
                  </button>
                  <label className="flex items-center gap-2 text-sm text-ivory/70">
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      onChange={() => toggleEnabled(section)}
                    />
                    Ativa
                  </label>
                </div>
              </div>

              {editingKey === section.key && (
                <div className="mt-4">
                  <textarea
                    value={editingJson}
                    onChange={(e) => setEditingJson(e.target.value)}
                    rows={10}
                    className="w-full rounded border border-bronze/30 bg-warm-black px-3 py-2 font-mono text-xs text-ivory"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => saveContent(section.key)}
                      className="rounded bg-terracotta px-4 py-1.5 text-sm text-ivory disabled:opacity-60"
                    >
                      {saving ? "Salvando…" : "Salvar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingKey(null)}
                      className="rounded border border-bronze/30 px-4 py-1.5 text-sm text-ivory/70"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
