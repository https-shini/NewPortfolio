/* ═══════════════════════════════════════════════════════════════════════════
   MAIN.TSX — atualizado para v3.0
   Adicione a importação do theme-patches.css APÓS os outros estilos.
═══════════════════════════════════════════════════════════════════════════ */

import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";

// ── Global styles — ordem obrigatória ─────────────────────────────────────────
import "@/shared/styles/tokens.css"; // 1. Primitivos + semânticos (dark + light)
import "@/shared/styles/globals.css"; // 2. Reset + utilitários base
import "@/shared/styles/theme-patches.css"; // 3. Overrides de light mode por seção

import App from "@/app/App";
import { getInitialLang } from "@/app/LangContext";

const raiz = document.getElementById("root")!;

const arvore = (
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

/* O build injeta a home já renderizada no #root (ver scripts/prerender.mjs),
   e aí o trabalho é hidratar — adotar o HTML que já está na tela em vez de
   pintá-lo de novo. O servidor de desenvolvimento serve o index.html cru,
   com o #root vazio, e ali é montagem normal.

   A rota precisa bater. O HTML gerado é o da home, e hidratar a home por
   cima de /links seria casar duas páginas diferentes: o React derrubaria a
   árvore inteira e ainda gastaria a tentativa. As reescritas mandam as
   outras rotas para o app.html, sem pré-renderização; esta conferência é o
   que segura o caso de a reescrita não existir. */
const podeHidratar =
    raiz.firstElementChild !== null &&
    raiz.dataset.prerendered === window.location.pathname &&
    /* O HTML sai do build em português. Para quem chega em inglês — por
       `?lang=en` ou pelo idioma do navegador — cada texto da página seria
       diferente do gerado, e o React reclamaria de todos eles. Melhor
       montar do zero: perde-se a pintura adiantada, não a correção. */
    raiz.dataset.lang === getInitialLang();

if (podeHidratar) {
    hydrateRoot(raiz, arvore);
} else {
    /* Conteúdo de outra rota na tela: some com ele antes de montar, para
       não deixar a página errada visível enquanto o React trabalha. */
    if (raiz.firstElementChild) raiz.replaceChildren();
    createRoot(raiz).render(arvore);
}
