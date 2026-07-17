import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LangProvider } from "@/app/LangContext";
import { Hero } from "./Hero";
import { PROFILE } from "@/shared/config/profile";
import { CV_URL } from "@/shared/config/constants";

const setup = () =>
    render(
        <LangProvider>
            <Hero />
        </LangProvider>,
    );

describe("Hero", () => {
    it("exibe o nome como heading principal", () => {
        setup();
        expect(
            screen.getByRole("heading", { level: 1, name: PROFILE.name }),
        ).toBeInTheDocument();
    });

    it("aponta o CTA de currículo para o PDF local", () => {
        setup();
        const cvLink = screen.getByRole("link", { name: /currículo|cv/i });
        expect(cvLink).toHaveAttribute("href", CV_URL);
    });

    it("usa os links sociais do perfil central", () => {
        setup();
        const github = screen.getByRole("link", { name: /GitHub/i });
        const linkedin = screen.getByRole("link", { name: /LinkedIn/i });
        expect(github).toHaveAttribute("href", PROFILE.social.github.url);
        expect(linkedin).toHaveAttribute("href", PROFILE.social.linkedin.url);
    });

    it("e-mail usa o endereço do perfil central", () => {
        setup();
        const mail = screen.getByRole("link", { name: /e-mail|email/i });
        expect(mail).toHaveAttribute("href", `mailto:${PROFILE.email}`);
    });
});
