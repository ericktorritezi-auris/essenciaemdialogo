import { redirect } from "next/navigation";
import { requireAnyRole, UnauthorizedError } from "@/lib/auth/rbac";

/**
 * Fronteira de segurança real do painel administrativo (Seção 8/95).
 * Roda no servidor, revalida papel/status no banco a cada acesso —
 * o middleware (src/middleware.ts) só evita uma ida desnecessária ao
 * banco quando nem cookie existe; esta camada é quem decide de fato.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAnyRole();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect("/login");
    }
    // ForbiddenError não deveria ocorrer aqui (qualquer papel autenticado
    // passa), mas por segurança também redireciona em vez de vazar detalhe.
    redirect("/login");
  }

  return <div className="min-h-screen bg-warm-black text-ivory">{children}</div>;
}
