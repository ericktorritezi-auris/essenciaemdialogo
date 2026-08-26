import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/public/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Termos de Uso",
  path: "/termos",
});

/**
 * Conteúdo vem do banco (`LegalPage`) — mesma correção da Sprint 12
 * aplicada em (public)/privacidade/page.tsx. Editável em
 * /admin/legal-pages.
 */
export default async function TermsOfUsePage() {
  const page = await prisma.legalPage.findUnique({ where: { key: "terms" } });
  if (!page) notFound();

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      {!page.reviewedAt && (
        <div className="mb-8 rounded border border-terracotta/40 bg-charcoal p-4 text-sm text-ivory/70">
          Esta página é uma minuta técnica, ainda sem revisão jurídica profissional. Não deve ser
          considerada texto legal definitivo até essa revisão acontecer.
        </div>
      )}

      <h1 className="font-display text-3xl text-ivory sm:text-4xl">{page.title}</h1>
      <p className="mt-2 text-sm text-ivory/40">
        Última atualização: {page.updatedAt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
      </p>

      <div
        className="mt-8 space-y-4 text-ivory/80 [&_h2]:font-display [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:text-ivory [&_strong]:text-ivory"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </main>
  );
}
