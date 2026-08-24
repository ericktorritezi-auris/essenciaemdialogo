# CMS Editorial

## Fluxo de revisão (Artigos, Notícias, Eventos)

Máquina de estados única (`src/lib/content/status.ts`), usada pelos três tipos de conteúdo:

```
DRAFT ──(Colaborador ou Admin)──► IN_REVIEW ──(só Admin)──► PUBLISHED
  │                                    │
  └──(Admin)──► PUBLISHED             └──(Colaborador ou Admin)──► DRAFT (devolvido)

PUBLISHED ──(só Admin)──► PAUSED ──(só Admin)──► PUBLISHED
PUBLISHED/PAUSED/IN_REVIEW/SCHEDULED ──(só Admin)──► ARCHIVED
```

Regra central (Seção 33 do Plano Técnico, opção B): **Colaborador cria, edita e envia para revisão. Só Admin publica.** Isso é validado no servidor (`assertValidTransition`) — o botão sequer aparece na UI para uma transição que o papel não pode fazer, mas o endpoint valida de novo, sempre (nunca confiar só na UI escondendo o botão).

## Posse de conteúdo

- Colaborador só edita/exclui os **próprios** conteúdos (comparação por `authorId`), e só pode excluir se ainda estiver em `DRAFT`.
- Admin edita/exclui qualquer conteúdo, em qualquer status.
- Isso vale igualmente para Artigos, Notícias e **Eventos** — por isso o model `Event` ganhou um `authorId` nesta sprint (não existia na modelagem original; foi uma lacuna identificada e corrigida durante a implementação, para manter a regra consistente nos três tipos).

## Slugs

Gerados automaticamente a partir do título na criação (`slugify()`), com desambiguação automática (`-2`, `-3`...) se já existir um igual. Ainda não editável pela UI depois de criado — é um ajuste pequeno para uma próxima iteração, se for necessário trocar a URL de algo já publicado (nesse caso, também precisa criar um registro em `Redirect`, que já existe no schema mas ainda não tem UI).

## Editor de texto — decisão consciente desta sprint

A stack aprovada (Seção 6 do Plano Técnico) previa **Tiptap** como editor rich text WYSIWYG. Nesta sprint, o campo de conteúdo é um **textarea simples** aceitando HTML básico (negrito, itálico, links, listas, títulos H2-H4), sanitizado no servidor (`src/lib/sanitize.ts`, allowlist de tags/atributos) antes de qualquer gravação no banco.

Por quê: o Tiptap exige uma integração própria (toolbar, upload de imagem inline, extensões, ainda mais sanitização client-side) que é, na prática, um trabalho do tamanho de uma sub-sprint por si só. Entregar o fluxo editorial completo (RBAC, revisão, auditoria, mídia) funcionando de ponta a ponta primeiro — com um campo de texto mais simples — permite validar toda a arquitetura agora e trocar só essa peça depois, sem depender de nada mais mudar.

**A sanitização server-side já está implementada e ativa** independentemente do editor usado na UI — trocar o textarea por Tiptap no futuro não muda nada na segurança, só na experiência de edição.

**Decisão de cronograma (registrada explicitamente, para não ficar solta):** o editor visual completo (Tiptap) entra na **Sprint 5** — momento em que Artigos/Notícias/Eventos vão ao ar no site público, quando a formatação do conteúdo passa a importar de verdade para quem visita o site, não só para quem edita.

## Biblioteca de mídia

Upload em duas etapas, para o arquivo ir direto do navegador para o Cloudflare R2 sem passar pelo servidor Next.js:

1. `POST /api/admin/media/presign` — valida tipo/tamanho declarados, devolve uma URL assinada de `PUT`.
2. Upload direto do client para o R2 usando essa URL.
3. `POST /api/admin/media/confirm` — o servidor busca os primeiros bytes reais do arquivo no R2 e confere o **magic bytes real** (biblioteca `file-type`) contra a allowlist (JPEG/PNG/WebP/GIF) — nunca confia no `Content-Type` que o navegador declarou. Só então cria o registro `Media`.

Exclusão verifica uso antes de apagar (Seção 10 do Plano Técnico) — se a imagem está definida como capa de algum Artigo/Notícia/Evento não excluído, a exclusão é recusada com a lista de onde está em uso.

## O que ainda falta (fora do escopo desta sprint)

- Editor WYSIWYG completo (Tiptap) no lugar do textarea — **agendado para a Sprint 5** (ver decisão acima).
- Edição de slug depois de criado + geração automática de `Redirect`.
- Filtros de status/busca nas telas de listagem (hoje mostram tudo).
- Lixeira com restauração (existe soft delete no banco, mas ainda não há UI para listar/restaurar excluídos).
- Página de gestão de usuários (criar Colaborador, desativar) — dependia da Sprint 1 (RBAC) e desta (padrão de tela admin), agora é natural encaixar numa próxima sprint.
