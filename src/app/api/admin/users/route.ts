import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ForbiddenError, UnauthorizedError } from "@/lib/auth/rbac";
import { hashPassword } from "@/lib/auth/password";
import { sanitizePlainText } from "@/lib/sanitize";
import { logAudit } from "@/lib/audit";

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(["ADMIN", "COLLABORATOR"]),
});

function generatePassword(): string {
  // Mesma abordagem do bootstrap do admin (Sprint 1) — 24 caracteres
  // em base64url, forte o suficiente para ser usada uma vez e trocada.
  return crypto.randomBytes(18).toString("base64url");
}

/** GET /api/admin/users — lista todos os usuários (admin only). */
export async function GET() {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Apenas administradores." }, { status: 403 });
    throw error;
  }

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ users });
}

/**
 * POST /api/admin/users — cria um novo usuário (Admin ou Colaborador).
 * Gera uma senha forte automaticamente e devolve em texto puro **só
 * nesta resposta** — nunca fica armazenada nem logada, é responsabilidade
 * de quem está criando anotar/repassar agora.
 */
export async function POST(request: NextRequest) {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Apenas administradores." }, { status: 403 });
    throw error;
  }

  const parsed = createUserSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }
  const { name, email, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "Já existe um usuário com esse e-mail." }, { status: 409 });
  }

  const generatedPassword = generatePassword();

  const user = await prisma.user.create({
    data: {
      name: sanitizePlainText(name),
      email: email.toLowerCase(),
      role,
      active: true,
      passwordHash: await hashPassword(generatedPassword),
    },
  });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "USER_CREATED",
    entityType: "User",
    entityId: user.id,
    entityLabel: user.email,
    afterState: { role: user.role, active: user.active },
  });

  return NextResponse.json(
    {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, active: user.active },
      generatedPassword,
    },
    { status: 201 },
  );
}
