import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEventBySlug, getMediaUrlMap } from "@/lib/public/home-data";
import { buildMetadata, getSiteUrl } from "@/lib/public/seo";
import { JsonLd } from "@/components/public/json-ld";

export const dynamic = "force-dynamic";

interface EventPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);
  if (!event) return buildMetadata({ title: "Evento não encontrado", path: `/eventos/${params.slug}`, noIndex: true });

  const mediaMap = await getMediaUrlMap([event.coverMediaId]);
  const coverUrl = event.coverMediaId ? mediaMap.get(event.coverMediaId) : null;

  return buildMetadata({
    title: event.seoTitle || event.title,
    description: event.seoDescription || event.description,
    path: `/eventos/${event.slug}`,
    ogImageUrl: coverUrl,
  });
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const event = await getEventBySlug(params.slug);
  if (!event) notFound();

  const mediaMap = await getMediaUrlMap([event.coverMediaId]);
  const coverUrl = event.coverMediaId ? mediaMap.get(event.coverMediaId) : null;
  const siteUrl = getSiteUrl();

  const location = [event.city, event.state, event.country].filter(Boolean).join(", ");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: event.title,
          startDate: event.eventStartAt.toISOString(),
          ...(event.eventEndAt ? { endDate: event.eventEndAt.toISOString() } : {}),
          eventAttendanceMode:
            event.modality === "online"
              ? "https://schema.org/OnlineEventAttendanceMode"
              : event.modality === "hibrido"
                ? "https://schema.org/MixedEventAttendanceMode"
                : "https://schema.org/OfflineEventAttendanceMode",
          url: `${siteUrl}/eventos/${event.slug}`,
          ...(coverUrl ? { image: coverUrl } : {}),
          ...(location
            ? { location: { "@type": "Place", name: location, address: location } }
            : {}),
          ...(event.organizer ? { organizer: { "@type": "Organization", name: event.organizer } } : {}),
        }}
      />
      <main id="main-content" className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
        {coverUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-petrol shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverUrl} alt="" className="h-full w-full object-cover"  loading="lazy" />
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
    </>
  );
}
