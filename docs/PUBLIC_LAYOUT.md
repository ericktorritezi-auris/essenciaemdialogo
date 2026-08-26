# Layout Compartilhado do Site Público (Sprint 11)

## O que mudou estruturalmente

Todas as 13 páginas públicas foram movidas para dentro de um **route group** do Next.js: `src/app/(public)/`.

```
src/app/
├── (public)/          ← novo — nome entre parênteses não aparece na URL
│   ├── layout.tsx      ← cabeçalho + rodapé, renderizados uma única vez
│   ├── page.tsx         (era src/app/page.tsx)
│   ├── episodios/
│   ├── artigos/
│   ├── noticias/
│   ├── eventos/
│   ├── quem-somos/
│   ├── busca/
│   ├── contato/
│   └── radio/
├── admin/              ← inalterado, continua fora do grupo
├── login/              ← inalterado, continua fora do grupo (não usa cabeçalho/rodapé públicos)
├── layout.tsx           ← layout raiz (fontes, metadata base) — inalterado
├── sitemap.ts           ← inalterado
└── robots.ts            ← inalterado
```

**Nenhuma URL muda.** Route groups (pasta entre parênteses) são só organização de pastas — `(public)` não vira `/public/` na URL. `/episodios` continua sendo `/episodios`, exatamente como antes. Todo link do site (`<Link href="/episodios">` etc.) continua funcionando sem qualquer alteração.

## Por que isso importa

Antes: cada página renderizava `<SiteHeader />`/`<SiteFooter />` individualmente — eram 13 cópias da mesma chamada, e o Next.js recriava o cabeçalho do zero a cada navegação. Isso é o que impedia a rádio de tocar continuamente (Sprint 11, pedido do Erick).

Agora: só o layout do grupo (`(public)/layout.tsx`) renderiza `<SiteHeader />`/`<SiteFooter />` — o Next.js App Router mantém layouts montados durante a navegação entre rotas filhas, então o cabeçalho (e o player de rádio dentro dele) persiste de verdade.

## Cuidado replicado desta vez: `force-dynamic` no layout também

Essa mesma refatoração já causou dois incidentes de build antes (Home na Sprint 3, sitemap na Sprint 8) por esquecer `export const dynamic = "force-dynamic"` numa rota nova que consulta o banco. Desta vez apliquei isso **preventivamente** no próprio `(public)/layout.tsx` desde o primeiro commit, já que ele consulta o banco (menu, plataformas, configuração do rádio) através do cabeçalho — não esperei quebrar para corrigir.

## Incidente à parte: a rota especial `/_not-found` (Sprint 12)

Diferente de qualquer outra página, `/_not-found` **não é** uma convenção de segmento normal — é uma rota especial que o próprio Next.js App Router gera automaticamente como fallback de app inteiro. O framework tenta gerar essa rota estaticamente em build time **sempre**, como parte do mecanismo de fallback, e isso **não é evitado** por `export const dynamic = "force-dynamic"` no `src/app/not-found.tsx` da raiz — diferente do que acontece com páginas normais, onde esse export garante que o Next nunca tenta pré-gerar.

Isso causou dois deploys quebrados até a causa raiz ficar clara: o `not-found.tsx` da raiz renderizava `<SiteHeader />`/`<SiteFooter />` (que consultam o banco), e mesmo com `force-dynamic`, o Next tentava avaliar esse arquivo em build time de qualquer jeito.

**Correção aplicada:** `src/app/not-found.tsx` (raiz) foi reescrito para **não depender do banco em hipótese nenhuma** — sem `<SiteHeader />`/`<SiteFooter />`, um 404 simples e autocontido. Essa é a única forma confiável de garantir que essa rota específica nunca falhe em build, independente de qual mecanismo interno do Next a está avaliando.

**Importante — isso não se aplica ao `(public)/not-found.tsx`:** esse é um arquivo de convenção de segmento normal (ativado por chamadas explícitas a `notFound()` dentro de rotas já dinâmicas, como slug de episódio/artigo inexistente) — ele herda corretamente o comportamento dinâmico do `(public)/layout.tsx` que o envolve, sem precisar de nenhum tratamento especial. A distinção importa: só a rota `/_not-found` verdadeira (a gerada pelo framework na raiz do app) tem esse comportamento de pré-geração forçada.

## Cada página pública individual

Cada `page.tsx` dentro do grupo teve o `<SiteHeader />`/`<SiteFooter />` removido do próprio JSX (ficou só o `<main>`, ou `<main>` + `<JsonLd>` nas páginas que têm dados estruturados) — o layout do grupo é quem envolve isso agora. O `export const dynamic = "force-dynamic"` de cada página individual foi mantido (continua necessário por página, além do layout).
