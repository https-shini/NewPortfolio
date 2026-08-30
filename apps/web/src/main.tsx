/* ═══════════════════════════════════════════════════════════════════════════
   MAIN.TSX — atualizado para v3.0
   Adicione a importação do theme-patches.css APÓS os outros estilos.
═══════════════════════════════════════════════════════════════════════════ */

import React from "react";
import { createRoot } from "react-dom/client";

// ── Global styles — ordem obrigatória ─────────────────────────────────────────
import "@/shared/styles/tokens.css"; // 1. Primitivos + semânticos (dark + light)
import "@/shared/styles/globals.css"; // 2. Reset + utilitários base
import "@/shared/styles/theme-patches.css"; // 3. Overrides de light mode por seção

import App from "@/app/App";

/* Houve aqui uma pré-renderização da home com hidratação. Ela foi revertida
   por medição, não por gosto: o PageSpeed no celular caiu de 86 para 81 —
   FCP 2,9→3,2s, LCP 3,0→3,4s e TBT 20→200ms. Hidratar ~110 KB de DOM cobra
   main thread num aparelho modesto, e o ganho de pintura (~150ms no meu A/B
   com rede estrangulada) não pagou a conta.

   Se o assunto voltar, o que faltou da primeira vez foi medir LCP e TBT, e
   não só o FCP que eu esperava melhorar. */
createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
