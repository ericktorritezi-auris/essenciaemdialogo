import type { Metadata } from "next";

/**
 * Base URL pública do site, para canonical/OG absolutos. Se `APP_URL`
 * não estiver configurado (ambiente local, por exemplo), cai para um
 * placeholder que não quebra o build — só não gera URLs corretas.
 */
export function getSiteUrl(): string {
  return process.env.APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}

interface BuildMetadataInput {
  title: string;
  description?: string | null;
  path: string;
  ogImageUrl?: string | null;
  type?: "website" | "article";
  noIndex?: boolean;
}

/**
 * Monta um objeto Metadata consistente — usado por toda página pública
 * (listagens e páginas individuais). Título sempre com o sufixo da
 * marca, description com fallback genérico, canonical sempre absoluto,
 * Open Graph com imagem quando disponível.
 */
export function buildMetadata({
  title,
  description,
  path,
  ogImageUrl,
  type = "website",
  noIndex = false,
}: BuildMetadataInput): Metadata {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}${path}`;
  const fullTitle = `${title} — Essência em Diálogo`;
  const desc =
    description?.trim() ||
    "Duas perspectivas. Um tema. Uma conversa além da superfície.";

  return {
    title: fullTitle,
    description: desc,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: "Essência em Diálogo",
      locale: "pt_BR",
      type,
      ...(ogImageUrl ? { images: [{ url: ogImageUrl }] } : {}),
    },
    twitter: {
      card: ogImageUrl ? "summary_large_image" : "summary",
      title: fullTitle,
      description: desc,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  };
}
