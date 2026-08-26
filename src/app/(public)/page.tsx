import { getEnabledHomeSections } from "@/lib/public/home-data";
import { renderHomeSection } from "@/components/public/home-section-renderer";

/**
 * Home dinâmica (Sprint 3) — nenhuma seção hardcoded aqui. A lista de
 * seções, a ordem e o texto de cada uma vêm do banco (HomeSection),
 * editável em /admin/home. Este arquivo só sabe iterar e delegar para
 * o componente certo por `key` (home-section-renderer.tsx).
 *
 * Cabeçalho/rodapé agora vêm de `(public)/layout.tsx` (Sprint 11) —
 * não são mais renderizados por página individual.
 *
 * `force-dynamic`: o banco não está acessível durante o build (só em
 * runtime), e o conteúdo é administrável a qualquer momento.
 */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const sections = await getEnabledHomeSections();

  return (
    <main id="main-content">
      {sections.map((section) => (
        <div key={section.key}>{renderHomeSection(section)}</div>
      ))}
    </main>
  );
}
