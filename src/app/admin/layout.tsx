import { redirect } from "next/navigation";
import { requireAnyRole, UnauthorizedError } from "@/lib/auth/rbac";
import { AdminNav } from "@/components/admin/admin-nav";

/**
 * Fronteira de segurança real do painel administrativo (Seção 8/95).
 * Roda no servidor, revalida papel/status no banco a cada acesso —
 * o middleware (src/middleware.ts) só evita uma ida desnecessária ao
 * banco quando nem cookie existe; esta camada é quem decide de fato.
 *
 * `force-dynamic` explícito: toda a área /admin já seria dinâmica
 * implicitamente (o uso de `cookies()` dentro de requireAnyRole força
 * isso automaticamente no Next.js), mas deixamos explícito para não
 * depender desse comportamento implícito se a autenticação mudar no
 * futuro — nenhuma tela administrativa deve ser pré-gerada em build,
 * já que todo o conteúdo depende do banco e de quem está logado.
 */
export const dynamic = "force-dynamic";

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

  return (
    <div className="min-h-screen bg-warm-black text-ivory">
      <AdminNav />
      {children}
    </div>
  );
}
