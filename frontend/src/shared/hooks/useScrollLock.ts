import { useEffect } from "react";

/* ─────────────────────────────────────────────────────────
   useScrollLock — congela a página enquanto um overlay está aberto
   ─────────────────────────────────────────────────────────
   Por que não basta `body { overflow: hidden }`:

   quem rola nesta página é o <html>, não o <body>. O globals.css
   declara `html { overflow-x: clip }`, e um overflow que não seja
   `visible` num eixo faz o outro computar para `auto` — o <html>
   vira a origem de rolagem do viewport e o overflow do <body>
   deixa de ser propagado. Medido no navegador: com a versão
   anterior a página rolava normalmente com o modal aberto.

   A técnica aqui é tirar o <body> do fluxo e deslocá-lo pelo tanto
   que já estava rolado. O recorte visível continua idêntico, o
   viewport não tem mais o que rolar, e nenhum gesto passa —
   inclusive o toque no iOS, onde `overflow: hidden` não segura.

   Ao destravar, a posição exata é devolvida. Isso importa porque
   focar o gatilho de um modal já rola a página sozinho: o cartão
   de recomendação é um <button>, e abri-lo saltava 2.000px.
───────────────────────────────────────────────────────── */

interface SavedState {
    scrollY: number;
    bodyPosition: string;
    bodyTop: string;
    bodyLeft: string;
    bodyRight: string;
    bodyWidth: string;
    htmlPaddingRight: string;
}

/* Estado em módulo, e não por hook: dois overlays abertos ao mesmo
   tempo — um modal por cima do drawer, por exemplo — precisam de uma
   trava só. Fechar o de cima não pode destravar a página. */
let lockCount = 0;
let saved: SavedState | null = null;

function lock(): void {
    if (lockCount++ > 0) return;

    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;

    /* Sem o <body> no fluxo o documento encolhe e a barra de rolagem
       some; sem compensar, todo o conteúdo salta para o lado. */
    const scrollbarWidth = window.innerWidth - html.clientWidth;

    saved = {
        scrollY,
        bodyPosition: body.style.position,
        bodyTop: body.style.top,
        bodyLeft: body.style.left,
        bodyRight: body.style.right,
        bodyWidth: body.style.width,
        htmlPaddingRight: html.style.paddingRight,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    if (scrollbarWidth > 0) {
        html.style.paddingRight = `${scrollbarWidth}px`;
    }
}

function unlock(): void {
    if (lockCount === 0) return;
    if (--lockCount > 0) return;
    if (!saved) return;

    const html = document.documentElement;
    const body = document.body;
    const { scrollY } = saved;

    body.style.position = saved.bodyPosition;
    body.style.top = saved.bodyTop;
    body.style.left = saved.bodyLeft;
    body.style.right = saved.bodyRight;
    body.style.width = saved.bodyWidth;
    html.style.paddingRight = saved.htmlPaddingRight;
    saved = null;

    /* `instant` explícito: o globals.css define `scroll-behavior: smooth`
       no <html>, e sem isto a volta viraria uma animação visível. */
    window.scrollTo({
        top: scrollY,
        left: 0,
        behavior: "instant" as ScrollBehavior,
    });
}

/**
 * useScrollLock — trava a rolagem da página enquanto `active` for true
 * e devolve a posição exata ao destravar.
 *
 * Usado por todo overlay que cobre a página: o Modal base e o drawer
 * de navegação do Header.
 */
export function useScrollLock(active: boolean): void {
    useEffect(() => {
        if (!active) return;
        lock();
        return unlock;
    }, [active]);
}

/** Só para os testes: zera o contador entre casos. */
export function __resetScrollLock(): void {
    lockCount = 0;
    saved = null;
}
