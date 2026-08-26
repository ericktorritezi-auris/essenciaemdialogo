"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api-client/fetch";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

interface LegalPage {
  id: string;
  key: string;
  title: string;
  content: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  updatedAt: string;
}

export default function AdminLegalPagesPage() {
  const [pages, setPages] = useState<LegalPage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { title: string; content: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [marking, setMarking] = useState<string | null>(null);

  function load() {
    apiFetch<{ pages: LegalPage[] }>("/api/admin/legal-pages")
      .then((data) => {
        setPages(data.pages);
        const initialDrafts: Record<string, { title: string; content: string }> = {};
        for (const page of data.pages) {
          initialDrafts[page.key] = { title: page.title, content: page.content };
        }
        setDrafts(initialDrafts);
      })
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleSave(key: string) {
    setSaving(key);
    setError(null);
    try {
      await apiFetch(`/api/admin/legal-pages/${key}`, {
        method: "PATCH",
        body: JSON.stringify(drafts[key]),
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(null);
    }
  }

  async function handleMarkReviewed(key: string) {
    setMarking(key);
    setError(null);
    try {
      await apiFetch(`/api/admin/legal-pages/${key}/mark-reviewed`, { method: "POST" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao marcar como revisado.");
    } finally {
      setMarking(null);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="font-display text-2xl">Páginas legais</h1>
      <p className="mt-2 text-sm text-ivory/50">
        Política de Privacidade e Termos de Uso, editáveis aqui. Enquanto uma página não for
        marcada como revisada, o aviso de minuta técnica continua aparecendo na versão pública.
      </p>

      {error && <p className="mt-4 text-terracotta">{error}</p>}
      {!pages && !error && <p className="mt-8 text-ivory/50">Carregando…</p>}

      {pages && pages.length > 0 && (
        <div className="mt-6 space-y-10">
          {pages.map((page) => {
            const draft = drafts[page.key] ?? { title: page.title, content: page.content };
            return (
              <section key={page.key} className="rounded border border-bronze/20 bg-charcoal p-6">
                <div className="flex items-center justify-between">
                  <label className="block flex-1 text-sm text-ivory/80">
                    Título
                    <input
                      value={draft.title}
                      onChange={(e) =>
                        setDrafts((prev) => ({ ...prev, [page.key]: { ...draft, title: e.target.value } }))
                      }
                      className="mt-1 w-full rounded border border-bronze/30 bg-warm-black px-3 py-2 text-ivory"
                    />
                  </label>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-ivory/80">Conteúdo</p>
                  <div className="mt-1">
                    <RichTextEditor
                      value={draft.content}
                      onChange={(html) => setDrafts((prev) => ({ ...prev, [page.key]: { ...draft, content: html } }))}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    {page.reviewedAt ? (
                      <p className="text-sm text-bronze">
                        Revisado em {new Date(page.reviewedAt).toLocaleDateString("pt-BR")}
                        {page.reviewedBy && ` por ${page.reviewedBy}`}
                      </p>
                    ) : (
                      <p className="text-sm text-terracotta">Ainda não revisado — aviso de minuta ativo no site</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={saving === page.key}
                      onClick={() => handleSave(page.key)}
                      className="rounded border border-bronze/30 px-4 py-2 text-sm text-ivory disabled:opacity-60"
                    >
                      {saving === page.key ? "Salvando…" : "Salvar texto"}
                    </button>
                    <button
                      type="button"
                      disabled={marking === page.key || !!page.reviewedAt}
                      onClick={() => handleMarkReviewed(page.key)}
                      className="rounded bg-terracotta px-4 py-2 text-sm text-ivory disabled:opacity-40"
                    >
                      {marking === page.key ? "Marcando…" : page.reviewedAt ? "Já revisado" : "Marcar como revisado (OK)"}
                    </button>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
