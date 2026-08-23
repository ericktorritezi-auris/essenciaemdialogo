# Design System — Essência em Diálogo

## Paleta definitiva (aprovada)

| Token | Nome conceitual | HEX | Uso |
|---|---|---|---|
| `--color-charcoal` | Carvão profundo | `#1B1B1E` | Fundo base de seções |
| `--color-warm-black` | Preto quente | `#0D0C0B` | Header, fundo mais escuro |
| `--color-petrol` | Azul-petróleo quase preto | `#101C22` | Seções alternadas |
| `--color-ivory` | Marfim quente | `#EFE7D8` | Texto principal sobre fundo escuro |
| `--color-bronze` | Bronze/cobre | `#A9793F` | Detalhes, ícones, bordas, texto secundário |
| `--color-terracotta` | Terracota controlado | `#A5583A` | CTA e destaques pontuais — uso comedido, nunca como cor dominante |

Estes valores estão implementados em `src/styles/tokens.css` como CSS variables e referenciados no `tailwind.config.ts`. **Nunca hardcodar HEX diretamente em componentes.**

## Tipografia

- **Display (títulos):** Playfair Display — serifada editorial.
- **Corpo (interface/leitura):** Montserrat — sans-serif contemporânea.

As fontes ainda precisam ser carregadas via `next/font` (Google Fonts ou self-hosted, a decidir por licença/performance) — pendente de implementação na primeira tela real (Sprint 3).

## Princípios que orientam toda decisão visual

Evitar terminantemente: estética hospitalar, azul médico, cérebro/quebra-cabeça clichê, neon, visual gamer, esoterismo excessivo, template genérico, excesso de dourado, excesso de animação, estética coach motivacional (Seção 5 do Prompt Mestre).

A linguagem aprovada é: editorial, cinematográfica, premium, humana, profunda, elegante, contemporânea.

## Escopo desta sprint

Nesta etapa (Sprint 0) apenas os **tokens** foram definidos e centralizados. A composição real das telas (Home, página de Episódio, painel admin) segue as sprints correspondentes (3, 4, 2), aplicando estes tokens com a intencionalidade visual que o projeto pede — não apenas os valores técnicos.
