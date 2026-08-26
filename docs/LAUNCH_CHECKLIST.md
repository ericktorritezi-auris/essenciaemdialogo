# Checklist de Lançamento (Sprint 12)

Este documento reúne **todas** as pendências que ficaram registradas espalhadas pelos `docs/*.md` ao longo das 12 sprints, num único lugar. Nada aqui é surpresa nova — é a consolidação do que já estava documentado, organizado por prioridade real para o lançamento.

## 🔴 Bloqueia lançamento — precisa de decisão humana, não técnica

- [ ] **Revisão jurídica das páginas legais.** `/privacidade` e `/termos` (Sprint 12) são minutas técnicas, não texto validado por advogado — está sinalizado na própria página. Esta é a pendência mais antiga do projeto: registrada desde a Seção 25 do primeiro Plano Técnico, antes até da Sprint 1.
- [ ] **Rodar o `docs/QA_CHECKLIST.md` de ponta a ponta**, especialmente a seção de RBAC com uma conta de Colaborador real (agora existe `/admin/users` para isso) e os casos de timezone.

## 🟡 Recomendado antes do lançamento, mas não bloqueia

- [ ] **Migrar de `db push` para `migrate deploy`** com histórico de migrations versionado (`docs/AUTHORIZATION.md`) — adiado sprint após sprint porque o schema ainda mudava bastante; agora que o projeto está estabilizando, é a hora de fazer essa transição, antes que exista conteúdo real e volumoso no banco.
- [ ] **Revisar as vulnerabilidades restantes do `npm audit`** (`docs/SECURITY_REVIEW.md`) — 5 delas exigem upgrade de major do Next.js, deliberadamente não feito ainda por risco de quebra sem ambiente de teste real.
- [ ] **Decidir sobre e-mail transacional** — hoje várias funcionalidades ficam mais limitadas por não existir SMTP configurado: recuperação de senha de usuário existente (`docs/AUTHORIZATION.md`, `docs/USER_MANAGEMENT.md`) e notificação de novas perguntas de contato (hoje só aparece no painel).

## 🟢 Melhorias conhecidas, sem urgência

Cada um destes já está documentado em detalhe no arquivo indicado — aqui é só o índice:

| Pendência | Onde está detalhado |
|---|---|
| UI para editar `seoTitle`/`seoDescription` por conteúdo | `docs/SEO.md` |
| `PodcastSeries` como JSON-LD próprio na Home (hoje só aninhado) | `docs/SEO.md` |
| Conversão das capas de conteúdo para `next/image` | `docs/PERFORMANCE.md` |
| ISR/cache nas páginas públicas (hoje tudo `force-dynamic`) | `docs/PERFORMANCE.md` |
| Lighthouse CI / medição formal de Core Web Vitals | `docs/PERFORMANCE.md` |
| Compartilhamento (link, WhatsApp, redes) nas páginas de conteúdo | `docs/PUBLIC_CONTENT.md` |
| Edição de slug depois de criado + `Redirect` automático | `docs/CMS.md` |
| Filtros de status/busca nas listagens do admin | `docs/CMS.md` |
| Lixeira com restauração (soft delete já existe, falta UI) | `docs/CMS.md` |
| Formulário por campo em vez de JSON cru (seções da Home) | `docs/HOME.md` |
| UI de gestão da tabela `Platform` de verdade | `docs/HOME.md` |
| Reordenação por arrastar-e-soltar (hoje é botão ▲▼) | `docs/HOME.md` |
| Transcrição do episódio (`transcript`, campo existe, sem UI) | `docs/EPISODES.md` |
| `ogMediaId` do Episódio (imagem OG própria, campo existe, sem UI) | `docs/EPISODES.md`, `docs/SEO.md` |
| Filtro por autor/ação no Log de Atividades (API já suporta) | `docs/USER_MANAGEMENT.md` |
| Editorial playlist com reprodução em sequência automática | `docs/RADIO.md` |
| Modo `external` do Rádio com embed compacto (hoje só link) | `docs/RADIO.md` |

## O que está definitivamente pronto e testado

- Autenticação, RBAC, bootstrap automático do admin (Sprints 1, 10)
- CMS completo (Episódios, Artigos, Notícias, Eventos) com fluxo de revisão e Tiptap (Sprints 2, 5, 6)
- Biblioteca de mídia com validação real de magic bytes (Sprint 2)
- Home dinâmica, menu configurável (Sprint 3)
- Identidade visual e diagramação completa do site público (Sprint 7)
- Rádio/ON AIR com player Spotify persistente ao navegar (Sprints 6, 11)
- Busca global, formulário de contato (Sprint 6)
- SEO (metadata, JSON-LD, sitemap/robots), acessibilidade, fontes corrigidas, performance (Sprint 8)
- Gestão de usuários e log de atividades (Sprint 10, com correções de bugs reais na Sprint 11)
- Páginas legais (minuta) e páginas de erro com identidade visual (Sprint 12)

Deploy 100% automatizado desde a Sprint 1 (migrations e bootstrap do admin rodam sozinhos a cada deploy, sem comando manual).
