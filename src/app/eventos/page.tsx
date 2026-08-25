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
      <main id="main-content" className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <h1 className="font-display text-3xl text-ivory sm:text-4xl">Eventos</h1>
        <p className="mt-3 max-w-lg text-ivory/60">
          Encontros, participações e experiências ao vivo do Essência em Diálogo.
        </p>

        {events.length === 0 && <p className="mt-12 text-ivory/50">Nenhum evento publicado ainda.</p>}

        {upcoming.length > 0 && (
          <>
            <h2 className="mt-12 text-xs uppercase tracking-widest text-bronze">Próximos</h2>
            <ul className="mt-4 divide-y divide-bronze/10">
              {upcoming.map((event: EventListItem) => (
                <EventRow key={event.id} event={event} />
              ))}
            </ul>
          </>
        )}

        {past.length > 0 && (
          <>
            <h2 className="mt-14 text-xs uppercase tracking-widest text-ivory/30">Já aconteceram</h2>
            <ul className="mt-4 divide-y divide-bronze/10 opacity-50">
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
    <li>
      <a
        href={`/eventos/${event.slug}`}
        className="flex items-baseline justify-between gap-4 rounded-md px-2 py-4 transition-colors hover:bg-charcoal"
      >
        <div>
          <p className="text-ivory">{event.title}</p>
          {event.city && <p className="mt-1 text-xs text-ivory/50">{event.city}</p>}
        </div>
        <time
          dateTime={event.eventStartAt.toISOString()}
          className="whitespace-nowrap text-sm text-bronze"
        >
          {event.eventStartAt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
        </time>
      </a>
    </li>
  );
}
