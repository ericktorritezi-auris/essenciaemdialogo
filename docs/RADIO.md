# Rádio / ON AIR

## Limitação que precisa ficar clara

**Nenhum dos quatro modos é uma "rádio ao vivo 24/7" automática.** Isso não é uma limitação de implementação — é uma limitação real de mercado, já registrada na Seção 12 do Plano Técnico desde o planejamento. Cada modo depende de você configurar algo real em `/admin/radio`:

| Modo | O que você precisa configurar | O que aparece |
|---|---|---|
| `spotify` | URL de uma playlist/show do Spotify | Barra do header: link "Ouvir agora". Página `/radio`: embed completo do player |
| `external` | URL de um player de terceiro com embed público | Barra: link. Página `/radio`: iframe completo |
| `own_audio` | URL de um arquivo de áudio (mp3/ogg) que vocês têm direito de distribuir | Barra e página `/radio`: player HTML5 nativo |
| `editorial_playlist` | Lista de itens (título + link) editada manualmente | Barra: link "Ver playlist completa". Página `/radio`: lista completa |

## Duas superfícies

1. **Barra ON AIR** (`src/components/public/on-air-bar.tsx`) — aparece no topo de todo o site quando a rádio está habilitada. É compacta de propósito (não cabe o player completo do Spotify, ~152px, numa barra fixa sem prejudicar mobile).
2. **Página `/radio`** (`src/app/radio/page.tsx`) — o destino de verdade, com o player/embed completo por modo. O link "Ouvir agora" da barra leva para cá.

Se a rádio estiver desabilitada, `/radio` não dá 404 — mostra uma mensagem de "ainda não disponível" e sugere ouvir os episódios já publicados, em vez de quebrar.

## Ativação

`enabled: false` por padrão (seed automático). Nada aparece no site até você configurar um modo com conteúdo real e marcar "Rádio habilitado" em `/admin/radio`.

## Reprodução persistente ao navegar — entregue (Sprint 11)

Pedido do Erick: a rádio continuar tocando enquanto o visitante navega pelo site, sem parar a cada troca de página.

**O que mudou:** `src/app/(public)/layout.tsx` — um layout compartilhado por todas as 13 páginas públicas (Home, Episódios, Artigos, Notícias, Eventos, Quem Somos, Busca, Contato, Rádio). Antes, cada página renderizava o próprio `<SiteHeader />` (e a `<OnAirBar />` dentro dele) individualmente — toda navegação destruía e recriava a barra do zero. Agora o cabeçalho vive só no layout, que o Next.js mantém montado durante a navegação entre rotas filhas — mecanismo nativo do App Router, mesmo padrão de players persistentes (Spotify Web, SoundCloud).

**Player Spotify — embed real, não mais só um link:** modo `spotify` agora mostra o player compacto de verdade (iframe oficial, 80px de altura) direto na barra ON AIR, em vez de um link para `/radio`. Como o layout persiste, o player não reinicia ao trocar de página.

**Por modo:**

| Modo | Comportamento na barra após esta sprint |
|---|---|
| `spotify` | Player compacto real embutido (80px) — toca continuamente ao navegar |
| `own_audio` | `<audio>` nativo — também persiste automaticamente pelo mesmo motivo |
| `external` | Continua como link para `/radio` — não há garantia de que um iframe arbitrário de terceiro se adapte bem a 80px, então mantive a versão mais segura |
| `editorial_playlist` | Continua como link "Ver playlist completa" — não é um stream contínuo por natureza (lista de itens separados); tocar em sequência automaticamente seria um player customizado, escopo maior, não construído nesta sprint |

**Refatoração mecânica:** as 13 páginas públicas foram movidas para dentro de um route group `src/app/(public)/` — isso não muda nenhuma URL (route groups do Next.js não aparecem no caminho), só a organização interna das pastas. Todo link existente (`href="/episodios"` etc.) continua funcionando exatamente igual.
