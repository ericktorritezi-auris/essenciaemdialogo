import sanitizeHtml from "sanitize-html";

/**
 * Sanitização server-side obrigatória de todo conteúdo rich text
 * (Seção 6/17 do Plano Técnico — nunca confiar apenas no client).
 *
 * V1 usa um editor simples (textarea) em vez do Tiptap/WYSIWYG completo
 * previsto na stack (decisão deliberada de escopo desta sprint — ver
 * docs/CMS.md). Mesmo assim, o texto passa por aqui antes de ir para o
 * banco: o usuário pode digitar HTML básico (ex.: `<b>`, `<a>`) e ele é
 * filtrado por allowlist, nunca armazenado cru.
 */
export function sanitizeContentHtml(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u", "s",
      "h2", "h3", "h4", "ul", "ol", "li",
      "blockquote", "a", "img",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt"],
    },
    allowedSchemes: ["https"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}

/** Para campos de texto puro (resumo, alt text) — remove QUALQUER tag. */
export function sanitizePlainText(input: string): string {
  return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} }).trim();
}
