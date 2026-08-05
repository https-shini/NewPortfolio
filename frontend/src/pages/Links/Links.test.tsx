import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { LangProvider } from "@/app/LangContext";
import { RouterProvider } from "@/app/RouterContext";
import { LinksPage } from "./index";
import { PROFILE } from "@/shared/config/profile";
import { PRIMARY_LINKS } from "@/shared/config/links";
import { ROUTES } from "@/shared/config/routes";

const setup = () => {
    localStorage.setItem("portfolio-lang", "pt");
    return render(
        <RouterProvider>
            <LangProvider>
                <LinksPage />
            </LangProvider>
        </RouterProvider>,
    );
};

describe("LinksPage — social tree", () => {
    beforeEach(() => window.history.replaceState({}, "", ROUTES.LINKS));
    afterEach(() => vi.unstubAllGlobals());

    it("apresenta o perfil com nome, handle e papéis", () => {
        setup();
        expect(
            screen.getByRole("heading", { level: 1, name: PROFILE.name }),
        ).toBeInTheDocument();
        expect(screen.getByText(PROFILE.handle)).toBeInTheDocument();
        PROFILE.roles.forEach((role) => {
            expect(screen.getByText(role)).toBeInTheDocument();
        });
    });

    it("usa a mesma foto da seção Sobre (hero.webp)", () => {
        setup();
        const img = screen.getByAltText(PROFILE.name) as HTMLImageElement;
        expect(img.getAttribute("src")).toMatch(/hero/);
    });

    it("renderiza um cartão por link primário", () => {
        setup();
        PRIMARY_LINKS.forEach((link) => {
            expect(
                screen.getByRole("link", {
                    name: new RegExp(`^${link.label.pt}`),
                }),
            ).toBeInTheDocument();
        });
    });

    it("abre links externos em nova aba com rel seguro", () => {
        setup();
        const github = screen.getByRole("link", { name: /^GitHub/ });
        expect(github).toHaveAttribute("href", PROFILE.social.github.url);
        expect(github).toHaveAttribute("target", "_blank");
        expect(github).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("não abre nova aba no link de e-mail", () => {
        setup();
        const contato = screen.getByRole("link", { name: "Contato" });
        expect(contato).toHaveAttribute("href", `mailto:${PROFILE.email}`);
        expect(contato).not.toHaveAttribute("target");
    });

    it("avisa no nome acessível quando o link abre em nova aba", () => {
        setup();
        expect(
            screen.getByRole("link", { name: /GitHub \(abre em nova aba\)/ }),
        ).toBeInTheDocument();
    });

    it("o currículo aponta para o PDF do idioma corrente", () => {
        setup();
        const cv = screen.getByRole("link", { name: /Currículo/ });
        expect(cv).toHaveAttribute("href", PROFILE.cv.pt);
    });

    it("copia a URL e sinaliza quando não há share nativo", async () => {
        /* userEvent.setup() instala o próprio stub de clipboard — criar o
           user antes garante que o mock abaixo é o que a página enxerga. */
        const user = userEvent.setup();

        const writeText = vi.fn().mockResolvedValue(undefined);
        vi.stubGlobal("navigator", {
            ...navigator,
            share: undefined,
            clipboard: { writeText },
        });

        setup();

        await user.click(screen.getByRole("button", { name: /Compartilhar/ }));

        expect(writeText).toHaveBeenCalledWith(
            `${PROFILE.siteUrl}${ROUTES.LINKS}`,
        );
        expect(await screen.findByText("Copiado!")).toBeInTheDocument();
    });

    it("cancelar o share nativo não acende o estado de copiado", async () => {
        const user = userEvent.setup();

        const share = vi.fn().mockRejectedValue(new Error("AbortError"));
        const writeText = vi.fn();
        vi.stubGlobal("navigator", {
            ...navigator,
            share,
            clipboard: { writeText },
        });

        setup();

        await user.click(screen.getByRole("button", { name: /Compartilhar/ }));

        expect(share).toHaveBeenCalled();
        expect(writeText).not.toHaveBeenCalled();
        expect(screen.queryByText("Copiado!")).not.toBeInTheDocument();
    });

    it("define título e canonical da rota", () => {
        setup();
        expect(document.title).toContain(PROFILE.name);
        expect(
            document.head
                .querySelector('link[rel="canonical"]')
                ?.getAttribute("href"),
        ).toBe(`${PROFILE.siteUrl}${ROUTES.LINKS}`);
    });
});
