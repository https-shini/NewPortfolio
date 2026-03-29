/* ═══════════════════════════════════════════════════════════════════════════
   MAIN.TSX — atualizado para v3.0
   Adicione a importação do theme-patches.css APÓS os outros estilos.
═══════════════════════════════════════════════════════════════════════════ */

import React from "react";
import ReactDOM from "react-dom/client";

// ── Global styles — ordem obrigatória ─────────────────────────────────────────
import "@/shared/styles/tokens.css"; // 1. Primitivos + semânticos (dark + light)
import "@/shared/styles/globals.css"; // 2. Reset + utilitários base
import "@/shared/styles/theme-patches.css"; // 3. Overrides de light mode por seção

import App from "@/app/App";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
