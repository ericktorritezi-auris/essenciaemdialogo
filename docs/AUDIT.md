# Auditoria

## Como usar

Toda mutação administrativa relevante chama `logAudit()` (`src/lib/audit.ts`) — nunca gravar em `AuditLog` de outra forma. Já implementado em: `LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT`, `ADMIN_BOOTSTRAPPED`, `PASSWORD_SET`.

```ts
await logAudit({
  actorUserId: user.id,
  actorRole: user.role,
  action: "ARTICLE_PUBLISHED", // convenção: SCREAMING_SNAKE_CASE
  entityType: "Article",
  entityId: article.id,
  entityLabel: article.title, // snapshot legível — sobrevive mesmo se o registro for depois excluído
  beforeState: { status: "IN_REVIEW" },
  afterState: { status: "PUBLISHED" },
  ip,
  userAgent,
});
```

## Regras

- **Nunca** passar senha, token, ou segredo em `beforeState`/`afterState`/`metadata` — quem chama `logAudit()` é responsável por já ter removido esses campos antes.
- `AuditLog` é **apenas-insert** na aplicação — não existe (e não deve existir) nenhuma rota de UPDATE/DELETE sobre essa tabela.
- Falha ao gravar auditoria nunca derruba a operação principal (ver `try/catch` em `logAudit`), mas é logada como erro de aplicação — se isso acontecer com frequência, é sinal de problema de banco que precisa de atenção.

## Retenção

Definida: **12 meses de logs detalhados, sem exclusão automática antes disso**; registros mais antigos são arquivados, nunca apagados automaticamente (decisão registrada na Seção 25 do Plano Técnico). O mecanismo de arquivamento em si (rotina de export + purge após 12 meses) ainda não foi implementado — entra como parte da Sprint 8 (Segurança/QA), quando o volume real de dados já existir para dimensionar isso corretamente.
