import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LangProvider } from "@/app/LangContext";
import { Recommendations } from "./Recommendations";
import { recommendations } from "./Recommendations.data";

/** matchMedia estável — `matches` controla o breakpoint mobile. */
function stubViewport(isMobile: boolean) {
    vi.stubGlobal(
        "matchMedia",
        vi.fn(() => ({
            matches: isMobile,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        })),
    );
}

const setup = () => {
    localStorage.setItem("portfolio-lang", "pt");
    return render(
        <LangProvider>
            <Recommendations />
        </LangProvider>,
    );
};

/** Todas as páginas do track (inclui as fora de tela, que são aria-hidden). */
const allPages = () => screen.getAllByRole("group", { hidden: true });

/** Cards da página visível (as demais ficam aria-hidden). */
const visibleCards = () =>
    allPages()
        .filter((page) => page.getAttribute("aria-hidden") === "false")
        .flatMap((page) => within(page).getAllByRole("button"));

/* Nº de cards por página no desktop — espelha DESKTOP_PER_PAGE do widget.
   As contagens abaixo derivam dos dados: acrescentar uma recomendação não
   deve exigir mexer no teste. */
const POR_PAGINA = 2;
const totalPaginas = (porPagina: number) =>
    Math.ceil(recommendations.length / porPagina);

describe("Recommendations — carrossel paginado", () => {
    beforeEach(() => stubViewport(false)); // desktop
    afterEach(() => vi.unstubAllGlobals());

    it("mostra 2 cards por página no desktop", () => {
        setup();
        expect(visibleCards()).toHaveLength(
            Math.min(POR_PAGINA, recommendations.length),
        );
    });

    it("divide os itens em páginas de 2", () => {
        setup();
        const paginas = totalPaginas(POR_PAGINA);
        expect(allPages()).toHaveLength(paginas);
        /* Total no contador, com dois dígitos. Preso ao elemento certo:
           por texto, "02" também casa com o índice da página corrente. */
        expect(
            document.querySelector(".rec-controls__counter-total")?.textContent,
        ).toBe(String(paginas).padStart(2, "0"));
    });

    it("avança de página pelo botão Próxima", async () => {
        const user = userEvent.setup();
        setup();

        const first = visibleCards()[0]!;
        await user.click(
            screen.getByRole("button", { name: /próxima recomendação/i }),
        );

        /* A 2ª página leva o que sobrou da 1ª. */
        const afterCards = visibleCards();
        expect(afterCards).toHaveLength(
            Math.min(POR_PAGINA, recommendations.length - POR_PAGINA),
        );
        expect(afterCards[0]).not.toBe(first);
    });

    it("mostra 1 card por página no mobile", () => {
        stubViewport(true);
        setup();
        expect(visibleCards()).toHaveLength(1);
        expect(allPages()).toHaveLength(recommendations.length);
    });

    it("abre o modal ao clicar num card", async () => {
        const user = userEvent.setup();
        setup();

        await user.click(visibleCards()[0]!);

        /* O modal é lazy — aguarda o chunk resolver. */
        const dialog = await screen.findByRole("dialog");
        expect(dialog).toBeInTheDocument();
    });

    /* Dá para ler as recomendações em sequência sem fechar e reabrir. */
    it("percorre as recomendações pelo botão dentro do modal", async () => {
        const user = userEvent.setup();
        setup();

        await user.click(visibleCards()[0]!);
        const dialog = await screen.findByRole("dialog");
        expect(
            within(dialog).getByRole("heading", { level: 3 }),
        ).toHaveTextContent(recommendations[0]!.authorName);

        await user.click(
            within(dialog).getByRole("button", {
                name: /próxima recomendação/i,
            }),
        );

        expect(
            within(dialog).getByRole("heading", { level: 3 }),
        ).toHaveTextContent(recommendations[1]!.authorName);
    });

    /* Circula nas pontas: da primeira, voltar leva à última. */
    it("volta pelo teclado e circula na ponta", async () => {
        const user = userEvent.setup();
        setup();

        await user.click(visibleCards()[0]!);
        const dialog = await screen.findByRole("dialog");

        await user.keyboard("{ArrowLeft}");

        expect(
            within(dialog).getByRole("heading", { level: 3 }),
        ).toHaveTextContent(
            recommendations[recommendations.length - 1]!.authorName,
        );
    });
});
