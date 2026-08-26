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
 */
export default function RootNotFound() {
  return (
    <>
      <SiteHeader />
      <NotFoundContent />
      <SiteFooter />
    </>
  );
}
