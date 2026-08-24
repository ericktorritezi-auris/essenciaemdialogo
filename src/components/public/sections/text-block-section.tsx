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

  return (
    <section
      className={`mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 ${
        variant === "highlight" ? "bg-charcoal" : ""
      }`}
    >
      {title && <h2 className="font-display text-2xl text-ivory sm:text-3xl">{title}</h2>}
      {body && <p className="mt-4 text-ivory/70">{body}</p>}
      {ctaLabel && (
        <a
          href={ctaHref}
          className="mt-6 inline-block rounded bg-terracotta px-6 py-3 text-sm font-medium text-ivory"
        >
          {ctaLabel}
        </a>
      )}
    </section>
  );
}
