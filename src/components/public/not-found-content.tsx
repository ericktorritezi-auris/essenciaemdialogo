import Link from "next/link";

export function NotFoundContent() {
  return (
    <main id="main-content" className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center sm:px-6">
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
