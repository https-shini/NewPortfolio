import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { RouterProvider, useRouterContext } from "./RouterContext";
import { ROUTES } from "@/shared/config/routes";

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RouterProvider>{children}</RouterProvider>
);

const setPath = (path: string) => window.history.replaceState({}, "", path);

describe("RouterContext", () => {
    beforeEach(() => setPath(ROUTES.HOME));

    it("começa na rota do pathname atual", () => {
        setPath(ROUTES.LINKS);
        const { result } = renderHook(() => useRouterContext(), { wrapper });

        expect(result.current.path).toBe(ROUTES.LINKS);
        expect(result.current.isHome).toBe(false);
    });

    it("navigate troca a rota e empilha no histórico", () => {
        const { result } = renderHook(() => useRouterContext(), { wrapper });
        expect(result.current.isHome).toBe(true);

        act(() => result.current.navigate(ROUTES.LINKS));

        expect(result.current.path).toBe(ROUTES.LINKS);
        expect(window.location.pathname).toBe(ROUTES.LINKS);
        expect(result.current.isHome).toBe(false);
    });

    it("popstate devolve a rota anterior", () => {
        const { result } = renderHook(() => useRouterContext(), { wrapper });
        act(() => result.current.navigate(ROUTES.LINKS));

        /* jsdom não dispara popstate sozinho no back(): simula a volta. */
        act(() => {
            setPath(ROUTES.HOME);
            window.dispatchEvent(new PopStateEvent("popstate"));
        });

        expect(result.current.path).toBe(ROUTES.HOME);
        expect(result.current.isHome).toBe(true);
    });

    it("preserva o idioma compartilhável ao sair de uma rota inexistente", () => {
        setPath("/inexistente?lang=en");
        const { result } = renderHook(() => useRouterContext(), { wrapper });
        act(() => result.current.navigate(ROUTES.HOME));
        expect(result.current.path).toBe(ROUTES.HOME);
        expect(window.location.search).toBe("?lang=en");
    });

    it("normaliza a barra final", () => {
        setPath("/links/");
        const { result } = renderHook(() => useRouterContext(), { wrapper });
        expect(result.current.path).toBe(ROUTES.LINKS);
    });

    it("navegar para a rota corrente não empilha entrada nova", () => {
        setPath(ROUTES.LINKS);
        const { result } = renderHook(() => useRouterContext(), { wrapper });
        const lengthBefore = window.history.length;

        act(() => result.current.navigate(ROUTES.LINKS));

        expect(window.history.length).toBe(lengthBefore);
    });

    it("navigate entrega a query e o fragmento ao destino", () => {
        setPath(ROUTES.HOME);
        const { result } = renderHook(() => useRouterContext(), { wrapper });
        act(() => result.current.navigate("/orcamento?service=express"));
        expect(result.current.path).toBe("/orcamento");
        expect(result.current.search).toBe("?service=express");
        expect(window.location.search).toBe("?service=express");

        act(() => result.current.navigate("/#contato"));
        expect(result.current.path).toBe(ROUTES.HOME);
        expect(window.location.hash).toBe("#contato");
    });

    it("mesma rota com query diferente empilha; popstate restaura a query", () => {
        setPath("/orcamento?service=express");
        const { result } = renderHook(() => useRouterContext(), { wrapper });
        act(() => result.current.navigate("/orcamento?service=premium"));
        expect(result.current.search).toBe("?service=premium");

        act(() => {
            window.history.replaceState({}, "", "/orcamento?service=express");
            window.dispatchEvent(new PopStateEvent("popstate"));
        });
        expect(result.current.search).toBe("?service=express");
    });

    it("recusa endereço de outra origem", () => {
        setPath(ROUTES.LINKS);
        const { result } = renderHook(() => useRouterContext(), { wrapper });
        act(() => result.current.navigate("https://example.com/links"));
        expect(result.current.path).toBe(ROUTES.LINKS);
        expect(window.location.host).not.toBe("example.com");
    });

    it("exige o Provider", () => {
        expect(() => renderHook(() => useRouterContext())).toThrow(
            /RouterProvider/,
        );
    });
});
