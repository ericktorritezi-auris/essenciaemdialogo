"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client/fetch";

interface MediaItem {
  id: string;
  url: string;
  altText: string | null;
}

export function MediaPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (mediaId: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaItem[] | null>(null);
  const [selected, setSelected] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (!open || media) return;
    apiFetch<{ media: MediaItem[] }>("/api/admin/media").then((data) => setMedia(data.media));
  }, [open, media]);

  useEffect(() => {
    if (!value) {
      setSelected(null);
      return;
    }
    if (media) {
      setSelected(media.find((m) => m.id === value) ?? null);
    }
  }, [value, media]);

  return (
    <div>
      <label className="block text-sm text-ivory/80">Imagem de capa</label>

      {selected && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={selected.url}
          alt={selected.altText ?? ""}
          className="mt-2 h-32 w-32 rounded object-cover"
        />
      )}

      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded border border-bronze/30 px-3 py-1.5 text-sm text-ivory/80"
        >
          {selected ? "Trocar imagem" : "Escolher imagem"}
        </button>
        {selected && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded border border-terracotta/40 px-3 py-1.5 text-sm text-terracotta"
          >
            Remover
          </button>
        )}
      </div>

      {open && (
        <div className="mt-3 grid grid-cols-4 gap-2 rounded border border-bronze/20 p-3 sm:grid-cols-6">
          {media === null && <p className="col-span-full text-sm text-ivory/50">Carregando…</p>}
          {media?.length === 0 && (
            <p className="col-span-full text-sm text-ivory/50">
              Nenhuma mídia ainda — envie em /admin/media.
            </p>
          )}
          {media?.map((item) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={item.id}
              src={item.url}
              alt={item.altText ?? ""}
              onClick={() => {
                onChange(item.id);
                setOpen(false);
              }}
              className="aspect-square cursor-pointer rounded object-cover ring-1 ring-bronze/20 hover:ring-terracotta"
            />
          ))}
        </div>
      )}
    </div>
  );
}
