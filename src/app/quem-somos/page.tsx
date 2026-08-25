import Image from "next/image";
import { getHomeSectionContent, getMediaUrlMap } from "@/lib/public/home-data";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { WaveDivider } from "@/components/public/wave-divider";

export const dynamic = "force-dynamic";

interface Host {
  name: string;
  role: string;
  bio?: string;
  photoMediaId: string | null;
  photoUrl?: string;
}

export default async function QuemSomosPage() {
  const [aboutContent, manifestoContent, hostsContent] = await Promise.all([
    getHomeSectionContent("ABOUT"),
    getHomeSectionContent("MANIFESTO"),
    getHomeSectionContent("HOSTS"),
  ]);

  const aboutBody = typeof aboutContent?.body === "string" ? aboutContent.body : null;
  const manifestoBody = typeof manifestoContent?.body === "string" ? manifestoContent.body : null;
  const hosts = Array.isArray(hostsContent?.hosts) ? (hostsContent.hosts as Host[]) : [];

  const mediaIds = hosts.filter((h) => !h.photoUrl).map((h) => h.photoMediaId);
  const mediaMap = await getMediaUrlMap(mediaIds);

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
        <h1 className="text-center font-display text-3xl text-ivory sm:text-4xl">Quem somos</h1>

        {aboutBody && (
          <p className="mx-auto mt-6 max-w-xl text-balance text-center text-lg leading-relaxed text-ivory/70">
            {aboutBody}
          </p>
        )}

        {manifestoBody && (
          <p className="mx-auto mt-4 max-w-xl text-balance text-center text-ivory/50">{manifestoBody}</p>
        )}

        <WaveDivider className="mt-14" />

        {hosts.length > 0 && (
          <div className="mt-14 space-y-16">
            {hosts.map((host, index) => {
              const photoUrl = host.photoUrl ?? (host.photoMediaId ? mediaMap.get(host.photoMediaId) : null);
              const imageFirst = index % 2 === 0;
              return (
                <div
                  key={host.name}
                  className="flex flex-col items-center gap-8 text-center sm:flex-row sm:items-start sm:text-left"
                >
                  <div
                    className={`h-36 w-36 shrink-0 overflow-hidden rounded-full ring-1 ring-bronze/40 ring-offset-4 ring-offset-warm-black sm:h-44 sm:w-44 ${
                      imageFirst ? "sm:order-1" : "sm:order-2"
                    }`}
                  >
                    {photoUrl ? (
                      <Image
                        src={photoUrl}
                        alt={host.name}
                        width={176}
                        height={176}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-petrol" />
                    )}
                  </div>
                  <div className={imageFirst ? "sm:order-2" : "sm:order-1"}>
                    <p className="font-display text-2xl text-ivory">{host.name}</p>
                    <p className="mt-1 text-sm uppercase tracking-wide text-bronze">{host.role}</p>
                    {host.bio ? (
                      <p className="mt-4 leading-relaxed text-ivory/70">{host.bio}</p>
                    ) : (
                      <p className="mt-4 text-sm italic text-ivory/40">
                        Biografia completa em breve.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
