/**
 * Converte uma URL pública do Spotify (episódio/show) para a URL de
 * embed oficial. Nunca faz scraping nem baixa áudio — só usa o iframe
 * oficial do próprio Spotify (Seção 11 do Prompt Mestre).
 *
 * Valida que a URL é realmente do domínio open.spotify.com antes de
 * gerar qualquer embed — nunca renderizar `src` de iframe a partir de
 * uma URL não validada (evita que alguém injete outra origem ali).
 */
export function getSpotifyEmbedUrl(spotifyUrl: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(spotifyUrl);
  } catch {
    return null;
  }

  if (parsed.hostname !== "open.spotify.com") {
    return null;
  }

  // Formato esperado: /episode/{id} ou /show/{id} (com ou sem locale, ex. /intl-pt/episode/...)
  const match = parsed.pathname.match(/\/(episode|show)\/([a-zA-Z0-9]+)/);
  if (!match) return null;

  const [, type, id] = match;
  return `https://open.spotify.com/embed/${type}/${id}`;
}

export function isValidSpotifyUrl(url: string): boolean {
  return getSpotifyEmbedUrl(url) !== null;
}
