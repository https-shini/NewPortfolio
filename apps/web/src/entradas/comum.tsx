/**
 * O que toda entrada de documento faz — e por que há mais de uma.
 *
 * Cada rota é servida por um HTML próprio, gerado em build a partir do
 * `index.html` (ver `rotaHtmlPlugin` em vite.config.ts). Cada documento
 * aponta para uma entrada diferente, e é isso que faz o Rollup dar a
 * cada rota **o seu** pedaço de JavaScript e a sua folha de estilo, já
 * ligados no HTML.
 *
 * Antes havia um documento só: quem abria `/links` baixava e compilava a
 * home inteira para desenhar uma página que não usa nada dela — 21 KiB
 * de JS e 22 KiB de CSS que o PageSpeed media como não usados.
 *
 * A página da rota entra por `import` estático na entrada. Isso a põe no
 * grafo daquele documento (e só dele), e o `React.lazy` de `routes.tsx`
 * a encontra já no registro de módulos, sem ida à rede.
 */
import React from "react";
import { createRoot } from "react-dom/client";

/* ── A JetBrains Mono, servida do próprio domínio ────────────────────
   Antes vinha do Google Fonts por <link> no index.html. Agora é npm:
   quatro pesos (os mesmos que aquele link pedia), subconjunto `latin`,
   WOFF2, `font-display: swap` — que o @fontsource já declara no arquivo.

   `latin-NNN.css` e não `NNN.css`: o genérico traz seis @font-face (latin,
   latin-ext, cyrillic, cyrillic-ext, greek, vietnamese). O `unicode-range`
   impediria o download dos não usados, mas o CSS deles viajaria à toa, e
   `latin` cobre o português inteiro — os acentos de ã, ç, õ e companhia
   estão no Latin-1 Supplement.

   Antes destes imports, de propósito: o @font-face precisa estar
   declarado quando os tokens que referenciam a família forem aplicados.

   As outras duas famílias (Cabinet Grotesk e General Sans) continuam
   remotas, no Fontshare — ver o comentário no index.html. */
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-500.css";
import "@fontsource/jetbrains-mono/latin-600.css";
import "@fontsource/jetbrains-mono/latin-700.css";

/* Ordem obrigatória: primitivos e semânticos, reset e utilitários, e por
   último os ajustes de tema claro por seção. */
import "@/shared/styles/tokens.css";
import "@/shared/styles/globals.css";
import "@/shared/styles/theme-patches.css";

import App from "@/app/App";

/* Houve aqui uma pré-renderização da home com hidratação. Ela foi revertida
   por medição, não por gosto: o PageSpeed no celular caiu de 86 para 81 —
   FCP 2,9→3,2s, LCP 3,0→3,4s e TBT 20→200ms. Hidratar ~110 KB de DOM cobra
   main thread num aparelho modesto, e o ganho de pintura (~150ms no meu A/B
   com rede estrangulada) não pagou a conta.

   Se o assunto voltar, o que faltou da primeira vez foi medir LCP e TBT, e
   não só o FCP que eu esperava melhorar. */
export function montar(): void {
    createRoot(document.getElementById("root")!).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );
}
