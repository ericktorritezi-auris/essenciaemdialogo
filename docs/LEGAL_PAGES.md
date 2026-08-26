# Páginas Legais (correção — Sprint 12)

## O que mudou

Quando entreguei `/privacidade` e `/termos` pela primeira vez, o texto estava **hardcoded no código** (direto no JSX da página) — o Erick perguntou como validar/corrigir isso pelo admin, e a resposta honesta era: não dava, porque eu tinha construído errado. Isso contrariava o princípio que segui em todo o resto do projeto (nenhum conteúdo editorial fixo no código — Seção 3 do Prompt Mestre).

Corrigido: o texto agora vive no banco (`LegalPage`), editável em `/admin/legal-pages` com o mesmo editor visual (Tiptap) usado em Artigos/Notícias/Eventos/Episódios.

## O fluxo de revisão

- `reviewedAt` é o "OK" formal. Enquanto for `null`, a página pública (`/privacidade`, `/termos`) mostra o aviso de minuta técnica.
- Botão "Marcar como revisado" em `/admin/legal-pages` registra `reviewedAt` + `reviewedBy` (nome de quem revisou) — o aviso some da página pública a partir daí.
- **Qualquer edição do conteúdo zera a revisão automaticamente** — se o texto mudou, o "OK" anterior não vale mais para o texto novo. Isso é proposital: evita que uma correção pequena "herde" a aprovação de uma versão anterior diferente.

## Importante

Marcar como "revisado" no admin é um controle **técnico** (o site para de mostrar o aviso de minuta) — não substitui a revisão jurídica de verdade por um profissional. A recomendação continua sendo: um advogado (ou o próprio Erick, se se sentir seguro) lê o texto, corrige o que precisar direto no editor, e só então marca como revisado.

## Onde o texto inicial veio

O conteúdo inicial (seed automático, `ensureLegalPagesSeeded()`) é a mesma minuta que eu tinha escrito originalmente — só migrou de "hardcoded no JSX" para "linha no banco, editável". Nenhum texto novo foi inventado nesta correção.
