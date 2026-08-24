/**
 * Allowlist de MIME types aceitos no upload de mídia (Seção 17 do
 * Plano Técnico — validação por magic bytes, nunca só por extensão).
 */
export const ALLOWED_MEDIA_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AllowedMediaMimeType = (typeof ALLOWED_MEDIA_MIME_TYPES)[number];

export const MAX_MEDIA_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function isAllowedMimeType(mime: string): mime is AllowedMediaMimeType {
  return (ALLOWED_MEDIA_MIME_TYPES as readonly string[]).includes(mime);
}
