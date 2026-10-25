import { describe, expect, it, afterEach } from "vitest";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    within,
} from "@testing-library/react";
import { LangProvider } from "@/app/LangContext";
import { ProfileLink } from "./ProfileLink";
import { PROFILE } from "@/shared/config/profile";

afterEach(() => window.history.replaceState({}, "", "/"));

function setup(
    lang: "pt" | "en" = "pt",
    href = PROFILE.social.linkedin.url as string,
) {
    window.history.replaceState({}, "", lang === "en" ? "/?lang=en" : "/");
    localStorage.setItem("portfolio-lang", lang);
    render(
        <LangProvider>
            <ProfileLink href={href} target="_blank" rel="noopener noreferrer">
                LinkedIn
            </ProfileLink>
        </LangProvider>,
    );
    return screen.getByRole("link", { name: "LinkedIn" });
}

describe("aviso antes do LinkedIn", () => {
    it("abre o modal sem sair da página e restaura o foco ao fechar", async () => {
        const link = setup();
        link.focus();
        fireEvent.click(link);
        const dialog = await screen.findByRole("dialog", {}, { timeout: 5000 });
        expect(dialog).toHaveAccessibleName(/temporariamente indisponível/);
        expect(
            within(dialog).getByText(/verificação de identidade/),
        ).toBeInTheDocument();
        expect(
            within(dialog).getByRole("link", { name: /Falar por e-mail/ }),
        ).toHaveAttribute("href", `mailto:${PROFILE.email}`);
        expect(window.location.pathname).toBe("/");
        const confirm = within(dialog).getByRole("link", {
            name: /Continuar para o LinkedIn/,
        });
        expect(confirm).toHaveAttribute("href", PROFILE.social.linkedin.url);
        expect(confirm).toHaveAttribute("target", "_blank");
        expect(confirm).toHaveAttribute("rel", "noopener noreferrer");
        fireEvent.keyDown(dialog, { key: "Escape" });
        await waitFor(() =>
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
        );
        await waitFor(() => expect(link).toHaveFocus());
    });

    it("abrir em nova aba aponta primeiro para o aviso interno", () => {
        const link = setup();
        const url = new URL(
            link.getAttribute("href")!,
            "https://portfolio.test",
        );
        expect(url.pathname).toBe("/linkedin");
        expect(url.searchParams.get("to")).toBe(PROFILE.social.linkedin.url);
        fireEvent.click(link, { ctrlKey: true });
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("mostra o aviso em inglês e permite desistir", async () => {
        fireEvent.click(setup("en"));
        const dialog = await screen.findByRole("dialog", {}, { timeout: 5000 });
        expect(dialog).toHaveAccessibleName(/temporarily unavailable/);
        fireEvent.click(
            within(dialog).getByRole("button", {
                name: "Stay on the portfolio",
            }),
        );
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("preserva links de outros perfis sem aviso", () => {
        const href = "https://www.linkedin.com/in/outro-perfil/";
        const link = setup("pt", href);
        expect(link).toHaveAttribute("href", href);
        expect(link).not.toHaveAttribute("aria-haspopup");
    });
});
