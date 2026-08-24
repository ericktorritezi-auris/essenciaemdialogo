import { getUpcomingEvents } from "@/lib/public/home-data";
import { BUSINESS_TIMEZONE } from "@/lib/time";

interface EventsSectionProps {
  content: Record<string, unknown>;
}

export async function EventsSection({ content }: EventsSectionProps) {
  const title = typeof content.title === "string" ? content.title : "Próximos eventos";
  const events = await getUpcomingEvents();

  if (events.length === 0) return null;

  type EventItem = { id: string; slug: string; title: string; city: string | null; eventStartAt: Date };

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h2 className="font-display text-2xl text-ivory">{title}</h2>
      <ul className="mt-6 space-y-4">
        {events.map((event: EventItem) => (
          <li key={event.id} className="flex items-baseline justify-between border-b border-bronze/10 pb-4">
            <div>
              <a href={`/eventos/${event.slug}`} className="text-ivory hover:text-terracotta">
                {event.title}
              </a>
              {event.city && <p className="mt-1 text-xs text-ivory/50">{event.city}</p>}
            </div>
            {/* Formata o instante absoluto direto no fuso de negócio — nunca
                pré-converter com toZonedTime antes de passar timeZone aqui,
                ou a data acaba deslocada em dobro. */}
            <time
              dateTime={event.eventStartAt.toISOString()}
              className="whitespace-nowrap text-sm text-bronze"
            >
              {event.eventStartAt.toLocaleDateString("pt-BR", { timeZone: BUSINESS_TIMEZONE })}
            </time>
          </li>
        ))}
      </ul>
    </section>
  );
}
