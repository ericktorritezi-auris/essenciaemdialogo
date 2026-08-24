import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAnyRole, ForbiddenError, UnauthorizedError } from "@/lib/auth/rbac";
import { createPresignedUploadUrl, generateObjectKey } from "@/lib/storage/r2";
import { isAllowedMimeType, MAX_MEDIA_SIZE_BYTES } from "@/lib/storage/allowed-types";

const presignSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1),
  sizeBytes: z.number().int().positive().max(MAX_MEDIA_SIZE_BYTES),
});

/**
 * POST /api/admin/media/presign
 * Passo 1 do upload: valida tipo/tamanho declarados e devolve uma URL
 * assinada de PUT direto para o R2. A validação definitiva (magic
 * bytes reais) acontece depois, em /api/admin/media/confirm.
 */
export async function POST(request: NextRequest) {
  try {
    await requireAnyRole();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    throw error;
  }

  const parsed = presignSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { filename, contentType, sizeBytes } = parsed.data;

  if (!isAllowedMimeType(contentType)) {
    return NextResponse.json(
      { error: "Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF." },
      { status: 415 },
    );
  }
  if (sizeBytes > MAX_MEDIA_SIZE_BYTES) {
    return NextResponse.json({ error: "Arquivo excede o tamanho máximo (10 MB)." }, { status: 413 });
  }

  const key = generateObjectKey(filename);
  const uploadUrl = await createPresignedUploadUrl(key, contentType);

  return NextResponse.json({ key, uploadUrl });
}
