/**
 * Renderiza dados estruturados schema.org como JSON-LD. Usado nas
 * páginas individuais de Episódio/Artigo/Notícia/Evento (Seção 20 do
 * Prompt Mestre — SEO estruturado por conteúdo).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify escapa aspas/controle — o conteúdo vem de campos
      // já sanitizados no banco (título, descrição), não de HTML cru.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
