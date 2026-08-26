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

## Cada página pública individual

Cada `page.tsx` dentro do grupo teve o `<SiteHeader />`/`<SiteFooter />` removido do próprio JSX (ficou só o `<main>`, ou `<main>` + `<JsonLd>` nas páginas que têm dados estruturados) — o layout do grupo é quem envolve isso agora. O `export const dynamic = "force-dynamic"` de cada página individual foi mantido (continua necessário por página, além do layout).
