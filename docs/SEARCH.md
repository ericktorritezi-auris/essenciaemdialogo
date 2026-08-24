# Busca e Contato

## Busca global

`/busca?q=...` — busca por título/resumo em Episódios, Artigos, Notícias e Eventos publicados, case-insensitive.

**Decisão de escopo:** o Plano Técnico previa PostgreSQL Full Text Search (`tsvector`/GIN) como solução ideal (Seção 47). Implementei uma busca por `contains` (equivalente a `ILIKE %termo%`) em vez disso — funciona corretamente, é simples, e evita escrever uma migration SQL de índice que eu não conseguiria testar contra um banco real a partir daqui.

**Quando migrar para FTS de verdade:** vale a pena quando o volume de conteúdo crescer o suficiente para a busca por `contains` ficar lenta (dezenas de milhares de linhas) ou quando relevância por ranking (não só "contém a palavra") passar a importar. Nenhum desses dois casos deve acontecer tão cedo com o volume de conteúdo deste projeto.

## Formulário de contato

`/contato` — formulário de "pergunta ao público", com:
- Aviso explícito de que não é canal terapêutico/emergência (com número do CVV), exigido pela Seção 3 do Prompt Mestre.
- Honeypot (campo invisível — só bots preenchem) como primeira camada anti-spam.
- Rate limiting por IP (reaproveita o limitador já usado no login).
- Sanitização de todos os campos antes de gravar.

Visualização das perguntas recebidas em `/admin/contact-submissions` (admin only — não é conteúdo editorial de Colaborador).

## Ação necessária depois do deploy

O item de menu "Contato" nasceu **desabilitado** no seed da Sprint 3 (a página não existia ainda). Agora existe — ative em `/admin/menu`.
