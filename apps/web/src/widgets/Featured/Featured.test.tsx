import { describe, it, expect } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LangProvider } from "@/app/LangContext";
import { Featured } from "./Featured";
import { FEATURED_PROJECT } from "./Featured.data";
import { LANG_KEY } from "@/shared/config/constants";

/**
 * A galeria é uma janela com abas, no padrão do panorama do GitHub:
 * nada se move sozinho, cada captura é uma aba (←/→/Home/End com foco
 * itinerante) e as setas da legenda são circulares.
 */
const SLIDES = FEATURED_PROJECT.slides;

const montar = (lang: "pt" | "en" = "pt") => {
    localStorage.setItem(LANG_KEY, lang);
    return render(
        <LangProvider>
            <Featured />
        </LangProvider>,
    );
};

const abas = () => screen.getAllByRole("tab");
const ativa = () =>
    abas().findIndex((a) => a.getAttribute("aria-selected") === "true");

describe("Featured — janela com abas", () => {
    it("uma aba por captura; a primeira começa ativa e ligada ao painel", () => {
        montar();
        expect(abas()).toHaveLength(SLIDES.length);
        expect(ativa()).toBe(0);
        const painel = screen.getByRole("tabpanel");
        expect(painel).toHaveAttribute("aria-labelledby", abas()[0]!.id);
        expect(abas()[0]).toHaveAttribute("aria-controls", painel.id);
        expect(abas()[1]).toHaveAttribute("tabindex", "-1");
    });

    it("clicar numa aba troca a captura e a legenda", async () => {
        const user = userEvent.setup();
        montar();
        await user.click(abas()[2]!);
        expect(ativa()).toBe(2);
        expect(screen.getByText(`03 / 0${SLIDES.length}`)).toBeInTheDocument();
        expect(
            screen.getByRole("img", { name: new RegExp(SLIDES[2]!.label.pt) }),
        ).toBeInTheDocument();
    });

    it("←/→/Home/End navegam pelas abas e levam o foco", async () => {
        const user = userEvent.setup();
        montar();
        abas()[0]!.focus();
        await user.keyboard("{ArrowRight}");
        expect(ativa()).toBe(1);
        expect(abas()[1]).toHaveFocus();
        await user.keyboard("{End}");
        expect(ativa()).toBe(SLIDES.length - 1);
        await user.keyboard("{ArrowRight}");
        expect(ativa()).toBe(0); // circular
        await user.keyboard("{ArrowLeft}");
        expect(ativa()).toBe(SLIDES.length - 1);
        await user.keyboard("{Home}");
        expect(ativa()).toBe(0);
    });

    it("setas da legenda são circulares", async () => {
        const user = userEvent.setup();
        montar();
        await user.click(
            screen.getByRole("button", { name: "Slide anterior" }),
        );
        expect(ativa()).toBe(SLIDES.length - 1);
        await user.click(screen.getByRole("button", { name: "Próximo slide" }));
        expect(ativa()).toBe(0);
    });

    it("não troca sozinho (sem autoplay)", async () => {
        montar();
        await new Promise((r) => setTimeout(r, 50));
        expect(ativa()).toBe(0);
        expect(screen.queryByRole("button", { name: /autoplay/i })).toBeNull();
    });
});

describe("Featured — conteúdo e links", () => {
    it("endereço e 'Explorar aplicação' abrem a aplicação em nova aba", () => {
        montar();
        const endereco = screen.getByRole("link", {
            name: `Abrir ${FEATURED_PROJECT.repoHost} (abre em nova aba)`,
        });
        expect(endereco).toHaveAttribute("href", FEATURED_PROJECT.liveUrl);
        expect(endereco).toHaveAttribute("target", "_blank");
        expect(endereco).toHaveAttribute("rel", "noopener noreferrer");
        const app = screen.getByRole("link", { name: /Explorar aplicação/ });
        expect(app).toHaveAttribute("target", "_blank");
        expect(
            screen.getByRole("link", { name: /Conhecer o projeto/ }),
        ).toHaveAttribute("href", FEATURED_PROJECT.detailsUrl);
    });

    it("tecnologias e recursos vêm dos dados do projeto", () => {
        montar();
        const stack = screen.getByRole("list", {
            name: "Tecnologias do projeto",
        });
        expect(within(stack).getAllByRole("listitem")).toHaveLength(
            FEATURED_PROJECT.tech.length,
        );
        const recursos = screen.getByRole("list", {
            name: "Principais recursos",
        });
        expect(within(recursos).getAllByRole("heading")).toHaveLength(
            FEATURED_PROJECT.architecture.length,
        );
    });

    it("em inglês, textos e link de detalhes mudam de idioma", () => {
        montar("en");
        expect(screen.getByText("Featured project")).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /Discover the project/ }),
        ).toHaveAttribute("href", `${FEATURED_PROJECT.detailsUrl}?lang=en`);
        expect(abas()[0]).toHaveTextContent(SLIDES[0]!.label.en);
    });
});

describe("Featured — o lightbox", () => {
    it("abre pela captura ativa", async () => {
        const user = userEvent.setup();
        montar();
        await user.click(
            screen.getByRole("button", {
                name: new RegExp(`Ampliar: ${SLIDES[0]!.label.pt}`),
            }),
        );
        await waitFor(() =>
            expect(screen.getByRole("dialog")).toBeInTheDocument(),
        );
    });
});
