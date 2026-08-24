/**
 * Chaves das seções possíveis da Home (Seção 3 do Prompt Mestre).
 * Única fonte de verdade — o seed inicial, o admin e o renderizador
 * público leem daqui, nunca duplicam a lista em outro lugar.
 */
export const HOME_SECTION_KEYS = [
  "HERO",
  "LATEST_RELEASES",
  "FEATURED_EPISODE",
  "RECENT_EPISODES",
  "MANIFESTO",
  "ABOUT",
  "HOSTS",
  "EDITORIALS",
  "EVENTS",
  "AUDIENCE_QUESTION",
  "PLATFORMS",
  "FINAL_CTA",
] as const;

export type HomeSectionKey = (typeof HOME_SECTION_KEYS)[number];

export const HOME_SECTION_LABELS: Record<HomeSectionKey, string> = {
  HERO: "Hero (topo)",
  LATEST_RELEASES: "Últimos Lançamentos",
  FEATURED_EPISODE: "Episódio em destaque",
  RECENT_EPISODES: "Episódios recentes",
  MANIFESTO: "Manifesto",
  ABOUT: "Sobre",
  HOSTS: "Apresentadores",
  EDITORIALS: "Editoriais (artigos em destaque)",
  EVENTS: "Próximos eventos",
  AUDIENCE_QUESTION: "Pergunta ao público",
  PLATFORMS: "Plataformas",
  FINAL_CTA: "Chamada final",
};
