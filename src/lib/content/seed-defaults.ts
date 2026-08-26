import crypto from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { HOME_SECTION_KEYS, type HomeSectionKey } from "@/lib/content/home-sections";
import { hashPassword } from "@/lib/auth/password";
import { logAudit } from "@/lib/audit";

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
    ctaHref: "/contato",
  },
  FINAL_CTA: {
    title: "Aqui, ideias se encontram, perspectivas se expandem e consciência se transforma.",
    ctaLabel: "Ouvir agora",
    ctaHref: "/episodios",
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

/**
 * Ajuste pontual (Sprint 7, pós-entrega): AUDIENCE_QUESTION e FINAL_CTA
 * foram seedadas em sprints anteriores com `ctaLabel` mas sem
 * `ctaHref` — o botão existia mas não apontava para lugar nenhum
 * (`#`). Preenche o destino padrão nas instalações já existentes, uma
 * única vez, sem sobrescrever se o admin já tiver definido um ctaHref
 * próprio.
 */
const DEFAULT_CTA_HREFS: Partial<Record<HomeSectionKey, string>> = {
  AUDIENCE_QUESTION: "/contato",
  FINAL_CTA: "/episodios",
};

export async function ensureCtaHrefsPatched(): Promise<void> {
  for (const [key, href] of Object.entries(DEFAULT_CTA_HREFS)) {
    const section = await prisma.homeSection.findUnique({ where: { key } });
    if (!section) continue;

    const content = (section.content as Record<string, unknown> | null) ?? {};
    if (typeof content.ctaHref === "string" && content.ctaHref.length > 0) continue; // já definido

    await prisma.homeSection.update({
      where: { key },
      data: { content: { ...content, ctaHref: href } as unknown as Prisma.InputJsonValue },
    });

    console.log(`[seed] ctaHref padrão aplicado à seção ${key} (${href}).`);
  }
}

const TEST_COLLABORATOR_EMAIL = "colaborador.teste@essenciaemdialogo.com.br";

/**
 * Cria uma conta de Colaborador de teste, uma única vez — pedido
 * explícito do Erick (Sprint 10) para validar o fluxo de RBAC com uma
 * conta real, já que ainda não havia UI de gestão de usuários até
 * agora. Idempotente: só cria se não existir NENHUM Colaborador ainda
 * (se você já criou colaboradores reais pela UI, isso nunca dispara).
 *
 * É uma conta de teste comum, sem nada de especial — pode ser
 * desativada ou removida a qualquer momento em /admin/users assim que
 * não precisar mais dela.
 */
export async function ensureTestCollaboratorSeeded(): Promise<void> {
  const anyCollaborator = await prisma.user.findFirst({ where: { role: "COLLABORATOR" } });
  if (anyCollaborator) return;

  const initialPassword = crypto.randomBytes(18).toString("base64url");

  const collaborator = await prisma.user.create({
    data: {
      name: "Colaborador Teste",
      email: TEST_COLLABORATOR_EMAIL,
      role: "COLLABORATOR",
      active: true,
      passwordHash: await hashPassword(initialPassword),
    },
  });

  await logAudit({
    actorUserId: collaborator.id,
    actorRole: "COLLABORATOR",
    action: "TEST_COLLABORATOR_SEEDED",
    entityType: "User",
    entityId: collaborator.id,
    entityLabel: collaborator.email,
    metadata: { trigger: "server_startup", purpose: "Sprint 10 RBAC testing" },
  });

  console.log(
    [
      "",
      "================================================================",
      " COLABORADOR DE TESTE CRIADO — Essência em Diálogo (Sprint 10)",
      "================================================================",
      ` E-mail:  ${collaborator.email}`,
      ` Senha:   ${initialPassword}`,
      "",
      " Conta de teste, sem nada de especial. Pode desativar ou remover",
      " a qualquer momento em /admin/users.",
      "================================================================",
      "",
    ].join("\n"),
  );
}

const DEFAULT_LEGAL_PAGES: Record<string, { title: string; content: string }> = {
  privacy: {
    title: "Política de Privacidade",
    content:
      "<h2>1. Quem somos</h2><p>O Essência em Diálogo é um podcast e site editorial. Esta política explica quais dados coletamos de quem visita ou interage com o site, e como esses dados são tratados.</p>" +
      "<h2>2. Dados que coletamos</h2><ul>" +
      "<li><strong>Formulário de contato:</strong> nome, e-mail e a pergunta/mensagem enviada, usados para eventual resposta ou uso editorial (de forma anônima) em episódios futuros.</li>" +
      "<li><strong>Contas administrativas:</strong> nome e e-mail de administradores e colaboradores do site, usados para autenticação e controle de acesso.</li>" +
      "<li><strong>Dados técnicos:</strong> endereço IP e informações de navegação são processados momentaneamente para limitar tentativas de envio abusivo (anti-spam) e para o funcionamento normal do servidor, sem finalidade de rastreamento de perfil.</li>" +
      "</ul>" +
      "<h2>3. Cookies</h2><p>Usamos um único cookie técnico, essencial para o funcionamento do site: um cookie de sessão criptografado, usado apenas para manter administradores e colaboradores autenticados no painel. Não usamos cookies de rastreamento ou publicidade.</p>" +
      "<h2>4. Conteúdo de terceiros</h2><p>Este site pode incorporar players do Spotify e links para outras plataformas de distribuição de podcast. Essas plataformas têm suas próprias políticas de privacidade, que recomendamos consultar diretamente.</p>" +
      "<h2>5. Onde os dados ficam armazenados</h2><p>Os dados são armazenados em infraestrutura de nuvem (Railway, para banco de dados, e Cloudflare, para arquivos de mídia), com práticas de segurança técnica descritas internamente pela equipe responsável pelo site.</p>" +
      "<h2>6. Seus direitos (LGPD)</h2><p>Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento, entrando em contato pelo formulário do site.</p>" +
      "<h2>7. Contato</h2><p>Dúvidas sobre esta política podem ser enviadas pelo formulário de contato do site.</p>",
  },
  terms: {
    title: "Termos de Uso",
    content:
      "<h2>1. Aceitação</h2><p>Ao usar este site, você concorda com estes termos. Se não concordar, pedimos que não utilize o site.</p>" +
      "<h2>2. Natureza do conteúdo</h2><p>O conteúdo deste site (episódios, artigos, notícias) tem finalidade educativa e reflexiva. <strong>Não substitui acompanhamento terapêutico, aconselhamento clínico ou atendimento de emergência.</strong> Se você está passando por uma crise, procure ajuda profissional ou o CVV (188).</p>" +
      "<h2>3. Propriedade intelectual</h2><p>Todo o conteúdo original deste site (textos, identidade visual, gravações) pertence ao Essência em Diálogo, salvo quando indicado o contrário. Reprodução sem autorização não é permitida.</p>" +
      "<h2>4. Formulário de contato</h2><p>Ao enviar uma pergunta pelo formulário de contato, você concorda que ela pode ser usada (de forma anônima) em episódios futuros do podcast.</p>" +
      "<h2>5. Disponibilidade</h2><p>Fazemos esforços razoáveis para manter o site disponível, mas não garantimos operação ininterrupta.</p>" +
      "<h2>6. Alterações</h2><p>Estes termos podem ser atualizados a qualquer momento; a data no topo desta página reflete a versão mais recente.</p>",
  },
};

/**
 * Cria as duas páginas legais com o texto inicial (a mesma minuta que
 * já estava no código), uma única vez — `reviewedAt: null` até o admin
 * marcar como revisado em `/admin/legal-pages`. Idempotente: nunca
 * sobrescreve se a página já existir (mesmo que ainda não revisada).
 */
export async function ensureLegalPagesSeeded(): Promise<void> {
  for (const [key, defaults] of Object.entries(DEFAULT_LEGAL_PAGES)) {
    const existing = await prisma.legalPage.findUnique({ where: { key } });
    if (existing) continue;

    await prisma.legalPage.create({
      data: { key, title: defaults.title, content: defaults.content, reviewedAt: null },
    });

    console.log(`[seed] página legal "${defaults.title}" criada (ainda não revisada).`);
  }
}
