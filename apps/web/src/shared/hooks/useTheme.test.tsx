import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, render, screen } from "@testing-library/react";
import { useTheme } from "./useTheme";
import { ThemeProvider } from "@/app/ThemeContext";
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

/* O estado do tema agora mora num Provider, então todo consumidor precisa
   estar debaixo dele. `renderHook` aceita o wrapper direto. */
const comProvider = { wrapper: ThemeProvider };

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

        const { result } = renderHook(() => useTheme(), comProvider);

        expect(result.current.theme).toBe("light");
        expect(document.documentElement.getAttribute("data-theme")).toBe(
            "light",
        );
    });

    it("sem preferência salva, segue prefers-color-scheme do sistema", () => {
        stubMatchMedia(true);
        const { result } = renderHook(() => useTheme(), comProvider);
        expect(result.current.theme).toBe("dark");

        vi.unstubAllGlobals();
        stubMatchMedia(false);
        const { result: light } = renderHook(() => useTheme(), comProvider);
        expect(light.current.theme).toBe("light");
    });

    it("toggleTheme alterna, persiste e aplica no DOM", () => {
        localStorage.setItem(THEME_KEY, "dark");
        stubMatchMedia(true);

        const { result } = renderHook(() => useTheme(), comProvider);
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
        const { result } = renderHook(() => useTheme(), comProvider);

        const meta = document.querySelector('meta[name="theme-color"]')!;
        expect(meta.getAttribute("content")).toBe("#040710");

        act(() => result.current.toggleTheme());
        expect(meta.getAttribute("content")).toBe("#f2f4f8");
    });

    it("setTheme define um tema específico", () => {
        stubMatchMedia(false);
        const { result } = renderHook(() => useTheme(), comProvider);

        act(() => result.current.setTheme("dark"));

        expect(result.current.theme).toBe("dark");
        expect(document.body.classList.contains("dark-mode")).toBe(true);
    });

    it("segue mudanças do SO apenas quando não há preferência salva", () => {
        const mql = stubMatchMedia(false);
        const { result } = renderHook(() => useTheme(), comProvider);
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

    /* ── O caso que o arranjo anterior NÃO podia ter ──────────────────
       Antes, `useTheme` era um `useState` por chamador: dois componentes
       pedindo o tema recebiam dois estados independentes, e o cabeçalho do
       arquivo avisava para não fazer isso. O aviso não impedia nada — a
       `pages/Links` chamava em paralelo com o Header, e os ícones de stack
       de lá ficavam com o tema velho quando o botão do Header era usado.

       Este caso é a prova de que acabou: dois consumidores irmãos, um
       alterna, e o OUTRO vê. Com o código antigo ele reprovaria — e eu
       conferi que reprova, trocando o reexport pelo useState de volta. */
    it("dois consumidores compartilham o mesmo tema", async () => {
        stubMatchMedia(true);

        const Mostrador: React.FC<{ id: string }> = ({ id }) => {
            const { theme } = useTheme();
            return <span data-testid={id}>{theme}</span>;
        };
        const Botao: React.FC = () => {
            const { toggleTheme } = useTheme();
            return <button onClick={toggleTheme}>trocar</button>;
        };

        render(
            <ThemeProvider>
                <Mostrador id="a" />
                <Botao />
                <Mostrador id="b" />
            </ThemeProvider>,
        );

        expect(screen.getByTestId("a").textContent).toBe("dark");
        expect(screen.getByTestId("b").textContent).toBe("dark");

        await act(async () => {
            screen.getByRole("button", { name: "trocar" }).click();
        });

        /* Os DOIS mudaram, não só o que está perto do botão. */
        expect(screen.getByTestId("a").textContent).toBe("light");
        expect(screen.getByTestId("b").textContent).toBe("light");
        expect(document.documentElement.dataset.theme).toBe("light");
    });
});
