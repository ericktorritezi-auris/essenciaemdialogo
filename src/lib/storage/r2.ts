import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Adaptador de storage isolado (Seção 10 do Plano Técnico — trocar de
 * provedor não deve exigir reescrever o resto da aplicação). Hoje é
 * Cloudflare R2, S3-compatible; todo o resto do código fala só com as
 * funções exportadas aqui, nunca importa `@aws-sdk/*` diretamente.
 */

function getClient(): S3Client {
  const endpoint = process.env.STORAGE_ENDPOINT;
  const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Storage não configurado — verifique STORAGE_ENDPOINT / STORAGE_ACCESS_KEY_ID / STORAGE_SECRET_ACCESS_KEY.",
    );
  }

  return new S3Client({
    region: "auto", // R2 não usa região real, mas o SDK exige o campo
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function getBucket(): string {
  const bucket = process.env.STORAGE_BUCKET;
  if (!bucket) throw new Error("STORAGE_BUCKET não configurado.");
  return bucket;
}

/**
 * Gera uma URL assinada de upload direto (PUT) — o arquivo vai do
 * navegador do usuário direto para o R2, sem passar pelo servidor
 * Next.js (evita gastar banda/memória da aplicação com upload de
 * mídia pesada).
 */
export async function createPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 300,
): Promise<string> {
  const client = getClient();
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/**
 * Confirma que o objeto realmente existe no bucket após o upload
 * direto do client, e devolve o tamanho real reportado pelo R2 —
 * nunca confiar apenas no `size` que o navegador informou.
 */
export async function headObject(
  key: string,
): Promise<{ exists: boolean; sizeBytes?: number; contentType?: string }> {
  const client = getClient();
  try {
    const result = await client.send(
      new HeadObjectCommand({ Bucket: getBucket(), Key: key }),
    );
    return {
      exists: true,
      sizeBytes: result.ContentLength,
      contentType: result.ContentType,
    };
  } catch {
    return { exists: false };
  }
}

export async function deleteObject(key: string): Promise<void> {
  const client = getClient();
  await client.send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }));
}

/**
 * Lê só os primeiros bytes do objeto (via Range GET) — o suficiente
 * para checar magic bytes reais sem baixar o arquivo inteiro.
 */
export async function readObjectHeadBytes(
  key: string,
  byteCount = 4100,
): Promise<Buffer> {
  const client = getClient();
  const result = await client.send(
    new GetObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Range: `bytes=0-${byteCount - 1}`,
    }),
  );
  const body = await result.Body?.transformToByteArray();
  return Buffer.from(body ?? []);
}

/** Monta a URL pública final de entrega (CDN), a partir da key do objeto. */
export function getPublicUrl(key: string): string {
  const base = process.env.STORAGE_PUBLIC_URL;
  if (!base) throw new Error("STORAGE_PUBLIC_URL não configurado.");
  return `${base.replace(/\/$/, "")}/${key}`;
}

/** Gera uma key única e organizada por data — evita colisão de nomes. */
export function generateObjectKey(originalFilename: string): string {
  const ext = originalFilename.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const date = new Date();
  const datePrefix = `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  const uniqueId = crypto.randomUUID();
  return `media/${datePrefix}/${uniqueId}.${ext}`;
}
