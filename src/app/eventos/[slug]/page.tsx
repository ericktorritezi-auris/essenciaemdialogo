import { notFound } from "next/navigation";
import { getEventBySlug, getMediaUrlMap } from "@/lib/public/home-data";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

export const dynamic = "force-dynamic";

interface EventPageProps {
  params: { slug: string };
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const event = await getEventBySlug(params.slug);
  if (!event) notFound();

  const mediaMap = await getMediaUrlMap([event.coverMediaId]);
  const coverUrl = event.coverMediaId ? mediaMap.get(event.coverMediaId) : null;

  const location = [event.city, event.state, event.country].filter(Boolean).join(", ");

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
        {coverUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-petrol shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}

        <h1 className="mt-7 font-display text-3xl leading-tight text-ivory sm:text-4xl">{event.title}</h1>

        <dl className="mt-5 space-y-1.5 rounded-lg border border-bronze/20 bg-charcoal p-5 text-sm text-ivory/70">
          <div>
            <dt className="inline text-bronze">Quando: </dt>
            <dd className="inline">
              {event.eventStartAt.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "long", timeStyle: "short" })}
            </dd>
          </div>
          {location && (
            <div>
              <dt className="inline text-bronze">Onde: </dt>
              <dd className="inline">{location}</dd>
            </div>
          )}
          {event.modality && (
            <div>
              <dt className="inline text-bronze">Modalidade: </dt>
              <dd className="inline capitalize">{event.modality}</dd>
            </div>
          )}
          {event.organizer && (
            <div>
              <dt className="inline text-bronze">Organização: </dt>
              <dd className="inline">{event.organizer}</dd>
            </div>
          )}
        </dl>

        {event.description && (
          <div
            className="mt-8 space-y-4 text-[1.05rem] leading-relaxed text-ivory/80 [&_a]:text-terracotta [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: event.description }}
          />
        )}

        {event.url && (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded bg-terracotta px-7 py-3.5 text-sm font-medium text-ivory transition-transform hover:-translate-y-0.5"
          >
            Mais informações / inscrição
          </a>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
