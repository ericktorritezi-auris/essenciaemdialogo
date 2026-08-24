"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api-client/fetch";

type Mode = "spotify" | "external" | "own_audio" | "editorial_playlist";

interface PlaylistItem {
  title: string;
  url: string;
}

interface RadioConfig {
  id: string;
  enabled: boolean;
  mode: Mode;
  title: string | null;
  description: string | null;
  content: Record<string, unknown> | null;
}

const MODE_LABELS: Record<Mode, string> = {
  spotify: "Spotify (embed de playlist/show)",
  external: "Conteúdo externo (iframe)",
  own_audio: "Áudio próprio (URL de arquivo)",
  editorial_playlist: "Playlist editorial (lista de links)",
};

export default function AdminRadioPage() {
  const [config, setConfig] = useState<RadioConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>("spotify");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);

  useEffect(() => {
    apiFetch<{ config: RadioConfig }>("/api/admin/radio")
      .then((data) => {
        setConfig(data.config);
        setEnabled(data.config.enabled);
        setMode(data.config.mode);
        setTitle(data.config.title ?? "");
        setDescription(data.config.description ?? "");
        const content = data.config.content ?? {};
        setEmbedUrl(typeof content.embedUrl === "string" ? content.embedUrl : "");
        setAudioUrl(typeof content.audioUrl === "string" ? content.audioUrl : "");
        setPlaylist(Array.isArray(content.items) ? (content.items as PlaylistItem[]) : []);
      })
      .catch((err) => setError(err.message));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const content: Record<string, unknown> =
      mode === "spotify" || mode === "external"
        ? { embedUrl }
        : mode === "own_audio"
          ? { audioUrl }
          : { items: playlist.filter((p) => p.title && p.url) };

    try {
      const data = await apiFetch<{ config: RadioConfig }>("/api/admin/radio", {
        method: "PATCH",
        body: JSON.stringify({ enabled, mode, title: title || null, description: description || null, content }),
      });
      setConfig(data.config);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  function addPlaylistItem() {
    setPlaylist((prev) => [...prev, { title: "", url: "" }]);
  }

  function updatePlaylistItem(index: number, field: "title" | "url", value: string) {
    setPlaylist((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function removePlaylistItem(index: number) {
    setPlaylist((prev) => prev.filter((_, i) => i !== index));
  }

  if (!config && !error) return <main className="p-8 text-ivory/50">Carregando…</main>;

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="font-display text-2xl">Rádio / ON AIR</h1>
      <p className="mt-2 text-sm text-ivory/50">
        Importante: nenhum modo aqui é uma &quot;rádio ao vivo 24/7&quot; automática — cada um depende de
        você configurar um link ou lista real. Veja detalhes em docs/RADIO.md.
      </p>

      {error && <p className="mt-4 text-terracotta">{error}</p>}

      <form onSubmit={handleSave} className="mt-6 space-y-4">
        <label className="flex items-center gap-2 text-sm text-ivory/80">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Rádio habilitado (aparece no topo do site)
        </label>

        <label className="block text-sm text-ivory/80">
          Modo
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory"
          >
            {Object.entries(MODE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-ivory/80">
          Título (exibido na barra)
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory" />
        </label>

        <label className="block text-sm text-ivory/80">
          Descrição (opcional)
          <input value={description} onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory" />
        </label>

        {(mode === "spotify" || mode === "external") && (
          <label className="block text-sm text-ivory/80">
            URL do embed {mode === "spotify" ? "(open.spotify.com/playlist/... ou /show/...)" : "(iframe)"}
            <input
              type="url"
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
              className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory"
            />
          </label>
        )}

        {mode === "own_audio" && (
          <label className="block text-sm text-ivory/80">
            URL do arquivo de áudio (mp3/ogg — hospedado por vocês, com direito de distribuição)
            <input
              type="url"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory"
            />
          </label>
        )}

        {mode === "editorial_playlist" && (
          <div>
            <p className="text-sm text-ivory/80">Itens da playlist</p>
            <div className="mt-2 space-y-2">
              {playlist.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    placeholder="Título"
                    value={item.title}
                    onChange={(e) => updatePlaylistItem(index, "title", e.target.value)}
                    className="flex-1 rounded border border-bronze/30 bg-charcoal px-2 py-1 text-sm text-ivory"
                  />
                  <input
                    placeholder="URL"
                    value={item.url}
                    onChange={(e) => updatePlaylistItem(index, "url", e.target.value)}
                    className="flex-1 rounded border border-bronze/30 bg-charcoal px-2 py-1 text-sm text-ivory"
                  />
                  <button type="button" onClick={() => removePlaylistItem(index)} className="text-terracotta text-sm">
                    Remover
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addPlaylistItem}
              className="mt-2 text-sm text-bronze hover:text-terracotta"
            >
              + Adicionar item
            </button>
          </div>
        )}

        <button type="submit" disabled={saving}
          className="rounded bg-terracotta px-4 py-2 text-sm font-medium text-ivory disabled:opacity-60">
          {saving ? "Salvando…" : "Salvar"}
        </button>
      </form>
    </main>
  );
}
