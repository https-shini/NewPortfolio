import { describe, it, expect, vi, beforeEach } from "vitest";
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

/* O jsdom carrega a mesma URL entre os casos. Sem zerar, um teste que
   deixa `?lang=en` decide o idioma inicial do seguinte — e o seguinte
   falha por um motivo que não tem nada a ver com o que ele afirma. */
beforeEach(() => {
    window.history.replaceState({}, "", "/");
    localStorage.clear();
});

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

describe("idioma na URL", () => {
    const irPara = (url: string) => window.history.replaceState({}, "", url);

    it("o parâmetro vence a preferência salva", () => {
        /* Quem recebe um link em inglês precisa ver inglês, mesmo tendo
           português salvo: o link é a escolha mais recente. */
        localStorage.setItem(LANG_KEY, "pt");
        irPara("/?lang=en");
        setup();
        expect(screen.getByTestId("lang")).toHaveTextContent("en");
    });

    it("parâmetro desconhecido não derruba o resto da precedência", () => {
        localStorage.setItem(LANG_KEY, "en");
        irPara("/?lang=klingon");
        setup();
        expect(screen.getByTestId("lang")).toHaveTextContent("en");
    });

    it("trocar para inglês põe o parâmetro na URL", async () => {
        localStorage.setItem(LANG_KEY, "pt");
        irPara("/links");
        const user = userEvent.setup();
        setup();

        await user.click(screen.getByRole("button", { name: "toggle" }));
        expect(window.location.search).toBe("?lang=en");
        /* A rota não pode mudar por causa do idioma. */
        expect(window.location.pathname).toBe("/links");
    });

    it("voltar ao padrão limpa o parâmetro em vez de escrever lang=pt", async () => {
        localStorage.setItem(LANG_KEY, "en");
        irPara("/?lang=en");
        const user = userEvent.setup();
        setup();

        await user.click(screen.getByRole("button", { name: "toggle" }));
        expect(screen.getByTestId("lang")).toHaveTextContent("pt");
        /* URL limpa é a canônica; duas formas dividiriam o sinal. */
        expect(window.location.search).toBe("");
    });

    it("preserva outros parâmetros da URL", async () => {
        localStorage.setItem(LANG_KEY, "pt");
        irPara("/?ref=linkedin");
        const user = userEvent.setup();
        setup();

        await user.click(screen.getByRole("button", { name: "toggle" }));
        const params = new URLSearchParams(window.location.search);
        expect(params.get("ref")).toBe("linkedin");
        expect(params.get("lang")).toBe("en");
    });

    it("o atributo lang do documento acompanha o parâmetro", () => {
        irPara("/?lang=en");
        setup();
        expect(document.documentElement.getAttribute("lang")).toBe("en");
    });
});
