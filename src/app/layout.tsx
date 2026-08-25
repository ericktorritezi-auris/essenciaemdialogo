import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

/**
 * Fontes da marca — auto-hospedadas no próprio projeto (arquivos em
 * `public/fonts/`, extraídos dos pacotes @fontsource/* na Sprint 8),
 * carregadas via `next/font/local`. Até a Sprint 8, os tokens só
 * referenciavam "Playfair Display"/"Montserrat" pelo nome sem nenhum
 * carregamento real — o site inteiro rodava com a fonte de fallback
 * (Georgia) sem ninguém notar, porque também é serifada.
 *
 * Deliberadamente NÃO usamos `next/font/google`: esse carregador baixa
 * os arquivos do Google em *build time* — ou seja, todo deploy passaria
 * a depender do build conseguir alcançar fonts.googleapis.com. Com os
 * arquivos já dentro do repositório, o build nunca depende de mais
 * nenhum serviço externo para isso.
 */
const playfairDisplay = localFont({
  src: [
    { path: "../../public/fonts/playfair-display-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/playfair-display-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-display-loaded",
  display: "swap",
});

const montserrat = localFont({
  src: [
    { path: "../../public/fonts/montserrat-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/montserrat-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/montserrat-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-body-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Essência em Diálogo",
  description:
    "Duas perspectivas. Um tema. Uma conversa além da superfície.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "Essência em Diálogo",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D0C0B",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${playfairDisplay.variable} ${montserrat.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
