/**
 * Roda uma única vez, automaticamente, quando o processo do servidor
 * Next.js sobe (Railway inclusive). Não exige nenhum comando manual.
 *
 * Exige `experimental.instrumentationHook: true` no next.config.mjs
 * (nesta versão do Next ainda não é padrão — ver comentário lá).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureAdminBootstrapped } = await import("@/lib/auth/bootstrap-admin");
    await ensureAdminBootstrapped().catch((error) => {
      // Nunca derruba o boot do servidor por causa disso — só alerta.
      console.error("[bootstrap] falha ao garantir admin inicial", error);
    });

    const { ensureHomeSectionsSeeded, ensureNavigationSeeded, ensurePlatformsSeeded } = await import(
      "@/lib/content/seed-defaults"
    );
    await ensureHomeSectionsSeeded().catch((error) => {
      console.error("[seed] falha ao garantir seções da Home", error);
    });
    await ensureNavigationSeeded().catch((error) => {
      console.error("[seed] falha ao garantir menu padrão", error);
    });
    await ensurePlatformsSeeded().catch((error) => {
      console.error("[seed] falha ao garantir plataformas padrão", error);
    });
  }
}
