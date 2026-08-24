# Rádio / ON AIR

## Limitação que precisa ficar clara

**Nenhum dos quatro modos é uma "rádio ao vivo 24/7" automática.** Isso não é uma limitação de implementação — é uma limitação real de mercado, já registrada na Seção 12 do Plano Técnico desde o planejamento. Cada modo depende de você configurar algo real em `/admin/radio`:

| Modo | O que você precisa configurar | O que a barra ON AIR mostra |
|---|---|---|
| `spotify` | URL de uma playlist/show do Spotify | Link "Ouvir agora" (o embed completo do player é pesado demais para uma barra fixa — ver nota abaixo) |
| `external` | URL de um player de terceiro com embed público | Link "Ouvir agora" |
| `own_audio` | URL de um arquivo de áudio (mp3/ogg) que vocês têm direito de distribuir | Player HTML5 nativo, direto na barra |
| `editorial_playlist` | Lista de itens (título + link) editada manualmente | Até 3 links direto na barra |

## Por que só um link para Spotify/externo, não o player embutido

O player oficial do Spotify tem ~152px de altura — pesado demais para caber numa barra fixa no topo do site sem prejudicar a experiência mobile. Por enquanto, a barra ON AIR mostra só um link "Ouvir agora". Se fizer sentido no futuro, dá para criar uma página dedicada `/radio` com o embed completo — não implementada nesta sprint por não ter sido pedida explicitamente, mas é uma extensão simples do que já existe.

## Ativação

`enabled: false` por padrão (seed automático). Nada aparece no site até você configurar um modo com conteúdo real e marcar "Rádio habilitado" em `/admin/radio`.
