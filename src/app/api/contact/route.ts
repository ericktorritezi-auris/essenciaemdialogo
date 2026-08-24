import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sanitizePlainText } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { logAudit } from "@/lib/audit";

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  question: z.string().min(10).max(2000),
  consent: z.literal(true, { errorMap: () => ({ message: "É preciso aceitar os termos para enviar." }) }),
  // Honeypot: campo invisível para humanos, só bots preenchem. Se vier
  // preenchido, finge sucesso mas descarta — não dá pista pro bot de
  // que foi detectado (Seção 15 do Prompt Mestre — anti-spam).
  website: z.string().optional(),
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

  const parsed = contactSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }
  const { name, email, question, website } = parsed.data;

  // Honeypot preenchido = bot. Responde sucesso genérico sem gravar nada.
  if (website && website.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  // Rate limit por IP — evita flood do formulário (reaproveita o
  // limitador já usado no login, mesma limitação de single-instance
  // documentada em src/lib/auth/rate-limit.ts).
  const rateLimit = checkRateLimit(`contact:${ip}`);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas mensagens enviadas. Tente novamente mais tarde." },
      { status: 429 },
    );
  }

  const submission = await prisma.contactSubmission.create({
    data: {
      name: sanitizePlainText(name),
      email: email.toLowerCase(),
      question: sanitizePlainText(question),
      consentedAt: new Date(),
    },
  });

  await logAudit({
    action: "CONTACT_SUBMISSION_RECEIVED",
    entityType: "ContactSubmission",
    entityId: submission.id,
    entityLabel: submission.name,
    ip,
  });

  return NextResponse.json({ ok: true });
}
