/**
 * Config inicial (Sprint 0).
 * Ajustes de imagens (domínios do object storage R2), headers de segurança
 * (CSP compatível com embeds Spotify/YouTube) e redirects entram nas
 * sprints de Mídia (Sprint 2) e Segurança (Sprint 8), conforme o plano.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Placeholder — domínio real do bucket R2 entra aqui na Sprint 2.
      // { protocol: "https", hostname: "<seu-bucket>.r2.dev" },
    ],
  },
};

export default nextConfig;
