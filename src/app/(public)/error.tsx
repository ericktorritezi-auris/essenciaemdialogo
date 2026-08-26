"use client";

/**
 * Tela de erro (Sprint 12) — captura falhas de execução na área
 * pública. Precisa ser Client Component (convenção do Next.js para
 * error boundaries). Não usa SiteHeader/SiteFooter de propósito: se o
 * erro tiver origem no próprio banco/dados que o cabeçalho consulta
 * (menu, plataformas), tentar renderizar o cabeçalho de novo aqui
 * poderia disparar o mesmo erro outra vez.
 */
export default function PublicError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center bg-warm-black px-4 text-center sm:px-6">
      <p className="font-display text-2xl text-ivory">Algo deu errado</p>
      <p className="mt-3 text-ivory/60">
        Não conseguimos carregar esta página agora. Tente novamente em instantes.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 rounded bg-terracotta px-7 py-3.5 text-sm font-medium text-ivory"
      >
        Tentar novamente
      </button>
    </main>
  );
}
