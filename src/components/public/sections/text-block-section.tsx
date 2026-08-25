interface TextBlockSectionProps {
  content: Record<string, unknown>;
  variant?: "default" | "highlight";
}

export function TextBlockSection({ content, variant = "default" }: TextBlockSectionProps) {
  const title = typeof content.title === "string" ? content.title : null;
  const body = typeof content.body === "string" ? content.body : null;
  const ctaLabel = typeof content.ctaLabel === "string" ? content.ctaLabel : null;
  const ctaHref = typeof content.ctaHref === "string" ? content.ctaHref : "#";

  if (!title && !body) return null;

  const isHighlight = variant === "highlight";

  return (
    <section className={isHighlight ? "border-y border-bronze/15 bg-charcoal" : ""}>
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        {title && (
          <h2 className="text-balance font-display text-2xl leading-snug text-ivory sm:text-3xl">
            {title}
          </h2>
        )}
        {body && <p className="mx-auto mt-5 max-w-lg text-balance text-ivory/70">{body}</p>}
        {ctaLabel && (
          <a
            href={ctaHref}
            className="mt-7 inline-block rounded bg-terracotta px-7 py-3.5 text-sm font-medium text-ivory transition-transform hover:-translate-y-0.5"
          >
            {ctaLabel}
          </a>
        )}
      </div>
    </section>
  );
}
