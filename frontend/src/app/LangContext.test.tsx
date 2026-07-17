import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LangProvider, useLangContext } from "./LangContext";
import { LANG_KEY } from "@/shared/config/constants";

const Probe: React.FC = () => {
    const { lang, t, toggleLang } = useLangContext();
    return (
        <div>
            <span data-testid="lang">{lang}</span>
            <span data-testid="title">{t("contact.title")}</span>
            <button type="button" onClick={toggleLang}>
                toggle
            </button>
        </div>
    );
};

const setup = () =>
    render(
        <LangProvider>
            <Probe />
        </LangProvider>,
    );

describe("LangContext", () => {
    it("usa idioma salvo no localStorage", () => {
        localStorage.setItem(LANG_KEY, "en");
        setup();
        expect(screen.getByTestId("lang")).toHaveTextContent("en");
        expect(screen.getByTestId("title")).toHaveTextContent(
            "Let's work together",
        );
    });

    it("padrão pt quando navigator não é en", () => {
        vi.spyOn(navigator, "language", "get").mockReturnValue("pt-BR");
        setup();
        expect(screen.getByTestId("lang")).toHaveTextContent("pt");
        expect(screen.getByTestId("title")).toHaveTextContent(
            "Vamos trabalhar juntos",
        );
    });

    it("padrão en quando navigator é en", () => {
        vi.spyOn(navigator, "language", "get").mockReturnValue("en-US");
        setup();
        expect(screen.getByTestId("lang")).toHaveTextContent("en");
    });

    it("toggleLang alterna idioma e persiste", async () => {
        localStorage.setItem(LANG_KEY, "pt");
        const user = userEvent.setup();
        setup();
        await user.click(screen.getByRole("button", { name: "toggle" }));
        expect(screen.getByTestId("lang")).toHaveTextContent("en");
        expect(localStorage.getItem(LANG_KEY)).toBe("en");
        expect(document.documentElement.getAttribute("lang")).toBe("en");
    });

    it("useLangContext fora do provider lança erro", () => {
        expect(() => render(<Probe />)).toThrow(
            /useLangContext must be used inside LangProvider/,
        );
    });
});
