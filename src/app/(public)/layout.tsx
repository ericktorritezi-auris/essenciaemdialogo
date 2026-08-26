import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

/**
 * Layout compartilhado de todas as páginas públicas (Sprint 11).
 *
 * Antes desta sprint, cada uma das 13 páginas públicas renderizava o
 * próprio `<SiteHeader />` (e a `<OnAirBar />` dentro dele) individual-
 * mente — toda navegação destruía e recriava a barra do zero, o que
 * tornava impossível a rádio continuar tocando ao trocar de página.
 *
 * Layouts do Next.js App Router permanecem montados durante a
 * navegação entre rotas filhas — é o mecanismo nativo para isso, o
 * mesmo padrão usado por players persistentes (Spotify Web, SoundCloud).
 * Colocar o cabeçalho aqui, uma única vez, é o que resolve o problema.
 *
 * `force-dynamic`: o cabeçalho consulta o banco (menu, plataformas,
 * configuração do rádio) — não pode ser pré-gerado em build time
 * (banco não acessível no build). Mesma causa raiz já corrigida duas
 * vezes antes (Home na Sprint 3, sitemap na Sprint 8) — desta vez
 * aplicada preventivamente, não depois de quebrar.
 */
export const dynamic = "force-dynamic";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
