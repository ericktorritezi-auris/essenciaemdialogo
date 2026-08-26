import Link from "next/link";

/**
 * 404 na raiz do app (Sprint 12) — cobre URLs que não batem com nenhuma
 * rota conhecida (nem `(public)`, nem `/admin`). A versão dentro de
 * `(public)/not-found.tsx` cobre os casos mais comuns (ex.: slug de
 * episódio/artigo inexistente, via `notFound()` explícito) e já tem
 * cabeçalho/rodapé completos via o layout do grupo.
 *
 * Esta versão da raiz é deliberadamente MAIS SIMPLES — sem
 * `<SiteHeader />`/`<SiteFooter />`, sem nenhuma consulta ao banco.
 *
 * Motivo (histórico do incidente, Sprint 12): tentei antes renderizar
 * o cabeçalho aqui também, com `export const dynamic = "force-dynamic"`
 * para evitar pré-geração em build time — mas o build continuou
 * falhando mesmo assim. A rota especial `_not-found` do Next.js parece
 * não respeitar esse export do mesmo jeito que uma página normal (é
 * tratada de forma diferente internamente pelo framework, para poder
 * gerar um shell estático de 404 mesmo em apps majoritariamente
 * dinâmicos). Resultado: mesmo marcado como dinâmico, o Next tentava
 * avaliar esse arquivo em build time, batia no banco, e quebrava o
 * deploy. A correção definitiva é não depender do banco aqui em
 * hipótese nenhuma, não tentar forçar o comportamento de novo.
 */
export default function RootNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-warm-black px-4 text-center sm:px-6">
      <p className="font-display text-6xl text-terracotta">404</p>
      <h1 className="mt-4 font-display text-2xl text-ivory">Essa página não existe</h1>
      <p className="mt-3 text-ivory/60">
        O link pode estar desatualizado, ou o conteúdo pode ter sido removido.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded bg-terracotta px-7 py-3.5 text-sm font-medium text-ivory"
      >
        Voltar para o início
      </Link>
    </main>
  );
}
