import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useScrollLock, __resetScrollLock } from "./useScrollLock";

describe("useScrollLock", () => {
    beforeEach(() => {
        __resetScrollLock();
        document.body.removeAttribute("style");
        document.documentElement.removeAttribute("style");

        /* jsdom não faz layout: simula uma página rolada e com barra. */
        Object.defineProperty(window, "scrollY", {
            value: 1200,
            writable: true,
            configurable: true,
        });
        Object.defineProperty(window, "innerWidth", {
            value: 1024,
            writable: true,
            configurable: true,
        });
        Object.defineProperty(document.documentElement, "clientWidth", {
            value: 1009,
            writable: true,
            configurable: true,
        });
        vi.stubGlobal(
            "scrollTo",
            vi.fn((opts: ScrollToOptions) => {
                (window as { scrollY: number }).scrollY = opts.top ?? 0;
            }),
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        __resetScrollLock();
        document.body.removeAttribute("style");
        document.documentElement.removeAttribute("style");
    });

    it("inativo, não toca em nada", () => {
        renderHook(() => useScrollLock(false));
        expect(document.body.style.position).toBe("");
    });

    it("tira o body do fluxo deslocado pelo que já estava rolado", () => {
        renderHook(() => useScrollLock(true));

        expect(document.body.style.position).toBe("fixed");
        expect(document.body.style.top).toBe("-1200px");
        expect(document.body.style.width).toBe("100%");
    });

    it("compensa a largura da barra de rolagem", () => {
        renderHook(() => useScrollLock(true));
        /* 1024 - 1009 = 15px de barra. */
        expect(document.documentElement.style.paddingRight).toBe("15px");
    });

    it("devolve a posição exata ao destravar", () => {
        const { unmount } = renderHook(() => useScrollLock(true));
        unmount();

        expect(window.scrollTo).toHaveBeenCalledWith({
            top: 1200,
            left: 0,
            behavior: "instant",
        });
        expect(window.scrollY).toBe(1200);
    });

    it("não deixa estilo residual", () => {
        const { unmount } = renderHook(() => useScrollLock(true));
        unmount();

        expect(document.body.style.position).toBe("");
        expect(document.body.style.top).toBe("");
        expect(document.body.style.width).toBe("");
        expect(document.documentElement.style.paddingRight).toBe("");
    });

    it("preserva o estilo que já existia no body", () => {
        document.body.style.position = "relative";

        const { unmount } = renderHook(() => useScrollLock(true));
        expect(document.body.style.position).toBe("fixed");

        unmount();
        expect(document.body.style.position).toBe("relative");
    });

    it("dois overlays abertos formam uma trava só", () => {
        /* Fechar o de cima não pode liberar a página com o de baixo aberto —
           é o caso do lightbox aberto por cima do drawer. */
        const primeiro = renderHook(() => useScrollLock(true));
        const segundo = renderHook(() => useScrollLock(true));

        segundo.unmount();
        expect(document.body.style.position).toBe("fixed");
        expect(window.scrollTo).not.toHaveBeenCalled();

        primeiro.unmount();
        expect(document.body.style.position).toBe("");
        expect(window.scrollTo).toHaveBeenCalledTimes(1);
    });

    it("a posição guardada é a da primeira trava", () => {
        const primeiro = renderHook(() => useScrollLock(true));

        /* O segundo overlay abre com o body já fixo, onde scrollY é 0. */
        (window as { scrollY: number }).scrollY = 0;
        const segundo = renderHook(() => useScrollLock(true));

        segundo.unmount();
        primeiro.unmount();

        expect(window.scrollTo).toHaveBeenCalledWith(
            expect.objectContaining({ top: 1200 }),
        );
    });
});
