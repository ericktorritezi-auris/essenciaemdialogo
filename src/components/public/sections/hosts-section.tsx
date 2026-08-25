import Image from "next/image";
import { getMediaUrlMap } from "@/lib/public/home-data";
import { WaveDivider } from "@/components/public/wave-divider";

interface Host {
  name: string;
  role: string;
  photoMediaId: string | null;
  // Arquivo estático em /public (usado para as fotos oficiais dos
  // apresentadores) — alternativa ao photoMediaId da Biblioteca de
  // Mídia, para não depender de upload manual para um asset que já é
  // parte da identidade do projeto desde o início.
  photoUrl?: string;
}

interface HostsSectionProps {
  content: Record<string, unknown>;
}

export async function HostsSection({ content }: HostsSectionProps) {
  const title = typeof content.title === "string" ? content.title : "Apresentadores";
  const hosts = Array.isArray(content.hosts) ? (content.hosts as Host[]) : [];

  if (hosts.length === 0) return null;

  const mediaIds = hosts.filter((h) => !h.photoUrl).map((h) => h.photoMediaId);
  const mediaMap = await getMediaUrlMap(mediaIds);

  return (
    <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <h2 className="text-center font-display text-2xl text-ivory sm:text-3xl">{title}</h2>

      {/* grid simétrica — nenhum dos dois apresentadores tem destaque maior (Seção 16) */}
      <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8">
        {hosts.map((host: Host) => {
          const photoUrl = host.photoUrl ?? (host.photoMediaId ? mediaMap.get(host.photoMediaId) : null);
          return (
            <div key={host.name} className="text-center">
              <div className="mx-auto h-36 w-36 overflow-hidden rounded-full ring-1 ring-bronze/40 ring-offset-4 ring-offset-warm-black sm:h-40 sm:w-40">
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt={host.name}
                    width={160}
                    height={160}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-petrol" />
                )}
              </div>
              <p className="mt-5 font-display text-xl text-ivory">{host.name}</p>
              <p className="mt-1 text-sm text-bronze">{host.role}</p>
            </div>
          );
        })}
      </div>

      <WaveDivider className="mt-16" />
    </section>
  );
}
