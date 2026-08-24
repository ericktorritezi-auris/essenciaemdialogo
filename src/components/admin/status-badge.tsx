"use client";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho",
  IN_REVIEW: "Em revisão",
  SCHEDULED: "Agendado",
  PUBLISHED: "Publicado",
  PAUSED: "Pausado",
  ARCHIVED: "Arquivado",
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-ivory/10 text-ivory/70",
  IN_REVIEW: "bg-bronze/20 text-bronze",
  SCHEDULED: "bg-petrol text-ivory",
  PUBLISHED: "bg-terracotta/20 text-terracotta",
  PAUSED: "bg-ivory/10 text-ivory/50",
  ARCHIVED: "bg-warm-black text-ivory/40",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
        STATUS_STYLES[status] ?? "bg-ivory/10 text-ivory/70"
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
