import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit, clearRateLimit } from "@/lib/auth/rate-limit";
import { logAudit } from "@/lib/audit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? undefined;

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const rateLimitKey = `${ip}:${email.toLowerCase()}`;

  const rateLimit = checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)) } },
    );
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  // Mensagem genérica em qualquer cenário de falha — nunca revelar se
  // foi o e-mail ou a senha que estava errada (evita enumeração de contas).
  const genericError = NextResponse.json(
    { error: "E-mail ou senha inválidos." },
    { status: 401 },
  );

  if (!user || !user.active || user.deletedAt) {
    await logAudit({
      action: "LOGIN_FAILED",
      entityType: "User",
      entityLabel: email,
      metadata: { reason: "user_not_found_or_inactive" },
      ip,
      userAgent,
    });
    return genericError;
  }

  const validPassword = await verifyPassword(user.passwordHash, password);
  if (!validPassword) {
    await logAudit({
      actorUserId: user.id,
      actorRole: user.role,
      action: "LOGIN_FAILED",
      entityType: "User",
      entityId: user.id,
      entityLabel: user.email,
      metadata: { reason: "invalid_password" },
      ip,
      userAgent,
    });
    return genericError;
  }

  clearRateLimit(rateLimitKey);

  // Regenera a sessão no login — evita session fixation (Seção 17).
  const session = await getSession();
  session.userId = user.id;
  await session.save();

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await logAudit({
    actorUserId: user.id,
    actorRole: user.role,
    action: "LOGIN_SUCCESS",
    entityType: "User",
    entityId: user.id,
    entityLabel: user.email,
    ip,
    userAgent,
  });

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
