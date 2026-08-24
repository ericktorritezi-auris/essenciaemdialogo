# Episódios e Plataformas

## Fluxo editorial

Mesma máquina de estados de Artigos/Notícias/Eventos (`src/lib/content/status.ts`). Diferença de modelagem: o Episódio usa `createdBy` (campo já existente desde a Sprint 0) como dono do conteúdo em vez de `authorId` — mesma função, nome diferente porque assim já estava desde a modelagem inicial e não havia motivo para quebrar compatibilidade só por consistência de nome.

## Plataformas — chave estável, não nome livre

`Platform` ganhou um campo `key` (`spotify`, `youtube`, `apple_podcasts`...) — é como o código identifica "essa é a plataforma Spotify" de forma confiável, em vez de comparar a string do nome (que o admin pode editar/traduzir). O admin pode adicionar outras plataformas em `/admin/platforms` com qualquer `key` própria; o player embutido do Spotify só funciona para a que tem `key: "spotify"` — as demais viram links externos simples.

Plataformas nascem **desativadas** por padrão (seed automático) até o admin confirmar os links reais e ativar cada uma.

## Spotify — embed oficial, com fallback

`src/lib/spotify.ts` converte uma URL pública (`open.spotify.com/episode/...` ou `/show/...`) para a URL de embed oficial, validando o domínio antes — nunca aceita URL arbitrária como `src` de iframe (Seção 11 do Prompt Mestre: nunca scraping, nunca contornar restrições).

Se não houver link do Spotify cadastrado, ou a URL não for reconhecida, a página do episódio não quebra — mostra um link externo "Ouvir no Spotify" (se a URL existir mas não bater com o padrão esperado) ou simplesmente não mostra nada (se não houver link algum). O episódio em si nunca depende do Spotify responder para existir e ser publicável — dados editoriais (título, descrição, capa) são sempre internos.

## Páginas públicas

- `/episodios` — listagem de publicados.
- `/episodios/[slug]` — página individual: capa, player (Spotify + outras plataformas ativas), descrição completa, navegação anterior/próximo (por `publishedAt`), relacionados.

Ambas com `export const dynamic = "force-dynamic"` — mesmo motivo da Home (Sprint 3): conteúdo administrável a qualquer momento, banco não acessível em build.

## Conecta com a Sprint 3

As seções "Episódio em destaque" e "Episódios recentes" da Home (construídas na Sprint 3, mas desabilitadas por padrão porque não havia dados) agora têm o que mostrar assim que houver pelo menos um episódio publicado com `featured: true` (para a primeira) ou qualquer publicado (para a segunda). **Não esqueça de ativar as duas em `/admin/home`** depois de publicar o primeiro episódio — elas não se ativam sozinhas, só passam a ter conteúdo para mostrar.

## O que ainda falta (fora do escopo desta sprint)

- Dados estruturados schema.org (`PodcastEpisode`) — Sprint 7 (SEO).
- Transcrição do episódio (`transcript`, campo já existe no schema) — sem UI de edição ainda.
- `ogMediaId` (imagem de compartilhamento específica, diferente da capa) — campo existe, sem UI ainda.
