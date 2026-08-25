import Image from "next/image";
import { getActivePlatforms } from "@/lib/public/home-data";
import { WaveDivider } from "@/components/public/wave-divider";

interface HeroSectionProps {
  content: Record<string, unknown>;
}

export async function HeroSection({ content }: HeroSectionProps) {
  const title = typeof content.title === "string" ? content.title : "Essência em Diálogo";
  const highlight = typeof content.highlight === "string" ? content.highlight : null;
  const subtitle = typeof content.subtitle === "string" ? content.subtitle : null;

  const platforms = await getActivePlatforms();

  return (
    <section className="relative overflow-hidden px-4 py-24 text-center sm:px-6 sm:py-32">
      {/* Brilho radial na paleta da marca — o "clima" cinematográfico
          pedido, sem depender de uma imagem de fundo pesada. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px]"
        style={{
          background:
            "radial-gradient(ellipse 640px 420px at 50% -10%, rgba(165,88,58,0.22), transparent 65%), radial-gradient(ellipse 480px 320px at 15% 30%, rgba(169,121,63,0.14), transparent 70%)",
        }}
      />

      <Image
        src="/brand/logo-icon.png"
        alt="Essência em Diálogo"
        width={200}
        height={200}
        className="mx-auto h-24 w-24 opacity-95 sm:h-36 sm:w-36"
        priority
      />

      <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl leading-[1.1] text-ivory sm:text-6xl">
        {title}
        {highlight && <span className="block text-terracotta">{highlight}</span>}
      </h1>

      {subtitle && (
        <p className="mx-auto mt-6 max-w-xl text-balance text-ivory/70 sm:text-lg">{subtitle}</p>
      )}

      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <a
          href="#ultimos-lancamentos"
          className="rounded bg-terracotta px-7 py-3.5 text-sm font-medium text-ivory transition-transform hover:-translate-y-0.5"
        >
          Ouvir agora
        </a>
        <a
          href="/episodios"
          className="rounded border border-bronze/40 px-7 py-3.5 text-sm font-medium text-ivory/90 transition-colors hover:border-terracotta hover:text-terracotta"
        >
          Assistir episódios
        </a>
      </div>

      {platforms.length > 0 && (
        <p className="mt-8 text-xs uppercase tracking-widest text-ivory/40">
          Ouça também em {platforms.map((p: { name: string }) => p.name).join(" · ")}
        </p>
      )}

      <WaveDivider className="mt-14" />
    </section>
  );
}
