/**
 * Config do Next.js.
 *
 * `images.remotePatterns` é montado a partir de `STORAGE_PUBLIC_URL`
 * (variável já usada pelo storage — Sprint 2), lido em build time.
 * Isso permite usar `next/image` (otimização real, incluindo `sharp`
 * — Sprint 8) para capas vindas do Cloudflare R2, sem precisar editar
 * este arquivo manualmente sempre que o domínio do bucket mudar.
 *
 * Headers de segurança (CSP compatível com embeds Spotify/YouTube) e
 * redirects ficam para uma sprint futura de segurança, se necessário.
 *
 * @type {import('next').NextConfig}
 */
function buildRemotePatterns() {
  const patterns = [];
  const storagePublicUrl = process.env.STORAGE_PUBLIC_URL;

  if (storagePublicUrl) {
    try {
      const { protocol, hostname } = new URL(storagePublicUrl);
      patterns.push({ protocol: protocol.replace(":", ""), hostname });
    } catch {
      // STORAGE_PUBLIC_URL mal formada — ignora silenciosamente, não
      // deve quebrar o build por causa de uma env var de mídia.
    }
  }

  return patterns;
}

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Necessário para src/instrumentation.ts rodar no boot do servidor
    // (usado para aplicar o auto-bootstrap do admin — ver docs/AUTHORIZATION.md).
    instrumentationHook: true,
  },
  images: {
    remotePatterns: buildRemotePatterns(),
  },
};

export default nextConfig;
