import { getEnabledHomeSections } from "@/lib/public/home-data";
import { renderHomeSection } from "@/components/public/home-section-renderer";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

/**
 * Home dinâmica (Sprint 3) — nenhuma seção hardcoded aqui. A lista de
 * seções, a ordem e o texto de cada uma vêm do banco (HomeSection),
 * editável em /admin/home. Este arquivo só sabe iterar e delegar para
 * o componente certo por `key` (home-section-renderer.tsx).
 *
 * `force-dynamic`: o banco não está acessível durante o build (só em
 * runtime), e o conteúdo é administrável a qualquer momento — não faz
 * sentido pré-gerar isso estaticamente no build. SSG/ISR com
 * revalidação sob demanda ao publicar é otimização prevista para a
 * Sprint 7 (Performance); por ora, renderização dinâmica a cada
 * request é o comportamento correto e mais simples.
 */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const sections = await getEnabledHomeSections();

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        {sections.map((section) => (
          <div key={section.key}>{renderHomeSection(section)}</div>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
