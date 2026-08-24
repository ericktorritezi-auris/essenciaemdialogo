"use client";

import { useEffect, useState, useRef } from "react";
import { apiFetch, ApiError } from "@/lib/api-client/fetch";

interface MediaItem {
  id: string;
  url: string;
  altText: string | null;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function loadMedia() {
    apiFetch<{ media: MediaItem[] }>("/api/admin/media")
      .then((data) => setMedia(data.media))
      .catch((err) => setError(err.message));
  }

  useEffect(loadMedia, []);

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      // 1. Pede uma URL assinada de upload
      const { key, uploadUrl } = await apiFetch<{ key: string; uploadUrl: string }>(
        "/api/admin/media/presign",
        {
          method: "POST",
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            sizeBytes: file.size,
          }),
        },
      );

      // 2. Upload direto para o R2 (não passa pelo servidor Next.js)
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadResponse.ok) {
        throw new Error("Falha ao enviar o arquivo para o storage.");
      }

      // 3. Confirma — o servidor valida magic bytes reais e cria o registro
      await apiFetch("/api/admin/media/confirm", {
        method: "POST",
        body: JSON.stringify({ key }),
      });

      loadMedia();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao enviar imagem.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta mídia?")) return;
    try {
      await apiFetch(`/api/admin/media/${id}`, { method: "DELETE" });
      loadMedia();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao excluir.");
    }
  }

  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Biblioteca de mídia</h1>
        <label className="rounded bg-terracotta px-4 py-2 text-sm font-medium text-ivory cursor-pointer">
          {uploading ? "Enviando…" : "Enviar imagem"}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={uploading}
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            className="hidden"
          />
        </label>
      </div>

      <p className="mt-2 text-xs text-ivory/40">
        JPEG, PNG, WebP ou GIF — até 10 MB. O tipo real do arquivo é conferido no servidor.
      </p>

      {error && <p className="mt-4 text-terracotta">{error}</p>}
      {!media && !error && <p className="mt-8 text-ivory/50">Carregando…</p>}
      {media && media.length === 0 && <p className="mt-8 text-ivory/50">Nenhuma mídia ainda.</p>}

      {media && media.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
          {media.map((item) => (
            <div key={item.id} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.altText ?? ""}
                className="aspect-square w-full rounded object-cover"
              />
              <button
                onClick={() => handleDelete(item.id)}
                className="absolute right-1 top-1 rounded bg-warm-black/80 px-2 py-1 text-xs text-terracotta opacity-0 group-hover:opacity-100"
              >
                Excluir
              </button>
              <p className="mt-1 text-xs text-ivory/40">
                {(item.sizeBytes / 1024).toFixed(0)} KB
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
