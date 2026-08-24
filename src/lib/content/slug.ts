/**
 * Gera um slug a partir de um título — remove acentos, minúsculo,
 * hífens em vez de espaço/pontuação. Usado como sugestão inicial;
 * o usuário pode editar antes de salvar (Seção 42 — slug amigável).
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug) && slug.length <= 200;
}
