import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fileTypeFromBuffer } from "file-type";
import { prisma } from "@/lib/prisma";
import { requireAnyRole, ForbiddenError, UnauthorizedError } from "@/lib/auth/rbac";
import { headObject, readObjectHeadBytes, getPublicUrl, deleteObject } from "@/lib/storage/r2";
import { isAllowedMimeType, MAX_MEDIA_SIZE_BYTES } from "@/lib/storage/allowed-types";
import { sanitizePlainText } from "@/lib/sanitize";
import { logAudit } from "@/lib/audit";

const confirmSchema = z.object({
  key: z.string().min(1),
  altText: z.string().max(300).optional(),
  caption: z.string().max(500).optional(),
});

/**
 * POST /api/admin/media/confirm
 * Passo 2 do upload: depois que o client fez o PUT direto no R2 usando
 * a URL assinada, este endpoint verifica de verdade o que foi parar
 * lá — existência, tamanho real, e o tipo real do arquivo via magic
 * bytes (nunca confia no Content-Type que o navegador declarou).
 * Só então cria o registro Media.
 */
export async function POST(request: NextRequest) {
  let actor;
  try {
    actor = await requireAnyRole();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    throw error;
  }

  const parsed = confirmSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const { key, altText, caption } = parsed.data;

  const head = await headObject(key);
  if (!head.exists) {
    return NextResponse.json({ error: "Upload não encontrado no storage." }, { status: 404 });
  }
  if (!head.sizeBytes || head.sizeBytes > MAX_MEDIA_SIZE_BYTES) {
    await deleteObject(key).catch(() => {});
    return NextResponse.json({ error: "Arquivo excede o tamanho máximo." }, { status: 413 });
  }

  // Checagem real de magic bytes — a fonte de verdade, não o Content-Type declarado.
  const headBytes = await readObjectHeadBytes(key);
  const detected = await fileTypeFromBuffer(headBytes);

  if (!detected || !isAllowedMimeType(detected.mime)) {
    await deleteObject(key).catch(() => {});
    return NextResponse.json(
      { error: "Conteúdo do arquivo não corresponde a um tipo de imagem permitido." },
      { status: 415 },
    );
  }

  const media = await prisma.media.create({
    data: {
      url: getPublicUrl(key),
      storageKey: key,
      mimeType: detected.mime,
      sizeBytes: head.sizeBytes,
      altText: altText ? sanitizePlainText(altText) : null,
      caption: caption ? sanitizePlainText(caption) : null,
    },
  });

  await logAudit({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: "MEDIA_UPLOADED",
    entityType: "Media",
    entityId: media.id,
    entityLabel: key,
    afterState: { mimeType: media.mimeType, sizeBytes: media.sizeBytes },
  });

  return NextResponse.json({ media });
}
