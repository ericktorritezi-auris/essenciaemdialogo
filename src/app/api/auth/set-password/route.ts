import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { logAudit } from "@/lib/audit";

const setPasswordSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  password: z.string().min(12, "A senha precisa ter pelo menos 12 caracteres."),
});

/**
 * POST /api/auth/set-password
 *
 * Conclui o fluxo de primeiro acesso (após /api/auth/bootstrap) ou
 * uma futura recuperação de senha — mesmo mecanismo de token de uso
 * único, expirável, nunca a senha em si trafegando fora deste passo.
 */
export async function POST(request: NextRequest) {
  const parsed = setPasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  const { email, token, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  const genericError = NextResponse.json(
    { error: "Token inválido ou expirado." },
    { status: 400 },
  );

  if (
    !user ||
    !user.passwordSetTokenHash ||
    !user.passwordSetTokenExpiresAt ||
    user.passwordSetTokenExpiresAt < new Date()
  ) {
    return genericError;
  }

  const tokenValid = await verifyPassword(user.passwordSetTokenHash, token);
  if (!tokenValid) {
    return genericError;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(password),
      passwordSetTokenHash: null,
      passwordSetTokenExpiresAt: null,
    },
  });

  await logAudit({
    actorUserId: user.id,
    actorRole: user.role,
    action: "PASSWORD_SET",
    entityType: "User",
    entityId: user.id,
    entityLabel: user.email,
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({ ok: true });
}
