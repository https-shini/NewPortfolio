import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useInertBackground } from "./useInertBackground";

/** Monta um body com o app e um overlay irmão, como em produção. */
function montarPagina() {
    document.body.innerHTML = `
        <div id="root"><button id="fundo">fundo</button></div>
        <div id="backdrop"><div id="dialog"><button>dentro</button></div></div>
    `;
    return {
        root: document.getElementById("root")!,
        backdrop: document.getElementById("backdrop")!,
        dialog: document.getElementById("dialog")!,
    };
}

describe("useInertBackground", () => {
    beforeEach(() => montarPagina());
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("inativo, não marca ninguém", () => {
        const { root } = montarPagina();
        const ref = { current: document.getElementById("dialog") };

        renderHook(() => useInertBackground(ref, false));

        expect(root.hasAttribute("inert")).toBe(false);
    });

    it("torna inerte o resto do body, poupando o overlay", () => {
        const { root, backdrop, dialog } = montarPagina();
        const ref = { current: dialog };

        renderHook(() => useInertBackground(ref, true));

        expect(root.hasAttribute("inert")).toBe(true);
        /* O backdrop contém o dialog — clicar nele fecha, de propósito. */
        expect(backdrop.hasAttribute("inert")).toBe(false);
    });

    it("libera tudo ao desativar", () => {
        const { root, dialog } = montarPagina();
        const ref = { current: dialog };

        const { unmount } = renderHook(() => useInertBackground(ref, true));
        unmount();

        expect(root.hasAttribute("inert")).toBe(false);
    });

    it("overlay aninhado não reativa o fundo ao fechar", () => {
        /* Um modal por cima do drawer: quando o de cima fecha, o fundo
           precisa continuar inerte por causa do de baixo. */
        const { root, dialog } = montarPagina();
        const ref = { current: dialog };

        const debaixo = renderHook(() => useInertBackground(ref, true));
        const emCima = renderHook(() => useInertBackground(ref, true));

        emCima.unmount();
        expect(root.hasAttribute("inert")).toBe(true);

        debaixo.unmount();
        expect(root.hasAttribute("inert")).toBe(false);
    });

    it("sem overlay no ref, ainda assim protege a página", () => {
        const { root } = montarPagina();
        const ref = { current: null };

        renderHook(() => useInertBackground(ref, true));

        expect(root.hasAttribute("inert")).toBe(true);
    });
});
