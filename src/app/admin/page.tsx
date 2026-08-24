import { getCurrentUser } from "@/lib/auth/current-user";

/**
 * Placeholder de dashboard (Sprint 1). Indicadores editoriais reais
 * (contagens, gráficos) entram junto com os módulos de conteúdo
 * (Sprints 2, 4, 5).
 */
export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  return (
    <main className="p-8">
      <h1 className="font-display text-2xl">Painel administrativo</h1>
      <p className="mt-2 text-ivory/70">
        Olá, {user?.name} — papel: {user?.role}
      </p>
      <p className="mt-8 text-sm text-ivory/50">
        CMS em construção — Sprint 1 (autenticação, RBAC, bootstrap).
      </p>
    </main>
  );
}
