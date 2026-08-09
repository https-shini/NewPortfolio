# App mobile — Capacitor

O app Android carrega o **mesmo build do site** (`apps/web/dist`, apontado
por `webDir`). Não há segunda interface para manter em sincronia.

## Por que `androidScheme: https`

O Capacitor serve o conteúdo por um esquema próprio dentro do WebView. Com
`http`, o Android trata a origem como insegura e bloqueia parte das APIs —
inclusive `localStorage`, que é onde o site guarda tema e idioma. Com
`https`, a origem é considerada segura e o roteamento por History API
funciona como na web, com o mesmo fallback para `index.html`.

É o mesmo problema que o app desktop resolve com `protocol.handle`, pela
mesma razão: rota de verdade exige origem de verdade.

## O que falta para gerar o `.apk`

A pasta `android/` **não está no repositório**, e isso é deliberado: ela é
gerada por `npx cap add android` e é grande, cheia de arquivo de projeto do
Gradle que polui o diff sem acrescentar informação.

Para gerar localmente, é preciso ter o Android SDK instalado:

```bash
npm run build                          # o dist do site, na raiz
npm run add:android --workspace apps/mobile
npm run sync     --workspace apps/mobile
cd apps/mobile/android && ./gradlew assembleRelease
```

O CI faz isso sozinho no workflow de release: o runner do GitHub já traz o
SDK, então `cap add android` roda lá e o `.apk` sai como asset da Release.

## Assinatura

Um `.apk` de release precisa de keystore própria. Ela **nunca** entra no
repositório — vai como secret do GitHub (`ANDROID_KEYSTORE_BASE64`,
`ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`), e o workflow a
reconstrói no runner na hora de assinar.

Sem os secrets configurados, o workflow gera um `.apk` **não assinado** —
instalável só com "fontes desconhecidas" liberado e depois de o próprio
Android avisar. Serve para testar; não serve para distribuir.

## Alvos de toque

Os breakpoints do site foram pensados para caber na tela, não para o dedo.
Antes de publicar, vale conferir num aparelho real se os alvos de 44px que
o CSS já define valem também dentro do WebView — o que passa no navegador
de desktop redimensionado nem sempre passa no toque.
