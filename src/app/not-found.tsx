import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { NotFoundContent } from "@/components/public/not-found-content";

/**
 * 404 na raiz do app (Sprint 12) — cobre URLs que não batem com nenhuma
 * rota conhecida (nem `(public)`, nem `/admin`). A versão dentro de
 * `(public)/not-found.tsx` cobre os casos mais comuns (ex.: slug de
 * episódio/artigo inexistente, via `notFound()` explícito); esta aqui
 * é o fallback para qualquer coisa fora disso. Como está fora do route
 * group, não ganha cabeçalho/rodapé automaticamente — inclui os dois
 * manualmente para manter a mesma identidade visual.
 *
 * `force-dynamic`: renderiza `<SiteHeader />`, que consulta o banco
 * (menu, plataformas, rádio) — não pode ser pré-gerado em build time
 * (banco não acessível no build). Mesma causa raiz já corrigida antes
 * (Home na Sprint 3, sitemap na Sprint 8, layout público na Sprint 11)
 * — desta vez esqueci de aplicar no arquivo novo. Registrando de novo
 * para mim mesmo: todo arquivo novo que renderiza SiteHeader/Footer ou
 * consulta prisma direto precisa nascer com isso, não só depois de
 * quebrar.
 */
export const dynamic = "force-dynamic";

export default function RootNotFound() {
  return (
    <>
      <SiteHeader />
      <NotFoundContent />
      <SiteFooter />
    </>
  );
}
