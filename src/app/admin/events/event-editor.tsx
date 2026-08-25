"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fromZonedTime, toZonedTime, format } from "date-fns-tz";
import { apiFetch, ApiError } from "@/lib/api-client/fetch";
import { StatusBadge } from "@/components/admin/status-badge";
import { MediaPicker } from "@/components/admin/media-picker";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { BUSINESS_TIMEZONE } from "@/lib/time";

interface EventData {
  id: string;
  title: string;
  type: "OWN" | "RECOMMENDED";
  description: string | null;
  coverMediaId: string | null;
  organizer: string | null;
  city: string | null;
  eventStartAt: string;
  eventEndAt: string | null;
  url: string | null;
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

/** Converte um Date (instante absoluto) para o valor de um <input type="datetime-local">, no fuso de negócio. */
function toDatetimeLocalValue(date: Date): string {
  return format(toZonedTime(date, BUSINESS_TIMEZONE), "yyyy-MM-dd'T'HH:mm", { timeZone: BUSINESS_TIMEZONE });
}

/** Converte o valor "solto" de um <input type="datetime-local"> para ISO com offset, assumindo o fuso de negócio. */
function fromDatetimeLocalValue(value: string): string {
  return fromZonedTime(value, BUSINESS_TIMEZONE).toISOString();
}

export function EventEditor({ eventId }: { eventId?: string }) {
  const router = useRouter();
  const isNew = !eventId;

  const [event, setEvent] = useState<EventData | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"OWN" | "RECOMMENDED">("OWN");
  const [description, setDescription] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [city, setCity] = useState("");
  const [eventStartAt, setEventStartAt] = useState("");
  const [eventEndAt, setEventEndAt] = useState("");
  const [url, setUrl] = useState("");
  const [coverMediaId, setCoverMediaId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ role: Role }>("/api/admin/me").then((data) => setRole(data.role)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!eventId) return;
    apiFetch<{ event: EventData }>(`/api/admin/events/${eventId}`)
      .then((data) => {
        setEvent(data.event);
        setTitle(data.event.title);
        setType(data.event.type);
        setDescription(data.event.description ?? "");
        setOrganizer(data.event.organizer ?? "");
        setCity(data.event.city ?? "");
        setEventStartAt(toDatetimeLocalValue(new Date(data.event.eventStartAt)));
        setEventEndAt(data.event.eventEndAt ? toDatetimeLocalValue(new Date(data.event.eventEndAt)) : "");
        setUrl(data.event.url ?? "");
        setCoverMediaId(data.event.coverMediaId);
      })
      .catch((err) => setError(err.message));
  }, [eventId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title,
        type,
        description: description || undefined,
        organizer: organizer || undefined,
        city: city || undefined,
        eventStartAt: fromDatetimeLocalValue(eventStartAt),
        eventEndAt: eventEndAt ? fromDatetimeLocalValue(eventEndAt) : undefined,
        url: url || undefined,
      };
      if (isNew) {
        const data = await apiFetch<{ event: EventData }>("/api/admin/events", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        router.push(`/admin/events/${data.event.id}`);
      } else {
        const data = await apiFetch<{ event: EventData }>(`/api/admin/events/${eventId}`, {
          method: "PATCH",
          body: JSON.stringify({ ...payload, description: description || null, organizer: organizer || null, city: city || null, url: url || null, coverMediaId }),
        });
        setEvent(data.event);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTransition(to: string) {
    if (!eventId) return;
    setSaving(true);
    setError(null);
    try {
      const data = await apiFetch<{ event: EventData }>(`/api/admin/events/${eventId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: to }),
      });
      setEvent(data.event);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao mudar status.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!eventId || !event) return;
    if (!confirm(`Excluir "${event.title}"? Esta ação não pode ser desfeita pela interface.`)) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/events/${eventId}`, { method: "DELETE" });
      router.push("/admin/events");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao excluir.");
      setSaving(false);
    }
  }

  const transitions = event && role ? getAvailableTransitions(event.status, role) : [];

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">{isNew ? "Novo evento" : "Editar evento"}</h1>
        {event && <StatusBadge status={event.status} />}
      </div>

      {error && <p className="mt-4 text-terracotta">{error}</p>}

      <form onSubmit={handleSave} className="mt-6 space-y-4">
        <label className="block text-sm text-ivory/80">
          Título
          <input required value={title} onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory" />
        </label>

        <label className="block text-sm text-ivory/80">
          Tipo
          <select value={type} onChange={(e) => setType(e.target.value as "OWN" | "RECOMMENDED")}
            className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory">
            <option value="OWN">Próprio</option>
            <option value="RECOMMENDED">Recomendado</option>
          </select>
        </label>

        <div>
          <p className="block text-sm text-ivory/80">Descrição</p>
          <div className="mt-1">
            <RichTextEditor value={description} onChange={setDescription} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm text-ivory/80">
            Início ({BUSINESS_TIMEZONE})
            <input required type="datetime-local" value={eventStartAt} onChange={(e) => setEventStartAt(e.target.value)}
              className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory" />
          </label>
          <label className="block text-sm text-ivory/80">
            Término (opcional)
            <input type="datetime-local" value={eventEndAt} onChange={(e) => setEventEndAt(e.target.value)}
              className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm text-ivory/80">
            Organizador
            <input value={organizer} onChange={(e) => setOrganizer(e.target.value)}
              className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory" />
          </label>
          <label className="block text-sm text-ivory/80">
            Cidade
            <input value={city} onChange={(e) => setCity(e.target.value)}
              className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory" />
          </label>
        </div>

        <label className="block text-sm text-ivory/80">
          Link (inscrição/mais informações)
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
            className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory" />
        </label>

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

      {!isNew && event && (
        <div className="mt-6 border-t border-bronze/20 pt-6">
          <button type="button" disabled={saving} onClick={handleDelete}
            className="text-sm text-terracotta hover:underline disabled:opacity-60">
            Excluir evento
          </button>
        </div>
      )}
    </main>
  );
}
