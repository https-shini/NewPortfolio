import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { UnderConstructionPage } from ".";
import { LangProvider } from "@/app/LangContext";
import { RouterProvider } from "@/app/RouterContext";
import { ROUTES } from "@/shared/config/routes";

function renderPage(lang = "pt") {
    localStorage.setItem("portfolio-lang", lang);
    window.history.replaceState({}, "", ROUTES.DOWNLOADS);
    return render(
        <RouterProvider>
            <LangProvider>
                <UnderConstructionPage />
            </LangProvider>
        </RouterProvider>,
    );
}

describe("UnderConstructionPage", () => {
    beforeEach(() => {
        localStorage.clear();
    });
    afterEach(() => {
        window.history.replaceState({}, "", "/");
        document
            .querySelectorAll('meta[name="robots"], link[rel="canonical"]')
            .forEach((el) => el.remove());
    });

    /* O motivo de a página existir antes do conteúdo: o QR do rodapé
       aponta para este endereço, e um código já compartilhado não pode
       esperar a página ficar pronta. */
    it("anuncia a página em construção com um h1", async () => {
        renderPage();
        expect(
            await screen.findByRole("heading", {
                level: 1,
                name: /em construção/i,
            }),
        ).toBeInTheDocument();
    });

    /* Página provisória indexada é conteúdo raso apontando para o
       domínio, e o custo não fica contido nela. O `follow` é o outro
       lado: os buscadores seguem daqui para o que tem conteúdo. */
    it("declara noindex, follow", async () => {
        renderPage();
        await screen.findByRole("heading", { level: 1 });
        expect(
            document
                .querySelector('meta[name="robots"]')
                ?.getAttribute("content"),
        ).toBe("noindex, follow");
    });

    it("aponta o canonical para a própria rota, não para a home", async () => {
        renderPage();
        await screen.findByRole("heading", { level: 1 });
        expect(
            document
                .querySelector('link[rel="canonical"]')
                ?.getAttribute("href"),
        ).toMatch(/\/downloads$/);
    });

    /* Levar alguém a uma porta fechada e deixá-lo lá é o defeito clássico
       deste tipo de página. */
    it("oferece saídas: volta para a home e as outras páginas", async () => {
        renderPage();
        await screen.findByRole("heading", { level: 1 });

        /* Escopado ao <main>: o logo do rodapé também leva à home e tem
           "voltar ao início" no rótulo acessível. */
        const conteudo = within(screen.getByRole("main"));
        const voltar = conteudo.getByRole("link", {
            name: /voltar ao início/i,
        });
        expect(voltar).toHaveAttribute("href", ROUTES.HOME);

        const atalhos = conteudo.getByRole("navigation", {
            name: /outras páginas/i,
        });
        expect(
            within(atalhos).getByRole("link", { name: /links/i }),
        ).toHaveAttribute("href", ROUTES.LINKS);
    });

    it("traduz para inglês", async () => {
        renderPage("en");
        expect(
            await screen.findByRole("heading", {
                level: 1,
                name: /under construction/i,
            }),
        ).toBeInTheDocument();
    });
});
