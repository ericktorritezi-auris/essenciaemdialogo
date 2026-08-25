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
