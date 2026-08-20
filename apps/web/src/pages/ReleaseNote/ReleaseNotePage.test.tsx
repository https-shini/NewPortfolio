import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import React from "react";
import { LangProvider } from "@/app/LangContext";
import { RouterProvider } from "@/app/RouterContext";
import { ReleaseNotePage } from "./index";
import { PROFILE } from "@/shared/config/profile";
import { RELEASE_NOTES } from "@/shared/config/releaseNotes";
import { releaseNotePath } from "@/shared/config/routes";

const [latest, previous] = RELEASE_NOTES;

const setup = (version: string) => {
    localStorage.setItem("portfolio-lang", "pt");
    window.history.replaceState({}, "", releaseNotePath(version));

    return render(
        <RouterProvider>
            <LangProvider>
                <ReleaseNotePage version={version} />
            </LangProvider>
        </RouterProvider>,
    );
};

describe("ReleaseNotePage", () => {
    beforeEach(() => {
        sessionStorage.clear();
        /* Endpoint pendente: a página se sustenta na camada local. */
        vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));
    });

    afterEach(() => vi.unstubAllGlobals());

    /* O h1 é a versão, e não o título: é ela que identifica a página e
       não muda de idioma. O título editorial vem logo abaixo, como h2. */
    it("anuncia a versão no h1 e o título no h2", () => {
        setup(latest!.version);

        expect(
            screen.getByRole("heading", {
                level: 1,
                name: `v${latest!.version}`,
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("heading", { level: 2, name: latest!.title.pt }),
        ).toBeInTheDocument();
    });

    it("situa a página com uma trilha até a home", () => {
        setup(latest!.version);

        /* Dentro da trilha, e não na página: o header do site também tem
           uma âncora "Início", e ela aponta para `#inicio`. */
        const trilha = screen.getByRole("navigation", { name: /Você está em/ });
        expect(
            within(trilha).getByRole("link", { name: "Início" }),
        ).toHaveAttribute("href", "/");
        expect(within(trilha).getByText(`v${latest!.version}`)).toHaveAttribute(
            "aria-current",
            "page",
        );
    });

    /* O tratamento crimson do cartão quer dizer "é esta que está no ar".
       Aplicado a uma versão antiga, ele dizia isso de uma release de dois
       anos atrás. */
    it("só a versão corrente recebe a superfície de destaque", () => {
        const { unmount } = setup(latest!.version);
        expect(document.querySelector(".release-card")).not.toHaveClass(
            "release-card--arquivo",
        );
        unmount();

        setup(previous!.version);
        expect(document.querySelector(".release-card")).toHaveClass(
            "release-card--arquivo",
        );
    });

    it("usa o mesmo header e rodapé do site", () => {
        setup(latest!.version);

        expect(document.getElementById("site-header")).toBeInTheDocument();
        expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });

    it("define título e canonical da versão", () => {
        setup(latest!.version);

        expect(document.title).toContain(`v${latest!.version}`);
        expect(document.title).toContain(PROFILE.name);
        expect(
            document.head
                .querySelector('link[rel="canonical"]')
                ?.getAttribute("href"),
        ).toBe(`${PROFILE.siteUrl}${releaseNotePath(latest!.version)}`);
    });

    it("aceita a versão com ou sem o prefixo v", () => {
        setup(`v${latest!.version}`);
        expect(
            screen.getByRole("heading", {
                level: 1,
                name: `v${latest!.version}`,
            }),
        ).toBeInTheDocument();
    });

    it("oferece o caminho de volta para o índice", () => {
        setup(latest!.version);

        expect(
            screen.getByRole("link", { name: /Todas as versões/ }),
        ).toHaveAttribute("href", "/release-notes");
    });

    it("liga as versões vizinhas", () => {
        setup(previous!.version);

        /* A anterior tem uma mais nova acima e uma mais velha abaixo. */
        expect(
            screen.getByRole("link", { name: new RegExp(latest!.title.pt) }),
        ).toHaveAttribute("href", releaseNotePath(latest!.version));
    });

    it("a mais recente não aponta para uma versão mais nova", () => {
        setup(latest!.version);

        expect(
            screen.queryByText("Versão mais recente"),
        ).not.toBeInTheDocument();
    });

    it("enquanto carrega, não declara versão inexistente", () => {
        /* Uma versão que só existe no GitHub ainda não chegou. Dizer
           "não encontrada" aqui seria errado. */
        setup("9.9.9");

        expect(screen.getByText("Carregando a versão")).toBeInTheDocument();
        expect(
            screen.queryByText("Versão não encontrada"),
        ).not.toBeInTheDocument();
    });

    it("versão inexistente não quebra a página", () => {
        expect(() => setup("9.9.9")).not.toThrow();
        expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });
});
