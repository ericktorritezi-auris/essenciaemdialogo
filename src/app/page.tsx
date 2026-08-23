/**
 * Placeholder de scaffold (Sprint 0).
 * O design definitivo da Home — hero, Últimos Lançamentos, seções
 * configuráveis — é escopo da Sprint 3 (Frontend institucional/Home),
 * seguindo o Design System definido nesta sprint.
 */
export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-xl">
        <h1 className="font-display text-3xl md:text-5xl text-ivory">
          Essência em Diálogo
        </h1>
        <p className="mt-4 text-bronze">
          Duas perspectivas. Um tema. Uma conversa além da superfície.
        </p>
        <p className="mt-8 text-sm text-ivory/60">
          Ambiente em construção — Sprint 0 (arquitetura, banco, RBAC).
        </p>
      </div>
    </main>
  );
}
