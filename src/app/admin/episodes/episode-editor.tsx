"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api-client/fetch";
import { StatusBadge } from "@/components/admin/status-badge";
import { MediaPicker } from "@/components/admin/media-picker";
import { isValidSpotifyUrl } from "@/lib/spotify";

interface PlatformLink {
  platformId: string;
  url: string;
}

interface Episode {
  id: string;
  title: string;
  season: number | null;
  number: number | null;
  shortDescription: string | null;
  fullDescription: string | null;
  duration: number | null;
  coverMediaId: string | null;
  status: string;
  createdBy: string | null;
  platformLinks?: { platformId: string; url: string; platform: { key: string; name: string } }[];
}

interface Platform {
  id: string;
  key: string;
  name: string;
  active: boolean;
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

export function EpisodeEditor({ episodeId }: { episodeId?: string }) {
  const router = useRouter();
  const isNew = !episodeId;

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [title, setTitle] = useState("");
  const [season, setSeason] = useState("");
  const [number, setNumber] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [coverMediaId, setCoverMediaId] = useState<string | null>(null);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ role: Role }>("/api/admin/me").then((data) => setRole(data.role)).catch(() => {});
    apiFetch<{ platforms: Platform[] }>("/api/admin/platforms")
      .then((data) => setPlatforms(data.platforms.filter((p) => p.active)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!episodeId) return;
    apiFetch<{ episode: Episode }>(`/api/admin/episodes/${episodeId}`)
      .then((data) => {
        setEpisode(data.episode);
        setTitle(data.episode.title);
        setSeason(data.episode.season?.toString() ?? "");
        setNumber(data.episode.number?.toString() ?? "");
        setShortDescription(data.episode.shortDescription ?? "");
        setFullDescription(data.episode.fullDescription ?? "");
        setDuration(data.episode.duration?.toString() ?? "");
        setCoverMediaId(data.episode.coverMediaId);
        const linkMap: Record<string, string> = {};
        for (const link of data.episode.platformLinks ?? []) {
          linkMap[link.platformId] = link.url;
        }
        setLinks(linkMap);
      })
      .catch((err) => setError(err.message));
  }, [episodeId]);

  const spotifyLink = Object.entries(links).find(([platformId]) => {
    const platform = platforms.find((p) => p.id === platformId);
    return platform?.key === "spotify";
  });
  const spotifyUrlInvalid = !!spotifyLink?.[1] && !isValidSpotifyUrl(spotifyLink[1]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (spotifyUrlInvalid) {
      setError("O link do Spotify precisa ser uma URL válida de open.spotify.com.");
      setSaving(false);
      return;
    }

    const platformLinks = Object.entries(links)
      .filter(([, url]) => url.trim().length > 0)
      .map(([platformId, url]) => ({ platformId, url: url.trim() }));

    try {
      if (isNew) {
        const data = await apiFetch<{ episode: Episode }>("/api/admin/episodes", {
          method: "POST",
          body: JSON.stringify({
            title,
            season: season ? Number(season) : undefined,
            number: number ? Number(number) : undefined,
            shortDescription,
            fullDescription,
            duration: duration ? Number(duration) : undefined,
          }),
        });
        router.push(`/admin/episodes/${data.episode.id}`);
      } else {
        const data = await apiFetch<{ episode: Episode }>(`/api/admin/episodes/${episodeId}`, {
          method: "PATCH",
          body: JSON.stringify({
            title,
            season: season ? Number(season) : null,
            number: number ? Number(number) : null,
            shortDescription: shortDescription || null,
            fullDescription: fullDescription || null,
            duration: duration ? Number(duration) : null,
            coverMediaId,
            platformLinks,
          }),
        });
        setEpisode(data.episode);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTransition(to: string) {
    if (!episodeId) return;
    setSaving(true);
    setError(null);
    try {
      const data = await apiFetch<{ episode: Episode }>(`/api/admin/episodes/${episodeId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: to }),
      });
      setEpisode(data.episode);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao mudar status.");
    } finally {
      setSaving(false);
    }
  }

  const transitions = episode && role ? getAvailableTransitions(episode.status, role) : [];

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">{isNew ? "Novo episódio" : "Editar episódio"}</h1>
        {episode && <StatusBadge status={episode.status} />}
      </div>

      {error && <p className="mt-4 text-terracotta">{error}</p>}

      <form onSubmit={handleSave} className="mt-6 space-y-4">
        <label className="block text-sm text-ivory/80">
          Título
          <input required value={title} onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory" />
        </label>

        <div className="grid grid-cols-3 gap-4">
          <label className="block text-sm text-ivory/80">
            Temporada
            <input type="number" min="1" value={season} onChange={(e) => setSeason(e.target.value)}
              className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory" />
          </label>
          <label className="block text-sm text-ivory/80">
            Número
            <input type="number" min="1" value={number} onChange={(e) => setNumber(e.target.value)}
              className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory" />
          </label>
          <label className="block text-sm text-ivory/80">
            Duração (min)
            <input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)}
              className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory" />
          </label>
        </div>

        <label className="block text-sm text-ivory/80">
          Descrição curta
          <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={2}
            className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory" />
        </label>

        <label className="block text-sm text-ivory/80">
          Descrição completa
          <textarea value={fullDescription} onChange={(e) => setFullDescription(e.target.value)} rows={8}
            className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory font-mono text-sm" />
        </label>

        {!isNew && <MediaPicker value={coverMediaId} onChange={setCoverMediaId} />}

        {!isNew && platforms.length > 0 && (
          <div>
            <p className="text-sm text-ivory/80">Links das plataformas</p>
            <div className="mt-2 space-y-2">
              {platforms.map((platform) => (
                <label key={platform.id} className="block text-xs text-ivory/60">
                  {platform.name}
                  <input
                    type="url"
                    value={links[platform.id] ?? ""}
                    onChange={(e) => setLinks((prev) => ({ ...prev, [platform.id]: e.target.value }))}
                    placeholder={platform.key === "spotify" ? "https://open.spotify.com/episode/..." : "https://..."}
                    className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-sm text-ivory"
                  />
                </label>
              ))}
            </div>
            {spotifyUrlInvalid && (
              <p className="mt-1 text-xs text-terracotta">
                O link do Spotify precisa ser uma URL de open.spotify.com/episode/... ou /show/...
              </p>
            )}
          </div>
        )}
        {!isNew && platforms.length === 0 && (
          <p className="text-xs text-ivory/40">
            Nenhuma plataforma ativa — ative em /admin/platforms para poder linkar este episódio.
          </p>
        )}

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
