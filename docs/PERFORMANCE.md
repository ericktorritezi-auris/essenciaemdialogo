# Performance (Sprint 8)

## `sharp` instalado

Resolve o aviso que aparecia nos logs de deploy desde a Sprint 7 (`For production Image Optimization with Next.js, the optional 'sharp' package is strongly recommended`). Sem ele, o Next usa um otimizador de imagem em JavaScript puro como alternativa — funciona, só é mais lento. Com `sharp`, toda imagem otimizada via `next/image` (logo, fotos dos apresentadores) passa a usar processamento nativo.

## `remotePatterns` dinâmico

`next.config.mjs` monta `images.remotePatterns` a partir de `STORAGE_PUBLIC_URL` em build time, em vez de um domínio fixo hardcoded. Isso significa que `next/image` já está pronto para otimizar capas vindas do Cloudflare R2 assim que forem usadas com esse componente — sem precisar editar este arquivo manualmente de novo.

## Decisão consciente: capas de conteúdo continuam com `<img>`, não `<Image>`

As imagens de capa (Episódios, Artigos, Notícias, Eventos — nos cards e nas páginas individuais) continuam usando a tag `<img>` normal, não o componente `next/image`. Isso é deliberado, não esquecimento: converter todas essas ocorrências exigiria calcular `width`/`height` (ou usar `fill`) em dezenas de lugares com contêineres de proporção variável, e eu não tenho como testar visualmente o resultado a partir daqui — o risco de quebrar um layout que hoje funciona é real. Em vez disso, apliquei uma otimização mais simples e sem risco de regressão: **`loading="lazy"` em todas as imagens de capa** — o navegador só carrega a imagem quando ela está perto de entrar na tela, o que já é o ganho de performance mais significativo para páginas com várias capas (listagens, Últimos Lançamentos).

Se no futuro fizer sentido converter essas capas para `next/image` (para ganhar otimização de formato/tamanho automática), é um trabalho bem definido — dá para fazer, mas pede uma sprint própria de testes visuais.

## O que ainda falta (fora do escopo desta sprint)

- Conversão das capas de conteúdo para `next/image` (ver decisão acima).
- Cache/ISR nas páginas públicas — hoje todas usam `force-dynamic` (renderização a cada request), por causa da limitação de build-time sem acesso ao banco (Sprint 3). Migrar para ISR com revalidação sob demanda (webhook ao publicar) traria uma melhoria real de performance, mas reintroduziria o mesmo tipo de risco que já quebrou o build uma vez — decidi não arriscar isso nesta sprint sem conseguir testar localmente contra um banco real. Fica para quando houver uma janela mais segura para testar.
- Lighthouse CI ou qualquer medição formal de Core Web Vitals — não configurado; as melhorias desta sprint são estruturais (fontes corretas, lazy loading, sharp), não medidas com uma ferramenta específica.
