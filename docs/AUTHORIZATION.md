# Autenticação e RBAC

## Modelo

Dois papéis nativos (`UserRole` no Prisma): `ADMIN` e `COLLABORATOR`. Sem tabela `Role`/`Permission` separada nesta fase — decisão deliberada de manter simples agora e só migrar para permissões granulares (ex.: `PUBLISH_CONTENT` isolado) se/quando for necessário (pendência registrada na Seção 25 do Plano Técnico).

## Sessão

- Cookie `HttpOnly`, `Secure` em produção, `SameSite=Lax`, criptografado com [iron-session](https://github.com/vvo/iron-session) usando `SESSION_SECRET`.
- O cookie carrega só o `userId`. **Nunca** o papel — o papel é sempre relido do banco a cada request (`getCurrentUser()`), para que desativar um usuário tenha efeito imediato mesmo com o cookie ainda tecnicamente válido.

## Duas camadas de proteção do `/admin`

1. **Middleware** (`src/middleware.ts`) — roda no edge, só checa se existe cookie de sessão. É um atalho de UX (evita ida ao banco para quem nem tem cookie), **não é a fronteira de segurança**.
2. **Layout `/admin`** (`src/app/admin/layout.tsx`) — roda no servidor, decripta a sessão, consulta o banco (`requireAnyRole()`), e só então libera o conteúdo. Esta é a fronteira real. Toda nova rota/endpoint administrativo deve chamar `requireRole()`/`requireAdmin()`/`requireAnyRole()` (`src/lib/auth/rbac.ts`) explicitamente — nunca confiar em "está dentro de `/admin` então já tá protegido".

## Bootstrap do administrador principal — 100% automático

Não há usuário admin hardcoded em lugar nenhum do código, e **nenhum comando manual é necessário**.

Como funciona: `src/instrumentation.ts` roda automaticamente toda vez que o servidor Next.js sobe (inclusive no Railway, a cada deploy). Ele chama `ensureAdminBootstrapped()` (`src/lib/auth/bootstrap-admin.ts`), que:

1. Verifica se já existe algum usuário com papel `ADMIN`. Se sim, não faz nada (idempotente — seguro rodar em todo deploy).
2. Se não existe nenhum, cria o admin usando `ADMIN_BOOTSTRAP_EMAIL` (variável de ambiente) e uma senha forte gerada automaticamente.
3. Imprime essa senha **uma única vez** no log de boot da aplicação — visível na aba **Deployments → Logs** do Railway.

Depois do primeiro deploy, é só:
1. Abrir os logs do Railway e copiar a senha do bloco `ADMIN CRIADO AUTOMATICAMENTE`.
2. Entrar em `/login` com `ADMIN_BOOTSTRAP_EMAIL` + essa senha.
3. (Recomendado, não obrigatório ainda) trocar a senha depois de entrar — a troca de senha autosserviço entra no CMS de gestão de usuários (Sprint 2); por enquanto, se quiser trocar antes disso, me avise que gero um novo hash direto.

`ADMIN_BOOTSTRAP_SECRET` não é mais usado neste fluxo (o endpoint `/api/auth/bootstrap` que dependia dele foi removido) — pode deixar a variável configurada no Railway sem problema, ela simplesmente não tem mais efeito nenhum.

## Migrations do banco — também automáticas

O comando de start (`package.json` → `start`) roda `prisma db push` **antes** de subir o Next.js, a cada deploy. Isso aplica o schema (`prisma/schema.prisma`) diretamente no banco, sem exigir nenhum comando manual seu.

**Nota técnica importante, para você saber o que está rodando:** por enquanto uso `prisma db push` em vez de `prisma migrate deploy` porque o segundo exige um histórico de migrations já versionado no repositório (arquivos SQL gerados rodando `prisma migrate dev` contra um banco real) — e eu não tenho acesso ao banco de vocês no Railway a partir daqui para gerar esse histórico com segurança. `db push` sincroniza o schema direto, sem manter esse histórico versionado. Funciona bem e é seguro para o estágio atual (schema ainda mudando bastante, banco ainda sem dados de produção). Antes do lançamento final (Sprint 8/9), vamos migrar para `migrate deploy` com migrations versionadas de verdade — nesse ponto o schema estará mais estável e será mais seguro gerar o histórico definitivo.

**Atualização (Sprint 4) — processo de mudança de schema arriscada, leia isto:** o `db push` recusa aplicar sozinho qualquer mudança que ele classifique como "risco de perda de dado" (ex.: adicionar uma restrição de unicidade nova) — mesmo quando, na prática, não há risco nenhum, como foi o caso da chave `key` do `Platform` nesta sprint (tabela vazia). Sem confirmação, o deploy trava em loop de reinício — e como não há acesso a terminal para rodar `--accept-data-loss` manualmente, ficamos sem saída a não ser combinar isso de outro jeito.

**Processo acordado (vale a partir de agora):** `--accept-data-loss` **não fica ligado por padrão**. Quando eu fizer uma mudança de schema que o Prisma classificaria como arriscada, eu paro, explico exatamente o que está mudando e por que considero seguro (ou não) antes de te entregar o ZIP, e só incluo a flag para aquele release específico depois da sua aprovação explícita aqui no chat — essa conversa substitui o prompt interativo do terminal que você não consegue responder. Nesta sprint, a flag foi incluída porque a mudança (`Platform.key`) foi revisada e aprovada dessa forma. Nas próximas, o padrão volta a ser sem a flag, a menos que uma mudança específica precise dela de novo — e nesse caso, aviso antes.

Isso é especialmente importante a partir do momento em que houver conteúdo real no banco (artigos publicados de verdade, perguntas de audiência, etc.) — a partir daí, qualquer aprovação minha precisa considerar dado real em jogo, não só "a tabela está vazia".

## Rate limiting de login

Em memória, por `IP + e-mail`, configurável via `RATE_LIMIT_WINDOW_MS`/`RATE_LIMIT_MAX_ATTEMPTS`. **Limitação conhecida:** só funciona corretamente com uma única instância da aplicação — o que é o caso atual (ambiente só de produção, sem múltiplas réplicas). Se isso mudar no futuro, precisa migrar para um store compartilhado (Redis).

## O que ainda falta (fora do escopo desta sprint)

- Tela de gestão de usuários (criar Colaborador, desativar, trocar papel, permitir que o próprio admin troque a senha pela UI) — entra junto com o CMS editorial (Sprint 2).
- Recuperação de senha "esqueci minha senha" para usuários já existentes — o endpoint `POST /api/auth/set-password` já existe e continua funcionando (usa os mesmos campos `passwordSetTokenHash`/`passwordSetTokenExpiresAt` do schema), só falta o endpoint que **gera** um novo token para um e-mail existente e o entrega (hoje isso exigiria e-mail transacional, ainda não configurado).
- 2FA para o Admin — avaliado como melhoria futura, não bloqueante para V1 (Seção 8 do Plano Técnico).
