import { getUpcomingEvents } from "@/lib/public/home-data";
import { BUSINESS_TIMEZONE } from "@/lib/time";

interface EventsSectionProps {
  content: Record<string, unknown>;
}

export async function EventsSection({ content }: EventsSectionProps) {
  const title = typeof content.title === "string" ? content.title : "Próximos eventos";
  const events = await getUpcomingEvents();

  if (events.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <h2 className="font-display text-2xl text-ivory sm:text-3xl">{title}</h2>
      <ul className="mt-8 space-y-1">
        {events.map((event: { id: string; slug: string; title: string; city: string | null; eventStartAt: Date }) => (
          <li key={event.id}>
            <a
              href={`/eventos/${event.slug}`}
              className="flex items-baseline justify-between gap-4 rounded-md px-3 py-4 transition-colors hover:bg-charcoal"
            >
              <div>
                <p className="text-ivory transition-colors group-hover:text-terracotta">{event.title}</p>
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
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
