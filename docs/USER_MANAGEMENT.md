# Gestão de Usuários e Log de Atividades (Sprint 10)

## O que existia antes vs. agora

Desde a Sprint 1, o sistema de papéis (Admin/Colaborador) e todas as regras de permissão já funcionavam — mas não existia nenhuma **interface** para criar um Colaborador, nem para visualizar o log de auditoria que já era gravado desde sempre. Essas duas telas apareciam no mockup original do projeto e nunca tinham sido sinalizadas como pendência explícita até o Erick perguntar diretamente.

## `/admin/users` — Gestão de Usuários

Admin only. Permite:
- Criar um novo usuário (nome, e-mail, papel) — o sistema gera uma senha forte automaticamente e mostra **uma única vez** na tela, para o Admin copiar e repassar à pessoa.
- Trocar o papel de qualquer usuário (Admin ↔ Colaborador).
- Ativar/desativar qualquer usuário.

**Proteção contra "sistema sem admin":** o endpoint recusa qualquer mudança que deixaria zero administradores ativos no sistema (seja rebaixando o último Admin para Colaborador, seja desativando ele) — sem isso, seria possível se trancar para fora do próprio painel sem volta.

**Um Admin não edita a própria conta por aqui** — usa `/admin/profile` para isso (evita o risco de alguém se auto-rebaixar ou se desativar sem querer por engano).

**Editar** nome e e-mail de qualquer usuário.

**Excluir de verdade** (não é soft delete) — pensado para limpar contas de teste, como a de Colaborador criada automaticamente na Sprint 10. Só é recusada se o usuário for autor de conteúdo **ativo** (não excluído) — Artigo, Notícia, Evento ou Episódio ainda visível nas telas; nesse caso, a recomendação é desativar em vez de excluir.

**Conteúdo já na lixeira não bloqueia mais a exclusão** (corrigido em 26/08 — bug real identificado pelo Erick): se o usuário tiver algo que ele mesmo já excluiu antes (soft delete — invisível nas telas, mas ainda fisicamente no banco), esse conteúdo é apagado de vez, automaticamente, no mesmo momento em que o usuário é excluído — sem isso, o banco recusaria a exclusão por causa da referência obrigatória entre o conteúdo e o autor. A quantidade de itens da lixeira removidos junto fica registrada no log de auditoria (`USER_DELETED`, campo `metadata.purgedTrashedContent`).

O log de auditoria em si nunca é apagado junto — os registros de ações desse usuário continuam existindo, só ficam sem o vínculo com uma conta que não existe mais (Seção 9 — auditoria é apenas-insert).

## `/admin/audit-log` — Log de Atividades

Admin only (Colaborador não deveria ver ações de outros usuários, incluindo tentativas de login malsucedidas). Lista paginada (50 por página) com filtro por tipo de entidade. Mostra: quando, quem, qual ação, em qual conteúdo.

## Conta de Colaborador de teste — criada automaticamente

Pedido explícito do Erick: uma conta de Colaborador de teste é criada automaticamente no boot do servidor (mesmo mecanismo do bootstrap do admin, Sprint 1) — **só se ainda não existir nenhum Colaborador no sistema**. As credenciais aparecem uma única vez no log de deploy do Railway, formatadas para serem fáceis de encontrar:

```
================================================================
 COLABORADOR DE TESTE CRIADO — Essência em Diálogo (Sprint 10)
================================================================
 E-mail:  colaborador.teste@essenciaemdialogo.com.br
 Senha:   <aparece só no log, uma vez>
================================================================
```

É uma conta comum, sem nada de especial — pode ser desativada ou você pode criar outra de verdade em `/admin/users` a qualquer momento. Se você já tiver criado um Colaborador real antes desse deploy, essa conta de teste **não é criada** (a checagem é "existe algum Colaborador?", não "existe esse e-mail específico?").

## Menu do admin agora respeita o papel

Achado ao construir isso: o menu do painel mostrava **todos** os itens para qualquer papel, mesmo os admin-only (Plataformas, Rádio, Home, Menu) — um Colaborador via o link e recebia 403 ao clicar. Corrigido nesta sprint: `AdminNav` agora busca o papel do usuário logado e só mostra os itens que ele pode acessar de verdade.

## O que ainda falta (fora do escopo desta sprint)

- Reenvio de senha/reset para um usuário existente que esqueceu a senha (hoje só existe troca de senha pelo próprio usuário, sabendo a senha atual — ver `docs/AUTHORIZATION.md`).
- Log de atividades sem filtro por autor/ação específica na UI (só por tipo de entidade) — a API já suporta (`actorUserId`, `action`), só falta o seletor na tela.
