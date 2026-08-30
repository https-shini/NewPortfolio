import React from "react";
import { renderToString } from "react-dom/server";
import App from "@/app/App";

/* ─────────────────────────────────────────────────────────
   entry-server — a home renderizada em tempo de build
   ─────────────────────────────────────────────────────────
   Existe por um motivo medido: o `index.html` publicado tinha
   `<div id="root"></div>` e mais nada, então nada pintava antes de
   ~94 KB gzip de JavaScript baixarem e executarem. Num link rápido
   isso custava 0,7s; num aparelho modesto com 4G lento, 2,9s.

   Só a home entra aqui. `/links` e `/release-notes` são `lazy` em
   app/routes.tsx e continuam sendo montadas pelo cliente — nenhuma
   das duas é a primeira porta de entrada do site.

   O HTML sai no padrão do site: português e tema escuro. É o que os
   inicializadores devolvem quando não há navegador (ver a guarda em
   app/LangContext.tsx e em shared/hooks/useTheme.ts), e casa com o
   `<body class="dark-mode">` que o index.html já declarava.
───────────────────────────────────────────────────────── */

export function render(): string {
    /* Sem StrictMode: ele duplica render em desenvolvimento e aqui o que
       importa é o HTML, não a checagem. O cliente segue com ele. */
    return renderToString(<App />);
}
