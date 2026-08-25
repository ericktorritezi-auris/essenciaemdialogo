"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api-client/fetch";
import { StatusBadge } from "@/components/admin/status-badge";
import { MediaPicker } from "@/components/admin/media-picker";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

interface Article {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  summary: string | null;
  content: string;
  coverMediaId: string | null;
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

export function ArticleEditor({ articleId }: { articleId?: string }) {
  const router = useRouter();
  const isNew = !articleId;

  const [article, setArticle] = useState<Article | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [coverMediaId, setCoverMediaId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ role: Role }>("/api/admin/me").then((data) => setRole(data.role)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!articleId) return;
    apiFetch<{ article: Article }>(`/api/admin/articles/${articleId}`)
      .then((data) => {
        setArticle(data.article);
        setTitle(data.article.title);
        setSubtitle(data.article.subtitle ?? "");
        setSummary(data.article.summary ?? "");
        setContent(data.article.content);
        setCoverMediaId(data.article.coverMediaId);
      })
      .catch((err) => setError(err.message));
  }, [articleId]);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isNew) {
        const data = await apiFetch<{ article: Article }>("/api/admin/articles", {
          method: "POST",
          body: JSON.stringify({ title, subtitle, summary, content }),
        });
        router.push(`/admin/articles/${data.article.id}`);
      } else {
        const data = await apiFetch<{ article: Article }>(`/api/admin/articles/${articleId}`, {
          method: "PATCH",
          body: JSON.stringify({ title, subtitle, summary, content, coverMediaId }),
        });
        setArticle(data.article);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTransition(to: string) {
    if (!articleId) return;
    setSaving(true);
    setError(null);
    try {
      const data = await apiFetch<{ article: Article }>(`/api/admin/articles/${articleId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: to }),
      });
      setArticle(data.article);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao mudar status.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!articleId || !article) return;
    if (!confirm(`Excluir "${article.title}"? Esta ação não pode ser desfeita pela interface.`)) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/articles/${articleId}`, { method: "DELETE" });
      router.push("/admin/articles");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao excluir.");
      setSaving(false);
    }
  }

  const transitions = article && role ? getAvailableTransitions(article.status, role) : [];

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">{isNew ? "Novo artigo" : "Editar artigo"}</h1>
        {article && <StatusBadge status={article.status} />}
      </div>

      {error && <p className="mt-4 text-terracotta">{error}</p>}

      <form onSubmit={handleSave} className="mt-6 space-y-4">
        <label className="block text-sm text-ivory/80">
          Título
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory"
          />
        </label>

        <label className="block text-sm text-ivory/80">
          Subtítulo
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory"
          />
        </label>

        <label className="block text-sm text-ivory/80">
          Resumo
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory"
          />
        </label>

        <div>
          <p className="block text-sm text-ivory/80">Conteúdo</p>
          <div className="mt-1">
            <RichTextEditor value={content} onChange={setContent} />
          </div>
        </div>

        {!isNew && <MediaPicker value={coverMediaId} onChange={setCoverMediaId} />}

        <button
          type="submit"
          disabled={saving}
          className="rounded bg-terracotta px-4 py-2 text-sm font-medium text-ivory disabled:opacity-60"
        >
          {saving ? "Salvando…" : "Salvar"}
        </button>
      </form>

      {transitions.length > 0 && (
        <div className="mt-6 flex gap-2 border-t border-bronze/20 pt-6">
          {transitions.map((t) => (
            <button
              key={t.to}
              type="button"
              disabled={saving}
              onClick={() => handleTransition(t.to)}
              className="rounded border border-bronze/30 px-4 py-2 text-sm text-ivory/90 hover:border-terracotta hover:text-terracotta disabled:opacity-60"
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {!isNew && article && (
        <div className="mt-6 border-t border-bronze/20 pt-6">
          <button
            type="button"
            disabled={saving}
            onClick={handleDelete}
            className="text-sm text-terracotta hover:underline disabled:opacity-60"
          >
            Excluir artigo
          </button>
        </div>
      )}
    </main>
  );
}
