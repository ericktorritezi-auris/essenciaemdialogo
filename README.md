# Essência em Diálogo — Website + CMS Editorial

> **Duas perspectivas. Um tema. Uma conversa além da superfície.**

Website institucional, editorial e audiovisual do podcast **Essência em Diálogo**, apresentado por **Erick Torritezi** e **Iolanda Reis**, com CMS próprio para gestão de episódios, artigos, notícias, eventos, mídia, usuários e rádio.

Projeto construído em 12 sprints — ver `docs/LAUNCH_CHECKLIST.md` para o estado consolidado de tudo que foi entregue e o que ainda fica como melhoria futura.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript |
| ORM | Prisma |
| Banco de dados | PostgreSQL (Railway) |
| Autenticação | Sessão server-side (iron-session) + Argon2id |
| Editor rich text | Tiptap, com sanitização server-side |
| Storage de mídia | Cloudflare R2 (S3-compatible) |
| CSS / Design System | Tailwind CSS + tokens customizados |
| Fontes | Playfair Display + Montserrat, auto-hospedadas (`next/font/local`) |
| Busca | PostgreSQL (`contains`, ver `docs/SEARCH.md`) |
| Deploy | Railway — 100% automatizado (migrations + bootstrap do admin no boot) |

---

## Estrutura de pastas

```
src/app/
├── (public)/          ← todas as páginas públicas, layout compartilhado
│   ├── layout.tsx       (cabeçalho + rodapé, persiste durante navegação)
│   ├── page.tsx          Home
│   ├── episodios/
│   ├── artigos/
│   ├── noticias/
│   ├── eventos/
│   ├── quem-somos/
│   ├── busca/
│   ├── contato/
│   ├── radio/
│   ├── privacidade/
│   └── termos/
├── admin/              ← painel administrativo (RBAC: Admin/Colaborador)
├── login/
├── api/                 ← rotas de API (públicas + /api/admin/*)
├── layout.tsx           ← layout raiz (fontes, metadata base)
├── sitemap.ts
└── robots.ts

src/lib/                 ← lógica de domínio (auth, conteúdo, storage, SEO...)
src/components/          ← componentes React (admin/ e public/)
prisma/schema.prisma      ← schema do banco
docs/                     ← toda a documentação técnica do projeto
```

---

## Instalação e desenvolvimento local

```bash
cp .env.example .env   # preencher com valores reais — ver docs/ENVIRONMENT.md
npm install
npx prisma generate
npm run dev
```

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Ambiente de desenvolvimento |
| `npm run build` | Build de produção (`prisma generate && next build`) |
| `npm run start` | Aplica o schema no banco (`prisma db push`) e inicia o servidor |
| `npm run lint` | Lint do código |
| `npm run typecheck` | Verificação de tipos TypeScript |

## Deploy

Railway, 100% automatizado — nenhum comando manual necessário:
1. `npm run start` aplica o schema no banco automaticamente a cada deploy.
2. No boot do servidor (`src/instrumentation.ts`), uma série de rotinas idempotentes garantem: admin bootstrapado (com senha impressa uma vez no log), seções da Home, menu e plataformas com valores padrão, configuração do Rádio, fotos/biografias oficiais dos apresentadores.

Ver `docs/AUTHORIZATION.md` para os detalhes completos do bootstrap.

---

## Documentação

Toda decisão técnica relevante — incluindo os porquês de escolhas conscientes de escopo — está documentada em `docs/`. Pontos de partida recomendados:

- **`docs/LAUNCH_CHECKLIST.md`** — visão consolidada do que está pronto e do que falta, por prioridade.
- **`docs/ENVIRONMENT.md`** — todas as variáveis de ambiente.
- **`docs/AUTHORIZATION.md`** — autenticação, RBAC, bootstrap automático.
- **`docs/CMS.md`** — fluxo editorial (Artigos/Notícias/Eventos/Episódios).
- **`docs/DESIGN_SYSTEM.md`** e **`docs/DESIGN_PASS.md`** — identidade visual.
- **`docs/PUBLIC_LAYOUT.md`** — estrutura de layout compartilhado do site público.
- **`docs/SECURITY_REVIEW.md`** — revisão de segurança e dependências.
- **`docs/QA_CHECKLIST.md`** — checklist de testes manuais para rodar antes do lançamento.

---

## Licença e propriedade

Todos os direitos reservados.

Desenvolvido por **Erick Torritezi**.
