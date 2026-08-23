# Essência em Diálogo — Website + CMS Editorial

> **Duas perspectivas. Um tema. Uma conversa além da superfície.**

Website institucional, editorial e audiovisual do podcast **Essência em Diálogo**, apresentado por **Erick Torritezi** e **Iolanda Reis**, com CMS próprio para gestão de episódios, artigos, notícias, eventos e mídia.

Este repositório é a fonte de verdade do código do projeto.

---

## Sobre o projeto

O Essência em Diálogo não é um site institucional simples nem um portal de blog genérico — é uma plataforma editorial própria, pensada para crescer de forma independente das plataformas externas onde o podcast é distribuído (Spotify, YouTube, Apple Podcasts, etc.).

Principais características:

- Site público **mobile first**, editorial, cinematográfico e premium.
- CMS próprio com controle de acesso (Admin / Colaborador) e fluxo de aprovação editorial.
- Módulos de conteúdo: Episódios, Artigos, Notícias, Eventos.
- Seção **Últimos Lançamentos**, agregando conteúdo publicado na semana editorial corrente (`America/Sao_Paulo`, segunda a domingo).
- Módulo **Rádio / ON AIR** configurável.
- Auditoria integral e imutável de ações administrativas.
- SEO estruturado por conteúdo (title, description, OG, schema.org).
- Biblioteca de mídia com storage persistente (object storage S3-compatible).

Especificação completa do produto: ver `docs/PROMPT_MESTRE.md` (ou documento equivalente no repositório de documentação do projeto).

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js (App Router) |
| Linguagem | TypeScript |
| ORM | Prisma |
| Banco de dados | PostgreSQL (Railway) |
| Autenticação | Sessão server-side + Argon2id |
| Editor rich text | Tiptap (com sanitização server-side) |
| Storage de mídia | Object storage S3-compatible (a confirmar provedor) |
| CSS / Design System | Tailwind CSS + tokens customizados |
| Busca | PostgreSQL Full Text Search |
| Deploy | Railway |
| CI | GitHub Actions |

> A stack final e as justificativas técnicas estão documentadas em `docs/ARCHITECTURE.md`.

---

## Requisitos

- Node.js LTS (versão a fixar em `.nvmrc` / `engines` do `package.json`)
- PostgreSQL 15+ (local via Docker, ou instância Railway em ambiente de desenvolvimento)
- Conta de object storage S3-compatible para desenvolvimento (ou emulação local, ex. MinIO)

---

## Ambiente

1. Copie o arquivo de exemplo de variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
2. Preencha as variáveis locais (nunca commitar `.env`). Referência completa em `docs/ENVIRONMENT.md`.
3. Timezone oficial de negócio do projeto: `America/Sao_Paulo` (`APP_TIMEZONE`).

---

## Instalação

```bash
# instalar dependências
npm install

# aplicar migrations no banco local
npx prisma migrate dev

# rodar o projeto em modo desenvolvimento
npm run dev
```

A aplicação sobe por padrão em `http://localhost:3000`.

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Ambiente de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Inicia build de produção |
| `npm run lint` | Lint do código |
| `npm run typecheck` | Verificação de tipos TypeScript |
| `npm run test` | Testes unitários e de integração |
| `npm run test:e2e` | Testes end-to-end |
| `npx prisma migrate dev` | Aplica migrations em desenvolvimento |
| `npx prisma studio` | Interface visual do banco (uso local apenas) |

---

## Testes

Este é um projeto de produção — nenhuma alteração é considerada pronta sem passar pela suíte de testes (unitários, integração, E2E, RBAC e timezone).

```bash
npm run test
npm run test:e2e
```

Detalhes da estratégia de QA em `docs/QA.md` e `docs/TESTING.md`.

---

## Build

```bash
npm run build
npm run start
```

---

## Desenvolvimento → Produção

Fluxo de deploy:

```
feature branch → Pull Request → CI (lint, typecheck, testes, build) →
review → merge em main → build → migrations seguras →
deploy staging → smoke/E2E → aprovação → deploy produção →
healthcheck → smoke pós-deploy
```

Branch `main` é protegida. Nenhum merge é permitido sem CI verde.

Detalhes em `docs/DEPLOYMENT.md` e `docs/RAILWAY.md`.

---

## Estrutura de branches

- `main` — produção, protegida
- `develop` — integração (se aplicável)
- `feature/*` — novas funcionalidades
- `fix/*` — correções

Commits seguem o padrão [Conventional Commits](https://www.conventionalcommits.org/).

---

## Documentação

| Documento | Conteúdo |
|---|---|
| `docs/ARCHITECTURE.md` | Arquitetura técnica geral |
| `docs/DATABASE.md` | Modelagem do banco e migrations |
| `docs/DEPLOYMENT.md` | Processo de deploy |
| `docs/RAILWAY.md` | Configuração de infraestrutura Railway |
| `docs/ENVIRONMENT.md` | Variáveis de ambiente |
| `docs/SECURITY.md` | Threat model e medidas de segurança |
| `docs/AUTHORIZATION.md` | Autenticação e RBAC |
| `docs/CMS.md` | Funcionamento do CMS |
| `docs/CONTENT_MODEL.md` | Modelo de conteúdo editorial |
| `docs/AUDIT.md` | Estratégia de auditoria |
| `docs/BACKUP_RESTORE.md` | Backup e disaster recovery |
| `docs/QA.md` / `docs/TESTING.md` | Estratégia de testes |
| `docs/RUNBOOK.md` | Procedimentos operacionais de incidente |
| `CHANGELOG.md` | Histórico de releases |

---

## Licença e propriedade

Todos os direitos reservados.

Desenvolvido por **Erick Torritezi**.

---

## Contato

Dúvidas técnicas sobre este repositório: abrir uma *issue* interna ou contatar o mantenedor do projeto.
