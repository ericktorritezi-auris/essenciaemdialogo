# Checklist de QA Regressivo (Sprint 9)

Não tenho como rodar testes automatizados de ponta a ponta a partir daqui (sem acesso ao banco real, sem browser). Esta é uma checklist estruturada para você (ou alguém testando o site) rodar manualmente antes do lançamento final — prioridades marcadas.

## 🔴 Prioridade alta — RBAC (nunca testado com conta real de Colaborador)

- [ ] Criar uma conta Colaborador (via banco direto, ou construir a UI de gestão de usuários — ainda não existe, ver `docs/AUTHORIZATION.md`)
- [ ] Logar como Colaborador, confirmar que **não** aparecem no menu: Home, Menu, Plataformas, Rádio, Perguntas
- [ ] Tentar acessar `/admin/home`, `/admin/platforms`, `/admin/radio` digitando a URL direto como Colaborador — deve dar 403/redirecionar, não mostrar a tela
- [ ] Como Colaborador, criar um Artigo — deve conseguir salvar como Rascunho e enviar para revisão
- [ ] Como Colaborador, tentar publicar diretamente — botão "Publicar" não deve aparecer
- [ ] Como Colaborador, tentar editar um Artigo de outro autor — deve ser recusado
- [ ] Como Admin, confirmar que consegue publicar o artigo que o Colaborador enviou para revisão

## 🔴 Prioridade alta — Timezone (o risco técnico mais citado no projeto desde o Plano Técnico)

- [ ] Publicar um conteúdo às 23:55 de um domingo (horário de Brasília) — confirmar que aparece em "Últimos Lançamentos" na semana correspondente
- [ ] Publicar um conteúdo às 00:05 de uma segunda-feira — confirmar que **não** aparece na semana anterior, só na nova
- [ ] Criar um Evento com horário específico, conferir que a data/hora exibida na página pública bate com o que foi digitado no admin (não deslocada)

## 🟡 Prioridade média — Fluxo completo por tipo de conteúdo

Para cada um de Episódio, Artigo, Notícia, Evento:
- [ ] Criar → Rascunho → Enviar para revisão → Publicar → aparece na listagem pública e na Home
- [ ] Pausar → some da listagem pública, mas continua existindo no admin
- [ ] Excluir (soft delete) → some de tudo, mas o registro continua no banco (não é reversível pela UI ainda)

## 🟡 Prioridade média — Perfil e sessão (Sprint 9)

- [ ] Trocar a própria senha com a senha atual correta → funciona, consegue logar de novo com a nova
- [ ] Trocar a própria senha com a senha atual errada → recusado, mensagem clara
- [ ] Clicar em "Sair" → volta para `/login`, e tentar acessar `/admin` de novo pede login

## 🟢 Prioridade normal — Mídia

- [ ] Upload de imagem válida (JPEG/PNG/WebP/GIF) → aparece na Biblioteca
- [ ] Tentar upload de um arquivo renomeado (ex.: `.exe` renomeado para `.jpg`) → deve ser recusado pela checagem de magic bytes
- [ ] Tentar excluir uma mídia em uso (definida como capa de algum conteúdo) → deve ser recusado com a lista de onde está em uso

## 🟢 Prioridade normal — Formulário de contato

- [ ] Enviar uma pergunta pelo `/contato` → aparece em `/admin/contact-submissions`, contador do menu incrementa
- [ ] Abrir `/admin/contact-submissions` → contador zera
- [ ] Enviar várias mensagens rapidamente (mais de 5 em 15 minutos) do mesmo IP → rate limit deve bloquear

## 🟢 Prioridade normal — Mobile/Acessibilidade

- [ ] Menu mobile abre/fecha corretamente, `Esc` fecha, foco vai para o primeiro link ao abrir
- [ ] Navegação só por teclado (sem mouse) consegue percorrer o site público inteiro
- [ ] Sem scroll horizontal em nenhuma largura de tela testada (320px, 768px, 1440px)
