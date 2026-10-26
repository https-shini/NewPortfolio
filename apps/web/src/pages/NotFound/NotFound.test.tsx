import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, within, fireEvent } from "@testing-library/react";
import { Providers } from "@/app/providers";
import { Routes } from "@/app/routes";
import { NOT_FOUND_COPY } from "@/shared/config/notFound";
import { PROFILE } from "@/shared/config/profile";

afterEach(() => {
    window.history.replaceState({}, "", "/");
    vi.unstubAllGlobals();
});

function setup(path: string, lang: "pt" | "en" = "pt") {
    window.history.replaceState({}, "", path);
    localStorage.setItem("portfolio-lang", lang);
    vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ releases: [] }),
        }),
    );
    render(
        <Providers>
            <Routes />
        </Providers>,
    );
}

describe("página 404", () => {
    it("mostra a página de erro em vez da home, inclusive em URLs profundas", async () => {
        setup("/caminho/que/nao/existe");
        expect(
            await screen.findByRole("heading", {
                level: 1,
                name: /Página não encontrada/,
            }),
        ).toBeInTheDocument();
        expect(window.location.pathname).toBe("/caminho/que/nao/existe");
        expect(document.getElementById("site-header")).toBeInTheDocument();
        expect(screen.getByRole("contentinfo")).toBeInTheDocument();
        expect(document.title).toContain("404");
        expect(
            document.head.querySelector('meta[name="robots"]'),
        ).toHaveAttribute("content", "noindex, follow");
        const main = within(screen.getByRole("main"));
        expect(
            main.getByRole("link", { name: NOT_FOUND_COPY.pt.links }),
        ).toHaveAttribute("href", "/links");
        expect(main.getByRole("link", { name: /Fale comigo/ })).toHaveAttribute(
            "href",
            `mailto:${PROFILE.email}`,
        );
    });

    it("traduz o conteúdo e mantém links compartilháveis em inglês", async () => {
        setup("/missing?lang=en", "en");
        expect(
            await screen.findByRole("heading", {
                level: 1,
                name: /Page not found/,
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: NOT_FOUND_COPY.en.home }),
        ).toHaveAttribute("href", "/?lang=en");
        expect(
            screen.getByRole("link", { name: NOT_FOUND_COPY.en.links }),
        ).toHaveAttribute("href", "/links?lang=en");
    });

    it("permite recuperar a home e restaura a indexação", async () => {
        setup("/inexistente");
        const link = await screen.findByRole("link", {
            name: NOT_FOUND_COPY.pt.home,
        });
        await act(async () => {
            fireEvent.click(link);
        });
        expect(window.location.pathname).toBe("/");
        expect(
            screen.queryByRole("heading", {
                level: 1,
                name: /Página não encontrada/,
            }),
        ).not.toBeInTheDocument();
        expect(
            document.head.querySelector('meta[name="robots"]'),
        ).toHaveAttribute("content", "index, follow");
    });

    it("respeita abrir em nova aba e permite recuperar a central de links", async () => {
        setup("/inexistente");
        const link = await screen.findByRole("link", {
            name: NOT_FOUND_COPY.pt.links,
        });
        fireEvent.click(link, { ctrlKey: true });
        expect(window.location.pathname).toBe("/inexistente");
        fireEvent.click(link);
        expect(window.location.pathname).toBe("/links");
        await screen.findByRole(
            "heading",
            { level: 1, name: PROFILE.name },
            { timeout: 5000 },
        );
    });

    it("trata escapes malformados como 404", async () => {
        setup("/release-notes/%E0%A4%A");
        expect(
            await screen.findByRole("heading", {
                level: 1,
                name: /Página não encontrada/,
            }),
        ).toBeInTheDocument();
    });
});
