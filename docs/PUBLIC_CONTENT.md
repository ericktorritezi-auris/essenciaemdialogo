# Páginas Públicas de Conteúdo (Sprint 5)

## O que foi ao ar

| Rota | Conteúdo |
|---|---|
| `/artigos` | Listagem de artigos publicados |
| `/artigos/[slug]` | Artigo individual — autor, data, conteúdo, "leia também" |
| `/noticias` | Listagem de notícias publicadas |
| `/noticias/[slug]` | Notícia individual — autor, data, conteúdo, atribuição de fonte |
| `/eventos` | Listagem separada em "Próximos" e "Já aconteceram" |
| `/eventos/[slug]` | Evento individual — data/hora em `America/Sao_Paulo`, local, modalidade, link de inscrição |

Todas com `export const dynamic = "force-dynamic"` (mesmo motivo da Home e dos Episódios: conteúdo administrável a qualquer momento, banco não acessível em build).

## Importante: ativar no menu

As páginas existem e funcionam, mas os itens de menu correspondentes (Artigos, Notícias, Eventos) **nascem desabilitados** desde o seed da Sprint 3 — isso foi proposital, para não linkar páginas que ainda não existiam. Agora que existem, **ative cada um em `/admin/menu`** para aparecerem no header do site.

## Últimos Lançamentos — agregação completa

A seção "Últimos Lançamentos" da Home (Sprint 3) agora agrega as **quatro** fontes: Episódio, Artigo, Notícia e Evento, publicados na semana editorial corrente (segunda→domingo, `America/Sao_Paulo`). Estava faltando só Episódio, que só existia a partir da Sprint 4 — completado nesta sprint.

## Editor visual (Tiptap)

Detalhado em `docs/CMS.md` — resumindo: Artigos, Notícias e Eventos agora têm um editor visual de verdade no admin (negrito, títulos, listas, links, imagens da Biblioteca de Mídia), no lugar do textarea simples das sprints anteriores. A sanitização server-side continua sendo a proteção real, o editor é só a experiência.

## O que ainda falta (fora do escopo desta sprint)

- Dados estruturados schema.org (`Article`, `NewsArticle`, `Event`) — Sprint 7 (SEO).
- Busca global entre os quatro tipos de conteúdo — Sprint 6.
- Compartilhamento (link, WhatsApp, redes) nas páginas individuais — ainda não implementado em nenhum tipo de conteúdo.
