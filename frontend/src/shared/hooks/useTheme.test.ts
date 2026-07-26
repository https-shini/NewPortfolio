import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTheme } from "./useTheme";
import { THEME_KEY } from "@/shared/config/constants";

/** Stub de matchMedia que responde `prefersDark` para prefers-color-scheme. */
function stubMatchMedia(prefersDark: boolean) {
    const listeners = new Set<(e: MediaQueryListEvent) => void>();
    const mql = {
        get matches() {
            return prefersDark;
        },
        media: "(prefers-color-scheme: dark)",
        addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) =>
            listeners.add(cb),
        removeEventListener: (
            _: string,
            cb: (e: MediaQueryListEvent) => void,
        ) => listeners.delete(cb),
        dispatch: (matches: boolean) =>
            listeners.forEach((cb) => cb({ matches } as MediaQueryListEvent)),
    };
    vi.stubGlobal(
        "matchMedia",
        vi.fn(() => mql),
    );
    return mql;
}

describe("useTheme", () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.removeAttribute("data-theme");
        document.body.className = "";
        /* meta theme-color precisa existir para o hook atualizá-la */
        const meta = document.createElement("meta");
        meta.setAttribute("name", "theme-color");
        document.head.appendChild(meta);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        document.querySelector('meta[name="theme-color"]')?.remove();
    });

    it("dá precedência ao tema salvo no localStorage", () => {
        localStorage.setItem(THEME_KEY, "light");
        stubMatchMedia(true); // SO prefere dark, mas o salvo vence

        const { result } = renderHook(() => useTheme());

        expect(result.current.theme).toBe("light");
        expect(document.documentElement.getAttribute("data-theme")).toBe(
            "light",
        );
    });

    it("sem preferência salva, segue prefers-color-scheme do sistema", () => {
        stubMatchMedia(true);
        const { result } = renderHook(() => useTheme());
        expect(result.current.theme).toBe("dark");

        vi.unstubAllGlobals();
        stubMatchMedia(false);
        const { result: light } = renderHook(() => useTheme());
        expect(light.current.theme).toBe("light");
    });

    it("toggleTheme alterna, persiste e aplica no DOM", () => {
        localStorage.setItem(THEME_KEY, "dark");
        stubMatchMedia(true);

        const { result } = renderHook(() => useTheme());
        act(() => result.current.toggleTheme());

        expect(result.current.theme).toBe("light");
        expect(localStorage.getItem(THEME_KEY)).toBe("light");
        expect(document.documentElement.getAttribute("data-theme")).toBe(
            "light",
        );
        expect(document.body.classList.contains("light-mode")).toBe(true);
        expect(document.body.classList.contains("dark-mode")).toBe(false);
    });

    it("atualiza meta[name=theme-color] conforme o tema", () => {
        localStorage.setItem(THEME_KEY, "dark");
        stubMatchMedia(true);
        const { result } = renderHook(() => useTheme());

        const meta = document.querySelector('meta[name="theme-color"]')!;
        expect(meta.getAttribute("content")).toBe("#040710");

        act(() => result.current.toggleTheme());
        expect(meta.getAttribute("content")).toBe("#f2f4f8");
    });

    it("setTheme define um tema específico", () => {
        stubMatchMedia(false);
        const { result } = renderHook(() => useTheme());

        act(() => result.current.setTheme("dark"));

        expect(result.current.theme).toBe("dark");
        expect(document.body.classList.contains("dark-mode")).toBe(true);
    });

    it("segue mudanças do SO apenas quando não há preferência salva", () => {
        const mql = stubMatchMedia(false);
        const { result } = renderHook(() => useTheme());
        expect(result.current.theme).toBe("light");

        /* Sem nada salvo → acompanha o sistema */
        act(() => mql.dispatch(true));
        expect(result.current.theme).toBe("dark");

        /* Com preferência salva pelo usuário → ignora o sistema */
        act(() => result.current.setTheme("light"));
        expect(localStorage.getItem(THEME_KEY)).toBe("light");
        act(() => mql.dispatch(true));
        expect(result.current.theme).toBe("light");
    });
});
