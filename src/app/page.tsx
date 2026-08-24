import { getEnabledHomeSections } from "@/lib/public/home-data";
import { renderHomeSection } from "@/components/public/home-section-renderer";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

/**
 * Home dinâmica (Sprint 3) — nenhuma seção hardcoded aqui. A lista de
 * seções, a ordem e o texto de cada uma vêm do banco (HomeSection),
 * editável em /admin/home. Este arquivo só sabe iterar e delegar para
 * o componente certo por `key` (home-section-renderer.tsx).
 */
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
