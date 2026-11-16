import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Providers } from "@/app/providers";
import { useLang } from "@/shared/hooks/useLang";
import { useTheme } from "@/shared/hooks/useTheme";
import { useRoute } from "@/shared/hooks/useRoute";
import { ROUTES } from "@/shared/config/routes";
import { SERVICE_PLANS } from "@/shared/config/services";
import { PRESENTATION } from "./presentation";
import { ServicesPage } from "./index";

import { COPY, FAQ_ITEMS } from "./content";

vi.mock("@/widgets/Header/Header", () => ({
    Header: () => {
        const { toggleLang } = useLang();
        const { toggleTheme } = useTheme();
        const { navigate, path } = useRoute();
        return (
            <header>
                <button onClick={toggleLang}>Language</button>
                <button onClick={toggleTheme}>Theme</button>
                <button onClick={() => navigate(ROUTES.SERVICES)}>
                    Services
                </button>
                <span>{path}</span>
            </header>
        );
    },
}));
vi.mock("@/widgets/Footer/Footer", () => ({ Footer: () => <footer /> }));
const page = () =>
    render(
        <Providers>
            <ServicesPage />
        </Providers>,
    );
beforeEach(() => {
    window.history.replaceState({}, "", "/servicos");
    localStorage.setItem("portfolio-lang", "pt");
    localStorage.setItem("portfolio-theme", "dark");
});
afterEach(() => vi.unstubAllGlobals());
describe("Página comercial", () => {
    it("separa a landing page do formulário e preserva a seleção nos CTAs", async () => {
        const { container } = page();
        expect(container.querySelector("form")).toBeNull();
        expect(
            screen.getByRole("link", { name: PRESENTATION.pt.customSiteCta }),
        ).toHaveAttribute("href", "/orcamento?service=bespoke-website");
        expect(
            screen.getByRole("link", { name: PRESENTATION.pt.customITCta }),
        ).toHaveAttribute("href", "/orcamento?service=custom-it");
        expect(
            screen.getByRole("link", { name: COPY.pt.referCta }),
        ).toHaveAttribute("href", "/orcamento?interest=referral");
        await userEvent.setup().click(
            screen.getByRole("link", {
                name: "Solicitar este plano: Express",
            }),
        );
        expect(window.location.pathname).toBe("/orcamento");
        expect(window.location.search).toBe("?service=express");
    });
    it("renderiza doze seções, cinco soluções e preços centralizados", () => {
        const { container } = page();
        expect(container.querySelectorAll("main>section")).toHaveLength(12);
        expect(container.querySelectorAll(".services-category")).toHaveLength(
            5,
        );
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
            PRESENTATION.pt.title,
        );
        for (const p of SERVICE_PLANS)
            expect(
                screen.getAllByText(
                    new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        maximumFractionDigits: 0,
                    })
                        .format(p.price!)
                        .replace(/\s/g, " "),
                ).length,
            ).toBeGreaterThan(0);
    });
    it("preserva navegação, idioma e temas", async () => {
        page();
        const user = userEvent.setup();
        await user.click(screen.getByText("Services"));
        expect(window.location.pathname).toBe("/servicos");
        await user.click(screen.getByText("Language"));
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
            PRESENTATION.en.title,
        );
        expect(window.location.search).toBe("?lang=en");
        await user.click(screen.getByText("Theme"));
        expect(document.body).toHaveClass("light-mode");
        await user.click(screen.getByText("Theme"));
        expect(document.body).toHaveClass("dark-mode");
    });
    it("respeita idioma da URL", () => {
        window.history.replaceState({}, "", "/servicos?lang=en");
        page();
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
            PRESENTATION.en.title,
        );
    });
    it("FAQ funciona por teclado", async () => {
        page();
        const user = userEvent.setup();
        const question = screen.getByRole("button", {
            name: FAQ_ITEMS[0].q.pt,
        });
        question.focus();
        await user.keyboard("{Enter}");
        expect(question).toHaveAttribute("aria-expanded", "true");
        await user.keyboard(" ");
        expect(question).toHaveAttribute("aria-expanded", "false");
    });
    it("SEO usa Service e restaura head", () => {
        const old = document.createElement("script");
        old.type = "application/ld+json";
        old.textContent = '{"@type":"Person"}';
        document.head.appendChild(old);
        const { unmount } = page();
        expect(document.title).toContain("GCRUZ | Desenvolvimento Web");
        expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
            "href",
            "https://gcruz.dev.br/servicos",
        );
        expect(document.querySelector('link[hreflang="en"]')).toHaveAttribute(
            "href",
            "https://gcruz.dev.br/servicos?lang=en",
        );
        expect(
            JSON.parse(
                document.querySelector('script[type="application/ld+json"]')!
                    .textContent!,
            )["@type"],
        ).toBe("Service");
        unmount();
        expect(old.isConnected).toBe(true);
        old.remove();
    });
});
it("não restaura Service ao sair da entrada estática", () => {
    const old = document.createElement("script");
    old.type = "application/ld+json";
    old.textContent = '{"@type":"Service"}';
    document.head.appendChild(old);
    const { unmount } = page();
    unmount();
    expect(JSON.parse(old.textContent!)["@type"]).toBe("Person");
    old.remove();
});
