import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { LangProvider } from "@/app/LangContext";
import { Hero } from "./Hero";
import { PROFILE } from "@/shared/config/profile";
import { getCvUrl, LANG_KEY } from "@/shared/config/constants";
import { linkedInNoticePath } from "@/shared/config/linkedin";

const setup = (lang: "pt" | "en" = "pt") => {
    /* Fixa o idioma para tornar as asserções determinísticas */
    localStorage.setItem(LANG_KEY, lang);
    return render(
        <LangProvider>
            <Hero />
        </LangProvider>,
    );
};

describe("Hero", () => {
    it("exibe o nome como heading principal", () => {
        setup();
        expect(
            screen.getByRole("heading", { level: 1, name: PROFILE.name }),
        ).toBeInTheDocument();
    });

    it("aponta o CTA de currículo para o PDF local do idioma", () => {
        setup();
        const cvLink = screen.getByRole("link", { name: /currículo|cv/i });
        expect(cvLink).toHaveAttribute("href", getCvUrl("pt"));
    });

    it("usa os links sociais do perfil central", () => {
        setup();
        const github = screen.getByRole("link", { name: /GitHub/i });
        const linkedin = screen.getByRole("link", { name: /LinkedIn/i });
        expect(github).toHaveAttribute("href", PROFILE.social.github.url);
        expect(linkedin).toHaveAttribute(
            "href",
            linkedInNoticePath(PROFILE.social.linkedin.url, "pt"),
        );
    });

    it("e-mail usa o endereço do perfil central", () => {
        setup();
        const mail = screen.getByRole("link", { name: /e-mail|email/i });
        expect(mail).toHaveAttribute("href", `mailto:${PROFILE.email}`);
    });

    it("anuncia a disponibilidade como status", () => {
        setup();
        expect(screen.getByRole("status")).toHaveTextContent(
            "Disponível para oportunidades",
        );
    });

    it("resume stack, atuação e base na faixa de fatos, com dados do perfil", () => {
        setup();
        const stack = screen.getByText("Stack principal").closest("div")!;
        expect(within(stack).getAllByRole("listitem")).toHaveLength(6);
        expect(within(stack).getByText("React")).toBeInTheDocument();
        expect(screen.getByText(PROFILE.roles.join(" · "))).toBeInTheDocument();
        /* A base aparece no rótulo superior e na faixa. */
        expect(
            screen.getAllByText(new RegExp(PROFILE.location.pt)).length,
        ).toBeGreaterThanOrEqual(2);
    });

    it("oferece o botão de rolagem para a próxima seção", () => {
        setup();
        expect(
            screen.getByRole("button", { name: "Rolar para a próxima seção" }),
        ).toBeInTheDocument();
    });

    it("traduz rótulos e nomes acessíveis em inglês", () => {
        setup("en");
        expect(screen.getByText("Core stack")).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "Guilherme Cruz on GitHub" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Scroll to the next section" }),
        ).toBeInTheDocument();
    });
});
