import { getMediaUrlMap } from "@/lib/public/home-data";

interface Host {
  name: string;
  role: string;
  photoMediaId: string | null;
}

interface HostsSectionProps {
  content: Record<string, unknown>;
}

export async function HostsSection({ content }: HostsSectionProps) {
  const title = typeof content.title === "string" ? content.title : "Apresentadores";
  const hosts = Array.isArray(content.hosts) ? (content.hosts as Host[]) : [];

  if (hosts.length === 0) return null;

  const mediaMap = await getMediaUrlMap(hosts.map((h) => h.photoMediaId));

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h2 className="text-center font-display text-2xl text-ivory">{title}</h2>

      {/* grid simétrica — nenhum dos dois apresentadores tem destaque maior (Seção 16) */}
      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {hosts.map((host) => {
          const photoUrl = host.photoMediaId ? mediaMap.get(host.photoMediaId) : null;
          return (
            <div key={host.name} className="text-center">
              <div className="mx-auto h-32 w-32 overflow-hidden rounded-full bg-petrol">
                {photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt={host.name} className="h-full w-full object-cover" />
                )}
              </div>
              <p className="mt-4 font-display text-lg text-ivory">{host.name}</p>
              <p className="mt-1 text-sm text-ivory/60">{host.role}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
