import { getActivePlatforms } from "@/lib/public/home-data";
import { WaveDivider } from "@/components/public/wave-divider";

interface PlatformsSectionProps {
  content: Record<string, unknown>;
}

export async function PlatformsSection({ content }: PlatformsSectionProps) {
  const title = typeof content.title === "string" ? content.title : "Ouça também em";
  const platforms = await getActivePlatforms();

  if (platforms.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
      <WaveDivider className="mb-10" />
      <h2 className="font-display text-2xl text-ivory sm:text-3xl">{title}</h2>
      <div className="mt-7 flex flex-wrap justify-center gap-x-8 gap-y-3">
        {platforms.map((platform: { id: string; name: string }) => (
          <span key={platform.id} className="text-ivory/70 transition-colors hover:text-terracotta">
            {platform.name}
          </span>
        ))}
      </div>
    </section>
  );
}
