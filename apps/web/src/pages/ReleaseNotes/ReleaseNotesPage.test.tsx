import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import { LangProvider } from "@/app/LangContext";
import { RouterProvider } from "@/app/RouterContext";
import { ReleaseNotesPage } from "./index";
import { PROFILE } from "@/shared/config/profile";
import { ROUTES } from "@/shared/config/routes";
import { RELEASE_NOTES } from "@/shared/config/releaseNotes";
import { versionSlug } from "@/widgets/ReleaseNotes/ReleaseNotes.types";

/** Navega para a rota, opcionalmente com âncora, e monta a página. */
const setup = (hash = "") => {
    localStorage.setItem("portfolio-lang", "pt");
    window.history.replaceState({}, "", `${ROUTES.RELEASE_NOTES}${hash}`);

    return render(
        <RouterProvider>
            <LangProvider>
                <ReleaseNotesPage />
            </LangProvider>
        </RouterProvider>,
    );
};

const [latest, previous] = RELEASE_NOTES;

/**
 * O gatilho de uma versão no histórico, pelo nome acessível.
 *
 * O espaço final não é enfeite: o nome é `"v2.0.0 — Expandir"`, e sem ele
 * o padrão de `2.0.0` casaria também com `2.0.0-rc.1` e as duas betas.
 * A expressão só funcionava enquanto nenhuma versão do histórico fosse
 * prefixo de outra — o que deixou de valer quando a 2.0.0 saiu do
 * destaque e desceu para a lista.
 */
const gatilhoDaVersao = (versao: string) =>
    screen.getByRole("button", {
        name: new RegExp(`^v${versao.replace(/[.\\-]/g, "\\$&")}\\s`),
    });

describe("ReleaseNotesPage", () => {
    beforeEach(() => {
        sessionStorage.clear();
        /* Promessa que nunca resolve: o endpoint fica pendente e a
           timeline se sustenta só na camada local — o mesmo cenário de
           quem abre a página sem rede ou sem GITHUB_TOKEN. */
        vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        window.location.hash = "";
    });

    it("define título e canonical da rota", () => {
        setup();

        expect(document.title).toContain(PROFILE.name);
        expect(
            document.head
                .querySelector('link[rel="canonical"]')
                ?.getAttribute("href"),
        ).toBe(`${PROFILE.siteUrl}${ROUTES.RELEASE_NOTES}`);
    });

    it("monta a página inteira: header, timeline e rodapé", () => {
        setup();

        /* Por id, e não por `getByRole("banner")`: o mapeamento da
           testing-library ignora a exceção do HTML-AAM que rebaixa um
           <header> descendente de <main>/<section> a elemento genérico,
           e enxergaria dois banners onde o navegador vê um só. */
        expect(document.getElementById("site-header")).toBeInTheDocument();
        expect(screen.getByRole("contentinfo")).toBeInTheDocument();
        expect(
            screen.getByRole("heading", { level: 1, name: /Notas de versão/i }),
        ).toBeInTheDocument();
    });

    it("tem exatamente um h1, e a hierarquia não pula nível", () => {
        setup();

        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);

        /* No modal a timeline começa em h2; na rota ela é a manchete, e
           os títulos internos sobem junto para não deixar buraco. */
        const levels = screen
            .getAllByRole("heading")
            .map((h) => Number(h.tagName[1]));
        levels.forEach((level, i) => {
            if (i > 0) expect(level).toBeLessThanOrEqual(levels[i - 1]! + 1);
        });
    });

    it("renderiza a camada local mesmo sem resposta do GitHub", () => {
        setup();

        /* A versão do topo aparece expandida, com o título editorial. */
        expect(
            document.getElementById(versionSlug(latest!.version)),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("heading", { level: 2, name: latest!.title!.pt }),
        ).toBeInTheDocument();
    });

    it("com âncora de uma versão do histórico, abre o painel dela", () => {
        setup(`#${versionSlug(previous!.version)}`);

        const trigger = gatilhoDaVersao(previous!.version);
        expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    it("sem âncora, o histórico continua colapsado", () => {
        setup();

        const trigger = gatilhoDaVersao(previous!.version);
        expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("âncora clicada já dentro da página também abre o painel", () => {
        /* Trocar só o hash é navegação no mesmo documento: a página não
           remonta, então quem responde é o listener de `hashchange`. */
        setup();

        const trigger = gatilhoDaVersao(previous!.version);
        expect(trigger).toHaveAttribute("aria-expanded", "false");

        act(() => {
            window.location.hash = `#${versionSlug(previous!.version)}`;
            window.dispatchEvent(new HashChangeEvent("hashchange"));
        });

        expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    it("âncora desconhecida não quebra a página", () => {
        expect(() => setup("#v9-9-9")).not.toThrow();
        expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });
});
