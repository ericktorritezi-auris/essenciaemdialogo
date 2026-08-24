interface HeroSectionProps {
  content: Record<string, unknown>;
}

export function HeroSection({ content }: HeroSectionProps) {
  const title = typeof content.title === "string" ? content.title : "Essência em Diálogo";
  const highlight = typeof content.highlight === "string" ? content.highlight : null;
  const subtitle = typeof content.subtitle === "string" ? content.subtitle : null;

  return (
    <section className="px-4 py-20 text-center sm:px-6 sm:py-28">
      <h1 className="mx-auto max-w-3xl font-display text-3xl leading-tight text-ivory sm:text-5xl">
        {title}
        {highlight && <span className="block text-terracotta">{highlight}</span>}
      </h1>
      {subtitle && (
        <p className="mx-auto mt-6 max-w-xl text-ivory/70">{subtitle}</p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href="#ultimos-lancamentos" className="rounded bg-terracotta px-6 py-3 text-sm font-medium text-ivory">
          Ouvir agora
        </a>
        <a
          href="/episodios"
          className="rounded border border-bronze/40 px-6 py-3 text-sm font-medium text-ivory/90"
        >
          Assistir episódios
        </a>
      </div>
    </section>
  );
}
