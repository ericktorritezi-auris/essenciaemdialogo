# Diagramação e Identidade Visual (Sprint 7)

## O que mudou

Esta sprint não trouxe funcionalidade nova — foi inteiramente sobre acabamento visual do que já existia estrutural e funcionalmente desde as Sprints 3-6.

### Assets de marca

- `public/brand/logo-icon.png` — símbolo da logomarca (balões + folha), recortado com transparência real a partir do arquivo original, usado no header e rodapé em vez de texto solto.
- `public/team/erick-torritezi.jpg` e `public/team/iolanda-reis.jpg` — fotos oficiais dos apresentadores, com tratamento duotone (preto quente → marfim, com bronze nos meios-tons) e vinheta radial, para integrar com o fundo escuro do site em vez de ficarem como recortes claros destoantes. Conectadas à seção Apresentadores via um patch automático que roda no boot (`ensureHostPhotosPatched()` em `src/lib/content/seed-defaults.ts`) — não sobrescreve nome/cargo se você já tiver editado esse texto.

### Elemento de assinatura visual

`src/components/public/wave-divider.tsx` — um divisor em forma de onda sonora, usado entre seções (rodapé, seção Apresentadores, seção Plataformas). Não é um ícone genérico: ecoa deliberadamente o motivo de ondas de áudio que já existe na própria logomarca de vocês, ao lado do símbolo dos balões de fala.

### Sistema de cartão compartilhado

`.content-card` em `src/app/globals.css` — um único lugar que define a aparência de todo cartão clicável do site (Últimos Lançamentos, Editoriais, Episódios, Artigos, Notícias, relacionados). Antes cada seção tinha sua própria versão ligeiramente diferente; agora é consistente, com hover sutil (leve elevação + borda destacada) respeitando `prefers-reduced-motion`.

### Páginas com tratamento visual completo

- Header e rodapé — logo real, navegação, plataformas
- Home: Hero (brilho radial, tipografia maior), Apresentadores (fotos reais), Últimos Lançamentos, Editoriais, Episódio em destaque, Episódios recentes, Eventos, Plataformas, blocos de texto (Manifesto/Sobre/CTA)
- Listagens públicas: Episódios, Artigos, Notícias, Eventos
- Páginas individuais: Episódio, Artigo, Notícia, Evento — tipografia de leitura com medida de linha mais confortável (`max-w-2xl` em vez de `max-w-3xl`), tamanho de fonte do corpo ligeiramente maior, `leading-relaxed`
- Página de busca

### Acessibilidade

Foco visível (outline em terracota) padronizado em todo o site público — antes só existia pontualmente.

## O que não entrou nesta sprint

- **Telas administrativas** (`/admin/*`) continuam com o visual mais utilitário das sprints anteriores — o pedido era especificamente sobre a experiência pública do site. Se fizer sentido investir nisso também, é um escopo à parte.
- Animações de entrada/scroll mais elaboradas (fade-in ao rolar, etc.) — o Hero tem uma leve micro-interação nos botões, mas nada além disso. Manter a Home rápida e sem excesso de movimento pesou mais que "impressionar" com animação.
- Dados estruturados schema.org, meta tags de compartilhamento (Open Graph) — isso é SEO, não diagramação, fica para a Sprint 8.
