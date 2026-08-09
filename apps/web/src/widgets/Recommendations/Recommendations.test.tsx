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

describe("Recommendations — carrossel paginado", () => {
    beforeEach(() => stubViewport(false)); // desktop
    afterEach(() => vi.unstubAllGlobals());

    it("mostra 2 cards por página no desktop", () => {
        setup();
        expect(visibleCards()).toHaveLength(2);
    });

    it("divide os itens em páginas de 2 (3 itens → 2 páginas)", () => {
        setup();
        expect(recommendations.length).toBe(3);
        expect(allPages()).toHaveLength(2);
        expect(screen.getByText("02")).toBeInTheDocument(); // total no contador
    });

    it("avança de página pelo botão Próxima", async () => {
        const user = userEvent.setup();
        setup();

        const first = visibleCards()[0]!;
        await user.click(
            screen.getByRole("button", { name: /próxima recomendação/i }),
        );

        const afterCards = visibleCards();
        expect(afterCards).toHaveLength(1); // 3º item sozinho na 2ª página
        expect(afterCards[0]).not.toBe(first);
    });

    it("mostra 1 card por página no mobile", () => {
        stubViewport(true);
        setup();
        expect(visibleCards()).toHaveLength(1);
        expect(allPages()).toHaveLength(3);
    });

    it("abre o modal ao clicar num card", async () => {
        const user = userEvent.setup();
        setup();

        await user.click(visibleCards()[0]!);

        /* O modal é lazy — aguarda o chunk resolver. */
        const dialog = await screen.findByRole("dialog");
        expect(dialog).toBeInTheDocument();
    });
});
