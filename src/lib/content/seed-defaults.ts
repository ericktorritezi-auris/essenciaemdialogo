import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { HOME_SECTION_KEYS, type HomeSectionKey } from "@/lib/content/home-sections";

/**
 * Conteúdo textual inicial — é só um ponto de partida editável pelo
 * admin depois (/admin/home). Nada disso é hardcoded na renderização
 * pública: a Home lê sempre do banco, nunca destes valores diretamente.
 */
const DEFAULT_CONTENT: Partial<Record<HomeSectionKey, Record<string, unknown>>> = {
  HERO: {
    title: "Duas perspectivas. Um tema.",
    highlight: "Uma conversa além da superfície.",
    subtitle:
      "Conversas profundas sobre emoções, relacionamentos, escolhas, padrões, propósito e as perguntas que não cabem em respostas prontas.",
  },
  MANIFESTO: {
    title: "Manifesto",
    body:
      "Um diálogo profundo, humano e transformador entre duas visões complementares. Toda semana, um tema. Duas perspectivas. Muitas camadas. Um só objetivo: levar consciência para a vida real.",
  },
  ABOUT: {
    title: "Quem somos",
    body:
      "A cada episódio, Erick Torritezi e Iolanda Reis colocam diferentes olhares em diálogo sobre questões que atravessam a vida real. Não se trata de ter todas as respostas — é sobre fazer as perguntas certas.",
  },
  HOSTS: {
    title: "Apresentadores",
    hosts: [
      {
        name: "Erick Torritezi",
        role: "Psicanalista e Psicoterapeuta Integrativo",
        photoMediaId: null,
      },
      {
        name: "Iolanda Reis",
        role: "Terapeuta Ocupacional e Arteterapeuta Junguiana",
        photoMediaId: null,
      },
    ],
  },
  EDITORIALS: { title: "Editoriais" },
  EVENTS: { title: "Próximos eventos" },
  PLATFORMS: { title: "Ouça também em" },
  AUDIENCE_QUESTION: {
    title: "Pergunta ao público",
    body: "Tem uma pergunta ou tema que gostaria de ver no próximo episódio? Fale com a gente.",
    ctaLabel: "Enviar pergunta",
  },
  FINAL_CTA: {
    title: "Aqui, ideias se encontram, perspectivas se expandem e consciência se transforma.",
    ctaLabel: "Ouvir agora",
  },
};

/**
 * Garante que toda seção da Home existe no banco (idempotente — cria
 * só o que faltar, nunca sobrescreve o que já existe/foi editado).
 * Roda automaticamente no boot do servidor (src/instrumentation.ts).
 */
export async function ensureHomeSectionsSeeded(): Promise<void> {
  const existing = await prisma.homeSection.findMany({ select: { key: true } });
  const existingKeys = new Set(existing.map((s: { key: string }) => s.key));

  const missing = HOME_SECTION_KEYS.filter((key) => !existingKeys.has(key));
  if (missing.length === 0) return;

  await prisma.homeSection.createMany({
    data: missing.map((key) => ({
      key,
      // Seções que dependem de módulos ainda não construídos (Episódios
      // = Sprint 4) começam desabilitadas — evita espaço vazio no ar
      // até o conteúdo existir de verdade.
      enabled: key !== "FEATURED_EPISODE" && key !== "RECENT_EPISODES",
      order: HOME_SECTION_KEYS.indexOf(key),
      content: (DEFAULT_CONTENT[key] ?? {}) as Prisma.InputJsonValue,
    })),
  });

  console.log(`[seed] ${missing.length} seção(ões) da Home criada(s) com valores padrão.`);
}

interface DefaultNavItem {
  label: string;
  href: string;
  enabled: boolean;
}

/**
 * Itens do menu que dependem de páginas ainda não construídas entram
 * desabilitados — o admin liga cada um conforme a sprint correspondente
 * (Episódios/Sprint 4, Artigos-Notícias-Eventos/Sprint 5, Rádio/Sprint 6,
 * Contato/Sprint 6) vai ao ar, sem precisar de deploy para isso.
 */
const DEFAULT_NAV_ITEMS: DefaultNavItem[] = [
  { label: "Início", href: "/", enabled: true },
  { label: "Quem Somos", href: "/quem-somos", enabled: false },
  { label: "Episódios", href: "/episodios", enabled: false },
  { label: "Artigos", href: "/artigos", enabled: false },
  { label: "Notícias", href: "/noticias", enabled: false },
  { label: "Eventos", href: "/eventos", enabled: false },
  { label: "Rádio / On Air", href: "/radio", enabled: false },
  { label: "Contato", href: "/contato", enabled: false },
];

export async function ensureNavigationSeeded(): Promise<void> {
  const count = await prisma.navigationItem.count();
  if (count > 0) return;

  await prisma.navigationItem.createMany({
    data: DEFAULT_NAV_ITEMS.map((item, index) => ({ ...item, order: index })),
  });

  console.log(`[seed] ${DEFAULT_NAV_ITEMS.length} item(ns) de menu criado(s) com valores padrão.`);
}

interface DefaultPlatform {
  key: string;
  name: string;
}

const DEFAULT_PLATFORMS: DefaultPlatform[] = [
  { key: "spotify", name: "Spotify" },
  { key: "youtube", name: "YouTube" },
  { key: "apple_podcasts", name: "Apple Podcasts" },
];

/**
 * Plataformas de distribuição do podcast — extensível (Seção 11 do
 * Prompt Mestre): o admin pode ativar/desativar ou adicionar outras em
 * `/admin/platforms`, este seed só garante as três mais comuns já
 * existindo, desativadas até o admin confirmar os links reais.
 */
export async function ensurePlatformsSeeded(): Promise<void> {
  const count = await prisma.platform.count();
  if (count > 0) return;

  await prisma.platform.createMany({
    data: DEFAULT_PLATFORMS.map((p, index) => ({ ...p, active: false, order: index })),
  });

  console.log(`[seed] ${DEFAULT_PLATFORMS.length} plataforma(s) criada(s) com valores padrão.`);
}
