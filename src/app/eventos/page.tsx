import { getPublishedEventsList } from "@/lib/public/home-data";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

export const dynamic = "force-dynamic";

interface EventListItem {
  id: string;
  slug: string;
  title: string;
  city: string | null;
  eventStartAt: Date;
}

export default async function EventsPage() {
  const events: EventListItem[] = await getPublishedEventsList();
  const now = new Date();
  const upcoming = events.filter((e: EventListItem) => e.eventStartAt >= now);
  const past = events.filter((e: EventListItem) => e.eventStartAt < now);

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl text-ivory">Eventos</h1>

        {events.length === 0 && <p className="mt-8 text-ivory/50">Nenhum evento publicado ainda.</p>}

        {upcoming.length > 0 && (
          <>
            <h2 className="mt-8 text-sm uppercase tracking-wide text-bronze">Próximos</h2>
            <ul className="mt-4 space-y-4">
              {upcoming.map((event: EventListItem) => (
                <EventRow key={event.id} event={event} />
              ))}
            </ul>
          </>
        )}

        {past.length > 0 && (
          <>
            <h2 className="mt-12 text-sm uppercase tracking-wide text-ivory/40">Já aconteceram</h2>
            <ul className="mt-4 space-y-4 opacity-60">
              {past.map((event: EventListItem) => (
                <EventRow key={event.id} event={event} />
              ))}
            </ul>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

function EventRow({ event }: { event: EventListItem }) {
  return (
    <li className="flex items-baseline justify-between border-b border-bronze/10 pb-4">
      <div>
        <a href={`/eventos/${event.slug}`} className="text-ivory hover:text-terracotta">
          {event.title}
        </a>
        {event.city && <p className="mt-1 text-xs text-ivory/50">{event.city}</p>}
      </div>
      <time
        dateTime={event.eventStartAt.toISOString()}
        className="whitespace-nowrap text-sm text-bronze"
      >
        {event.eventStartAt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
      </time>
    </li>
  );
}
