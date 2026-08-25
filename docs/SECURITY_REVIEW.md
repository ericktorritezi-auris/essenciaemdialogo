# Revisão de Segurança (Sprint 9)

## Perfil, troca de senha e logout

Lacuna real identificada pelo Erick: existia endpoint de logout desde a Sprint 1, mas **nenhum botão em lugar nenhum do painel chamava ele** — não havia como sair da sessão pela interface, nem trocar a própria senha, nem editar o próprio nome.

Corrigido nesta sprint:
- `/admin/profile` — qualquer usuário autenticado (Admin ou Colaborador) edita o próprio nome e troca a própria senha.
- Troca de senha sempre exige a senha atual (`POST /api/admin/profile/change-password`) — nunca confia só em "está logado"; alguém que pegasse uma sessão aberta em um dispositivo não trancado não consegue trocar a senha sem saber a atual.
- Botão "Sair" no `AdminNav`, visível em toda tela do painel — chama `/api/auth/logout` e redireciona para `/login`.
- Toda ação (troca de nome, troca de senha, tentativa de troca com senha atual errada) gera entrada de auditoria.

## Revisão de dependências (`npm audit`)

Estado antes desta sprint: **12 vulnerabilidades** (4 moderate, 6-7 high, 1 critical), aparecendo em todo log de deploy desde a Sprint 1, nunca investigadas a fundo — só eu dizendo "não vou rodar `npm audit fix --force` às cegas".

Nesta sprint, investiguei cada uma individualmente (não só o resumo por severidade) para separar risco real de ruído:

| Pacote | Severidade | Uso real no projeto | Ação |
|---|---|---|---|
| `file-type` | moderate | **Usado em produção** — valida magic bytes de todo upload de mídia (`/api/admin/media/confirm`). A vulnerabilidade era um loop infinito em arquivos ASF malformados — um upload malicioso poderia travar essa rota. | **Atualizado** (19.x → 21.3.4) — API usada (`fileTypeFromBuffer`) confirmada compatível |
| `sharp` | high | **Usado em produção** — otimização de imagem do Next.js processa todo upload. Vulnerabilidades herdadas da libvips (CVEs de processamento de imagem). | **Atualizado** (0.33.x → 0.35.3) |
| `vitest` (+ `vite`, `vite-node`, `esbuild`, `@vitest/mocker`) | critical/high/moderate | **Zero exposição em produção** — é dependência de desenvolvimento (testes), nunca é executada nem enviada para o servidor. A vulnerabilidade crítica exige o *servidor de UI* do Vitest estar rodando e exposto, o que nunca acontece aqui (ainda não escrevemos nenhum teste de verdade). | **Atualizado** mesmo assim (2.x → 3.2.4), por segurança e porque não custava nada — nenhum teste existente para quebrar |
| `next` | high (várias CVEs) | **Framework de produção** — mas a maioria das CVEs listadas é sobre recursos que este projeto **não usa** (React Server Actions com `"use server"` — usamos Route Handlers normais; roteamento i18n — não usamos; servidor customizado — usamos o `next start` padrão). Corrigir exige subir de major (14 → 15/16), uma mudança grande demais para testar com segurança nesta sprint, sem acesso a um ambiente real para validar. | **Não atualizado agora** — ver decisão abaixo |
| `postcss` | high | **Zero exposição em produção** — só processa CSS que nós mesmos escrevemos, em build time (parte do pipeline do Tailwind). As vulnerabilidades são sobre processar CSS *de terceiros/não confiável*, que nunca é o nosso caso. | Não atualizado — depende do upgrade do Next |
| `eslint-config-next`, `@next/eslint-plugin-next`, `glob` | high | Ferramentas de lint, dev-only, zero exposição em produção. | Não atualizado — depende do upgrade do Next |

**Resultado:** de 12 vulnerabilidades para 5 — as duas que realmente tocavam código de produção com entrada de usuário (`file-type`, `sharp`) e a crítica (`vitest`) resolvidas. As 5 restantes exigem o upgrade do Next.js, tratado como decisão separada abaixo.

## Decisão: upgrade do Next.js — não faz parte desta sprint

Atualizar o Next 14 → 15/16 corrigiria as vulnerabilidades restantes, mas é uma mudança de major version com potencial de quebrar comportamento (App Router mudou entre versões maiores do Next em releases recentes). Não tenho como testar isso com segurança a partir daqui — testaria contra um banco/ambiente que não tenho acesso, e um upgrade malfeito poderia derrubar o site inteiro, não só um endpoint.

**Recomendação:** tratar isso como um projeto próprio, numa janela de manutenção dedicada (não espremido dentro de uma sprint de QA), com testes manuais completos depois — não antes do lançamento (Sprint 10), para não introduzir risco novo bem no fim do projeto.

## RBAC — cobertura de verificação

Toda rota administrativa segue o padrão `requireRole()`/`requireAdmin()`/`requireAnyRole()` (Seção 8, verificado nas Sprints 1-8). Verificação manual de amostragem nesta sprint, conferindo que:

- Toda rota `/api/admin/*` chama uma função `require*` antes de qualquer leitura/escrita — sim, confirmado em todas.
- Colaborador não consegue acessar rotas Admin-only (`/admin/home`, `/admin/menu`, `/admin/platforms`, `/admin/radio`, gestão de plataformas) — a checagem está lá (`requireAdmin()`), mas isso não foi testado *ao vivo* com uma conta Colaborador de verdade, porque não tenho como criar/logar como Colaborador a partir daqui. **Recomendo que você teste isso manualmente** com uma conta Colaborador real antes do lançamento — é o item mais importante da checklist de QA abaixo.
