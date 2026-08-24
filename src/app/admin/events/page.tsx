"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client/fetch";
import { StatusBadge } from "@/components/admin/status-badge";

interface EventListItem {
  id: string;
  title: string;
  status: string;
  eventStartAt: string;
  city: string | null;
  author: { id: string; name: string };
}

export default function EventsListPage() {
  const [events, setEvents] = useState<EventListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ events: EventListItem[] }>("/api/admin/events")
      .then((data) => setEvents(data.events))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Eventos</h1>
        <Link href="/admin/events/new" className="rounded bg-terracotta px-4 py-2 text-sm font-medium text-ivory">
          Novo evento
        </Link>
      </div>

      {error && <p className="mt-4 text-terracotta">{error}</p>}
      {!events && !error && <p className="mt-8 text-ivory/50">Carregando…</p>}
      {events && events.length === 0 && <p className="mt-8 text-ivory/50">Nenhum evento ainda.</p>}

      {events && events.length > 0 && (
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-bronze/20 text-ivory/50">
              <th className="py-2 font-normal">Título</th>
              <th className="py-2 font-normal">Data</th>
              <th className="py-2 font-normal">Cidade</th>
              <th className="py-2 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-bronze/10">
                <td className="py-3">
                  <Link href={`/admin/events/${event.id}`} className="hover:text-terracotta">
                    {event.title}
                  </Link>
                </td>
                <td className="py-3 text-ivory/70">
                  {new Date(event.eventStartAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                </td>
                <td className="py-3 text-ivory/70">{event.city ?? "—"}</td>
                <td className="py-3"><StatusBadge status={event.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
