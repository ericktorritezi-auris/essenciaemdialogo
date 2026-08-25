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
        photoUrl: "/team/erick-torritezi.jpg",
        bio:
          "Psicanalista, Psicoterapeuta Integrativo e Master Hipnoterapeuta, especialista na transformação do comportamento humano. Membro da ABRAPH (Academia Brasileira de Psicoterapia Holística) e da ATH (Associação dos Terapeutas Holísticos), com raízes nos estudos da Logoterapia e especialização em Análises Comportamentais e Emocionais voltadas a desbloqueios de traumas, autoconhecimento, hábitos, crenças e valores. Membro da Sociedade Brasileira de Coaching e formado em Programação Neurolinguística e Inteligência Emocional. Com mais de 15 anos de experiência em treinamentos e liderança de equipes, é autor dos livros \"Vivendo GenuinaMENTE\" e \"Diálogo com o Criador\", e criador do Programa 4F de Desenvolvimento Humano e do Protocolo ESSÊNCIA.",
      },
      {
        name: "Iolanda Reis",
        role: "Terapeuta Ocupacional e Arteterapeuta Junguiana",
        photoMediaId: null,
        photoUrl: "/team/iolanda-reis.jpg",
        bio:
          "Terapeuta Ocupacional pós-graduada em Arteterapia Junguiana, com atuação na Clínica Bela Essência. Especializa-se em reabilitar a autonomia de pessoas de todas as idades diante de limitações ou incapacidades nas atividades diárias, com uma abordagem holística e empática que integra terapia ocupacional e arteterapia. Suas intervenções ajudam a superar alterações cognitivas, afetivas, perceptivas e psicomotoras — resultantes de causas genéticas, traumáticas ou decorrentes do abuso de substâncias. Está sempre em busca de novas qualificações e técnicas para aliviar o sofrimento e a angústia de seus pacientes, unindo ciência e arte numa experiência terapêutica que melhora a capacidade funcional e enriquece a vida emocional e espiritual de quem atende.",
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
      content: (DEFAULT_CONTENT[key] ?? {}) as unknown as Prisma.InputJsonValue,
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

/**
 * Configuração do Rádio/ON AIR — singleton (sempre um único registro).
 * Nasce desabilitada; o admin escolhe o modo e ativa em `/admin/radio`
 * quando tiver os links/conteúdo reais definidos (Seção 12 do Prompt
 * Mestre — nenhum modo funciona "sozinho" sem configuração).
 */
export async function ensureRadioConfigurationSeeded(): Promise<void> {
  const count = await prisma.radioConfiguration.count();
  if (count > 0) return;

  await prisma.radioConfiguration.create({
    data: {
      enabled: false,
      mode: "spotify",
      title: "Rádio Essência em Diálogo",
    },
  });

  console.log("[seed] configuração inicial do Rádio/ON AIR criada (desabilitada).");
}

interface HostContent {
  name?: string;
  role?: string;
  photoMediaId?: string | null;
  photoUrl?: string;
  bio?: string;
}

const OFFICIAL_HOST_PHOTOS: Record<string, string> = {
  "Erick Torritezi": "/team/erick-torritezi.jpg",
  "Iolanda Reis": "/team/iolanda-reis.jpg",
};

const OFFICIAL_HOST_BIOS: Record<string, string> = {
  "Erick Torritezi":
    "Psicanalista, Psicoterapeuta Integrativo e Master Hipnoterapeuta, especialista na transformação do comportamento humano. Membro da ABRAPH (Academia Brasileira de Psicoterapia Holística) e da ATH (Associação dos Terapeutas Holísticos), com raízes nos estudos da Logoterapia e especialização em Análises Comportamentais e Emocionais voltadas a desbloqueios de traumas, autoconhecimento, hábitos, crenças e valores. Membro da Sociedade Brasileira de Coaching e formado em Programação Neurolinguística e Inteligência Emocional. Com mais de 15 anos de experiência em treinamentos e liderança de equipes, é autor dos livros \"Vivendo GenuinaMENTE\" e \"Diálogo com o Criador\", e criador do Programa 4F de Desenvolvimento Humano e do Protocolo ESSÊNCIA.",
  "Iolanda Reis":
    "Terapeuta Ocupacional pós-graduada em Arteterapia Junguiana, com atuação na Clínica Bela Essência. Especializa-se em reabilitar a autonomia de pessoas de todas as idades diante de limitações ou incapacidades nas atividades diárias, com uma abordagem holística e empática que integra terapia ocupacional e arteterapia. Suas intervenções ajudam a superar alterações cognitivas, afetivas, perceptivas e psicomotoras — resultantes de causas genéticas, traumáticas ou decorrentes do abuso de substâncias. Está sempre em busca de novas qualificações e técnicas para aliviar o sofrimento e a angústia de seus pacientes, unindo ciência e arte numa experiência terapêutica que melhora a capacidade funcional e enriquece a vida emocional e espiritual de quem atende.",
};

/**
 * Ajuste pontual (Sprint 7 — diagramação): instalações que já tinham a
 * seção HOSTS criada antes das fotos/biografias oficiais existirem
 * ganham `photoUrl` e `bio` automaticamente, uma única vez — sem
 * sobrescrever nome/cargo/bio se o admin já tiver editado esse texto.
 * Idempotente: só age no que ainda está vazio.
 */
export async function ensureHostDetailsPatched(): Promise<void> {
  const section = await prisma.homeSection.findUnique({ where: { key: "HOSTS" } });
  if (!section) return;

  const content = (section.content as { title?: string; hosts?: HostContent[] } | null) ?? {};
  const hosts = Array.isArray(content.hosts) ? content.hosts : [];
  if (hosts.length === 0) return;

  let changed = false;
  const patched = hosts.map((host) => {
    const officialPhoto = host.name ? OFFICIAL_HOST_PHOTOS[host.name] : undefined;
    const officialBio = host.name ? OFFICIAL_HOST_BIOS[host.name] : undefined;

    const needsPhoto = !host.photoUrl && !host.photoMediaId && officialPhoto;
    const needsBio = !host.bio && officialBio;

    if (!needsPhoto && !needsBio) return host;

    changed = true;
    return {
      ...host,
      ...(needsPhoto ? { photoUrl: officialPhoto } : {}),
      ...(needsBio ? { bio: officialBio } : {}),
    };
  });

  if (!changed) return;

  await prisma.homeSection.update({
    where: { key: "HOSTS" },
    data: { content: { ...content, hosts: patched } as unknown as Prisma.InputJsonValue },
  });

  console.log("[seed] fotos/biografias oficiais dos apresentadores aplicadas à seção Apresentadores.");
}
