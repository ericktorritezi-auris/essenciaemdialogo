import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { logAudit } from "@/lib/audit";

/**
 * Gera uma senha forte e legível o suficiente para ser lida no log e
 * digitada manualmente uma única vez (o admin deve trocá-la depois do
 * primeiro login, mas o sistema não bloqueia isso nesta fase — ver
 * docs/AUTHORIZATION.md).
 */
function generateInitialPassword(): string {
  // 24 caracteres em base64url — bem acima do mínimo de 12 exigido,
  // sem caracteres ambíguos de mais (base64url já evita `/`, `+`).
  return crypto.randomBytes(18).toString("base64url");
}

/**
 * Garante que existe um administrador. Roda automaticamente no boot
 * do servidor (src/instrumentation.ts) — não exige nenhuma chamada
 * manual de API nem comando de terminal.
 *
 * Idempotente: se já existe QUALQUER admin, não faz nada. Se as
 * variáveis de bootstrap não estiverem configuradas, também não faz
 * nada (silencioso — evita quebrar o boot por falta de env var em
 * ambientes que não precisam disso, ex.: testes locais).
 *
 * A senha inicial não é enviada por e-mail (ainda não há SMTP
 * configurado — Seção 25 do Plano Técnico) nem devolvida por nenhuma
 * API. Ela é impressa UMA VEZ no log de boot da aplicação (visível no
 * painel do Railway, que só o dono do projeto acessa) — é o mesmo
 * padrão usado por diversas ferramentas self-hosted para o primeiro
 * acesso administrativo.
 */
export async function ensureAdminBootstrapped(): Promise<void> {
  const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL;
  if (!adminEmail) {
    console.warn(
      "[bootstrap] ADMIN_BOOTSTRAP_EMAIL não configurado — pulando criação automática do admin.",
    );
    return;
  }

  const existingAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (existingAdmin) {
    return; // já existe um admin — nada a fazer, idempotente
  }

  const initialPassword = generateInitialPassword();

  const admin = await prisma.user.create({
    data: {
      name: "Administrador",
      email: adminEmail.toLowerCase(),
      role: "ADMIN",
      active: true,
      passwordHash: await hashPassword(initialPassword),
    },
  });

  await logAudit({
    actorUserId: admin.id,
    actorRole: "ADMIN",
    action: "ADMIN_AUTO_BOOTSTRAPPED",
    entityType: "User",
    entityId: admin.id,
    entityLabel: admin.email,
    metadata: { trigger: "server_startup" },
  });

  // Log de boot — único lugar onde esta senha aparece. Formatado para
  // ser fácil de encontrar rolando os logs do Railway.
  console.log(
    [
      "",
      "================================================================",
      " ADMIN CRIADO AUTOMATICAMENTE — Essência em Diálogo",
      "================================================================",
      ` E-mail:  ${admin.email}`,
      ` Senha:   ${initialPassword}`,
      "",
      " Guarde esta senha agora — ela não aparece de novo em lugar",
      " nenhum. Recomendado: entre em /login e troque a senha no",
      " primeiro acesso.",
      "================================================================",
      "",
    ].join("\n"),
  );
}
