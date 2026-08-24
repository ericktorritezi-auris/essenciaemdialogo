import { ContactForm } from "./contact-form";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

export const dynamic = "force-dynamic";

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl text-ivory">Pergunta ao público</h1>
        <p className="mt-4 text-ivory/70">
          Tem uma pergunta ou tema que gostaria de ver no próximo episódio? Fale com a gente.
        </p>

        <div
          role="note"
          className="mt-6 rounded border border-bronze/30 bg-charcoal p-4 text-sm text-ivory/60"
        >
          Este formulário é um canal editorial para sugestões de tema — não é um canal de
          atendimento terapêutico, aconselhamento clínico ou emergência. Se você está passando
          por uma crise, procure ajuda profissional ou o CVV (188).
        </div>

        <div className="mt-8">
          <ContactForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
