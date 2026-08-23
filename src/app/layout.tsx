import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Essência em Diálogo",
  description:
    "Duas perspectivas. Um tema. Uma conversa além da superfície.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <a href="#main-content" className="skip-link">
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
