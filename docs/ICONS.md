# Ícones — Favicon e Tela Inicial (iOS/Android)

## Arquivos gerados (`public/`)

| Arquivo | Uso |
|---|---|
| `favicon.ico` | Favicon clássico (multi-tamanho: 16/32/48) |
| `favicon-16x16.png`, `favicon-32x32.png`, `favicon-48x48.png` | Aba do navegador |
| `apple-touch-icon.png` (180×180) | Ícone ao adicionar à tela inicial no **iOS** (Safari) |
| `android-chrome-192x192.png`, `android-chrome-512x512.png` | Ícone ao adicionar à tela inicial no **Android** (Chrome) |
| `maskable-icon-512x512.png` | Versão com margem de segurança extra — Android pode recortar ícones em círculo/formas variadas ("ícones adaptativos"); esta versão evita que a marca fique cortada |
| `site.webmanifest` | Declara nome, cores e ícones do "app" para o Android reconhecer o site como instalável |

Todos derivados da logomarca oficial (`logomarca_EssenciaemDialogo.png`), recortando apenas o símbolo (balões + folha), sem o texto "Essência em diálogo" — comportamento padrão para favicons/ícones de app, que precisam funcionar em formato quadrado pequeno.

## Limitação conhecida

A logomarca é um render dourado com traços finos e anéis sobrepostos — em tamanhos muito pequenos (16-32px, o ícone da aba do navegador), parte do detalhe se perde visualmente. Isso é uma limitação física de qualquer logo com esse nível de detalhe, não específica desta implementação. Nos tamanhos que realmente importam para "adicionar à tela inicial" (180px iOS, 192-512px Android), o resultado é nítido e fiel à marca.

Se no futuro for desejado um favicon mais "limpo" em 16px, a solução correta seria um glifo vetorial simplificado desenhado especificamente para esse tamanho (não derivado do render 3D) — isso é opcional e não bloqueia nada.

## Onde isso é referenciado no código

`src/app/layout.tsx` — `metadata.icons`, `metadata.manifest` e `metadata.appleWebApp` apontam para estes arquivos via a Metadata API do Next.js. Cor de tema (`theme_color`/`viewport.themeColor`) usa `#0D0C0B` (preto quente), consistente com o Design System.
