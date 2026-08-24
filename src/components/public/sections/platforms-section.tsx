import { getActivePlatforms } from "@/lib/public/home-data";

interface PlatformsSectionProps {
  content: Record<string, unknown>;
}

export async function PlatformsSection({ content }: PlatformsSectionProps) {
  const title = typeof content.title === "string" ? content.title : "Ouça também em";
  const platforms = await getActivePlatforms();

  if (platforms.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
      <h2 className="font-display text-2xl text-ivory">{title}</h2>
      <div className="mt-6 flex flex-wrap justify-center gap-6">
        {platforms.map((platform: { id: string; name: string }) => (
          <span key={platform.id} className="text-ivory/70">
            {platform.name}
          </span>
        ))}
      </div>
    </section>
  );
}
