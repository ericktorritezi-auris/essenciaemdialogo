"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api-client/fetch";
import { StatusBadge } from "@/components/admin/status-badge";
import { MediaPicker } from "@/components/admin/media-picker";

interface News {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  coverMediaId: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  status: string;
  authorId: string;
}

type Role = "ADMIN" | "COLLABORATOR";

function getAvailableTransitions(status: string, role: Role): { to: string; label: string }[] {
  const collaboratorTransitions: Record<string, { to: string; label: string }[]> = {
    DRAFT: [{ to: "IN_REVIEW", label: "Enviar para revisão" }],
    IN_REVIEW: [{ to: "DRAFT", label: "Devolver para rascunho" }],
  };
  const adminOnlyExtra: Record<string, { to: string; label: string }[]> = {
    DRAFT: [{ to: "PUBLISHED", label: "Publicar" }],
    IN_REVIEW: [{ to: "PUBLISHED", label: "Publicar" }],
    PUBLISHED: [{ to: "PAUSED", label: "Pausar" }],
    PAUSED: [{ to: "PUBLISHED", label: "Republicar" }],
  };
  const base = collaboratorTransitions[status] ?? [];
  return role === "ADMIN" ? [...base, ...(adminOnlyExtra[status] ?? [])] : base;
}

export function NewsEditor({ newsId }: { newsId?: string }) {
  const router = useRouter();
  const isNew = !newsId;

  const [news, setNews] = useState<News | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [coverMediaId, setCoverMediaId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ role: Role }>("/api/admin/me").then((data) => setRole(data.role)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!newsId) return;
    apiFetch<{ news: News }>(`/api/admin/news/${newsId}`)
      .then((data) => {
        setNews(data.news);
        setTitle(data.news.title);
        setSummary(data.news.summary ?? "");
        setContent(data.news.content);
        setSourceName(data.news.sourceName ?? "");
        setSourceUrl(data.news.sourceUrl ?? "");
        setCoverMediaId(data.news.coverMediaId);
      })
      .catch((err) => setError(err.message));
  }, [newsId]);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        const data = await apiFetch<{ news: News }>("/api/admin/news", {
          method: "POST",
          body: JSON.stringify({ title, summary, content, sourceName, sourceUrl: sourceUrl || undefined }),
        });
        router.push(`/admin/news/${data.news.id}`);
      } else {
        const data = await apiFetch<{ news: News }>(`/api/admin/news/${newsId}`, {
          method: "PATCH",
          body: JSON.stringify({ title, summary, content, sourceName, sourceUrl: sourceUrl || null, coverMediaId }),
        });
        setNews(data.news);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTransition(to: string) {
    if (!newsId) return;
    setSaving(true);
    setError(null);
    try {
      const data = await apiFetch<{ news: News }>(`/api/admin/news/${newsId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: to }),
      });
      setNews(data.news);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao mudar status.");
    } finally {
      setSaving(false);
    }
  }

  const transitions = news && role ? getAvailableTransitions(news.status, role) : [];

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">{isNew ? "Nova notícia" : "Editar notícia"}</h1>
        {news && <StatusBadge status={news.status} />}
      </div>

      {error && <p className="mt-4 text-terracotta">{error}</p>}

      <form onSubmit={handleSave} className="mt-6 space-y-4">
        <label className="block text-sm text-ivory/80">
          Título
          <input required value={title} onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory" />
        </label>

        <label className="block text-sm text-ivory/80">
          Resumo
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2}
            className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory" />
        </label>

        <label className="block text-sm text-ivory/80">
          Conteúdo
          <textarea required value={content} onChange={(e) => setContent(e.target.value)} rows={12}
            className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory font-mono text-sm" />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm text-ivory/80">
            Fonte (nome)
            <input value={sourceName} onChange={(e) => setSourceName(e.target.value)}
              className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory" />
          </label>
          <label className="block text-sm text-ivory/80">
            Fonte (URL)
            <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} type="url"
              className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory" />
          </label>
        </div>

        {!isNew && <MediaPicker value={coverMediaId} onChange={setCoverMediaId} />}

        <button type="submit" disabled={saving}
          className="rounded bg-terracotta px-4 py-2 text-sm font-medium text-ivory disabled:opacity-60">
          {saving ? "Salvando…" : "Salvar"}
        </button>
      </form>

      {transitions.length > 0 && (
        <div className="mt-6 flex gap-2 border-t border-bronze/20 pt-6">
          {transitions.map((t) => (
            <button key={t.to} type="button" disabled={saving} onClick={() => handleTransition(t.to)}
              className="rounded border border-bronze/30 px-4 py-2 text-sm text-ivory/90 hover:border-terracotta hover:text-terracotta disabled:opacity-60">
              {t.label}
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
