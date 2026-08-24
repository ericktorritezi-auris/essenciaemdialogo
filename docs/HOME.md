# Home Dinâmica e Menu

## Princípio

Nenhuma seção da Home é hardcoded no código (Seção 3 do Prompt Mestre). A lista de seções, se cada uma está ativa, a ordem, e o texto editável de cada uma vivem no banco (`HomeSection`) e são administrados em `/admin/home`. O mesmo vale para o menu principal (`NavigationItem`, administrado em `/admin/menu`).

`src/app/page.tsx` só faz duas coisas: busca as seções habilitadas (ordenadas) e delega a renderização de cada uma para `src/components/public/home-section-renderer.tsx`, que mapeia `key → componente`. Adicionar um novo tipo de seção no futuro é: (1) adicionar a chave em `src/lib/content/home-sections.ts`, (2) criar o componente, (3) adicionar o `case` no renderer.

## Seções existentes

| Chave | Fonte dos dados | Some se... |
|---|---|---|
| `HERO` | Texto editável (`content`) | Nunca (sempre mostra algo, mesmo com texto padrão) |
| `LATEST_RELEASES` | Agregação de Artigo/Notícia/Evento publicados na semana editorial corrente (Episódio entra na Sprint 4) | Não houver nada publicado nesta semana |
| `FEATURED_EPISODE` / `RECENT_EPISODES` | Tabela `Episode` | Não houver episódio publicado — **começam desabilitadas** por padrão até a Sprint 4 |
| `MANIFESTO` / `ABOUT` / `AUDIENCE_QUESTION` / `FINAL_CTA` | Texto editável (`content`) | Nunca |
| `HOSTS` | Texto editável (`content.hosts[]`, com `photoMediaId` apontando pra Biblioteca de Mídia) | Nunca (mas a foto só aparece depois de você subir as fotos do Erick e da Iolanda em `/admin/media` e vincular o `photoMediaId` no JSON da seção) |
| `EDITORIALS` | 3 artigos publicados mais recentes | Não houver artigo publicado |
| `EVENTS` | Próximos eventos publicados | Não houver evento futuro publicado |
| `PLATFORMS` | Tabela `Platform` (ainda sem UI de gestão — entra numa próxima sprint) | Não houver plataforma ativa cadastrada |

## Editando o texto de uma seção

Em `/admin/home`, cada seção tem um botão "Editar texto" que abre um campo JSON — é o `content` da seção, editado diretamente. Não é a experiência mais amigável (um formulário por campo seria melhor), mas evita construir 8 formulários diferentes nesta sprint só para texto que muda raramente. Formato de cada seção documentado nos valores padrão em `src/lib/content/seed-defaults.ts`.

## Menu

Itens que apontam para páginas que ainda não existem (Episódios, Artigos, Notícias, Eventos, Rádio, Contato — cada uma nasce na sua sprint correspondente) **começam desabilitados** por padrão. Ligue cada um em `/admin/menu` conforme a página correspondente for ao ar — não precisa de deploy para isso.

## O que ainda falta (fora do escopo desta sprint)

- Formulário por campo em vez de JSON cru para o conteúdo das seções.
- UI de gestão da tabela `Platform` (hoje só existe no schema).
- Reordenação por arrastar-e-soltar (hoje é botão ▲▼).
- Submenu/hierarquia de itens de menu (schema já suporta menu plano; hierarquia não foi modelada, não parece necessária pelo mockup fornecido).
