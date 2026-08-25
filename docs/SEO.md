# SEO (Sprint 8)

## Correção crítica: fontes da marca nunca carregavam de verdade

Antes desta sprint, `src/styles/tokens.css` referenciava `"Playfair Display"` e `"Montserrat"` só pelo nome — nenhum `next/font`, nenhum link do Google Fonts. **O site inteiro, desde a Sprint 0, renderizava com a fonte de fallback (Georgia/sistema)**, não a tipografia aprovada. Passou despercebido porque Georgia também é serifada — visualmente não "quebrava" a ponto de saltar aos olhos.

Corrigido em `src/app/layout.tsx` via `next/font/google` (self-hosted pelo próprio Next, sem requisição externa ao Google Fonts — mais rápido e sem tracking de terceiros). `tokens.css` agora referencia as variáveis geradas pelo carregamento real (`--font-display-loaded`/`--font-body-loaded`), com Georgia/sistema como fallback genuíno (não mais o valor efetivo).

## Metadata por página

Cada tipo de conteúdo público (Episódio, Artigo, Notícia, Evento) e cada página estática (Quem Somos, Rádio, Busca, Contato, listagens) tem `generateMetadata`/`metadata` próprios — antes, toda página do site compartilhava o título genérico da Home. `src/lib/public/seo.ts` (`buildMetadata`) centraliza a lógica: título com sufixo da marca, description com fallback, canonical absoluto, Open Graph e Twitter Card.

Conteúdo individual usa os campos `seoTitle`/`seoDescription` já existentes no banco desde a Sprint 0 (com fallback para título/resumo normal se não preenchidos) — **ainda não há UI no admin para editar esses campos**, só existem no banco. Isso é uma lacuna real: o campo existe e a página já usa, mas o Colaborador/Admin não tem onde digitar um SEO title customizado ainda. Fica para uma sprint futura se for prioridade.

`Busca` e `Contato` são marcadas `noindex` — não fazem sentido no índice de busca (uma é uma ferramenta interna, a outra é um formulário).

## Dados estruturados (JSON-LD)

`src/components/public/json-ld.tsx` — schema.org por tipo:

| Página | Tipo |
|---|---|
| Episódio | `PodcastEpisode` (dentro de `PodcastSeries`) |
| Artigo | `Article` |
| Notícia | `NewsArticle` |
| Evento | `Event` |
| Quem Somos | `Organization` com `member: Person[]` (Erick e Iolanda) |

## Sitemap e robots.txt

`src/app/sitemap.ts` e `src/app/robots.ts` — convenções nativas do Next.js (`/sitemap.xml` e `/robots.txt` gerados automaticamente). O sitemap é dinâmico: toda vez que alguém acessa `/sitemap.xml`, ele consulta o banco e lista todo conteúdo `PUBLISHED` — nunca precisa ser atualizado manualmente ao publicar algo novo. `robots.txt` bloqueia `/admin`, `/api`, `/login`, `/busca`, `/contato` da indexação.

## O que ainda falta (fora do escopo desta sprint)

- UI no admin para editar `seoTitle`/`seoDescription` por conteúdo.
- Imagem de Open Graph própria por seção (hoje reaproveita a capa do conteúdo, o que é razoável, mas não há um campo `ogMediaId` em uso — ele existe no schema do Episódio desde a Sprint 0, mas nunca foi conectado a nada).
- `PodcastSeries` como JSON-LD próprio na Home (hoje só aparece aninhado dentro de cada `PodcastEpisode`).
