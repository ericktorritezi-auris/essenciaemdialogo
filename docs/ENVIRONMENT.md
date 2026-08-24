# Variáveis de Ambiente

Referência completa de `.env.example`. Nenhum valor real é versionado — sempre placeholders.

| Variável | Obrigatória | Descrição |
|---|---|---|
| `NODE_ENV` | Sim | `development` \| `production` |
| `APP_URL` | Sim | URL pública canônica da aplicação |
| `APP_TIMEZONE` | Sim | Sempre `America/Sao_Paulo` — identificador IANA, nunca offset fixo |
| `DATABASE_URL` | Sim | Connection string do PostgreSQL (Railway injeta automaticamente) |
| `SESSION_SECRET` | Sim | Segredo de assinatura do cookie de sessão |
| `AUTH_SECRET` | Sim | Segredo geral de autenticação |
| `ADMIN_BOOTSTRAP_EMAIL` | Sim | E-mail do administrador principal — o auto-bootstrap no boot do servidor cria o admin com este e-mail se nenhum admin existir ainda (ver `docs/AUTHORIZATION.md`) |
| `ADMIN_BOOTSTRAP_SECRET` | Não | **Não usado pelo fluxo atual** (o bootstrap agora é automático no boot do servidor, sem endpoint manual). Pode deixar configurado sem problema — é inofensivo, só não tem mais efeito |
| `STORAGE_PROVIDER` | Sim | `r2` (Cloudflare R2, provedor aprovado) |
| `STORAGE_BUCKET` | Sim | Nome do bucket |
| `STORAGE_ACCESS_KEY_ID` / `STORAGE_SECRET_ACCESS_KEY` | Sim | Credenciais do bucket — escopo mínimo necessário |
| `STORAGE_ENDPOINT` | Sim | Endpoint S3-compatible do R2 |
| `STORAGE_PUBLIC_URL` | Sim | URL pública de entrega de mídia (CDN) |
| `SMTP_*` | Não (V1) | Necessário apenas se recuperação de senha por e-mail entrar na V1 |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX_ATTEMPTS` | Sim | Parâmetros de rate limiting de login |
| `SENTRY_DSN` | Não | Observabilidade de erros — opcional, custo a aprovar se sair do tier gratuito |

## Regras

- Nunca commitar `.env`.
- Nunca logar o valor de nenhuma variável desta lista.
- `ADMIN_BOOTSTRAP_SECRET` não tem mais efeito nenhum no fluxo atual (ver `docs/AUTHORIZATION.md`) — pode remover essa variável do Railway com segurança, se quiser.
- Em produção, todas as variáveis vivem no painel do Railway, nunca em arquivo versionado.
