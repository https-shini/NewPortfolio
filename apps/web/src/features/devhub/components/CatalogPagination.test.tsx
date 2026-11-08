import { describe, it, expect, afterEach, vi } from "vitest";
import {
    render,
    screen,
    cleanup,
    fireEvent,
    within,
} from "@testing-library/react";
import { CatalogPagination } from "./CatalogPagination";
import { Providers } from "@/app/providers";
import { LANG_KEY } from "@/shared/config/constants";

afterEach(cleanup);

const montar = (page: number, pageCount: number) => {
    localStorage.setItem(LANG_KEY, "pt");
    const onChange = vi.fn();
    render(
        <Providers>
            <CatalogPagination
                page={page}
                pageCount={pageCount}
                onChange={onChange}
            />
        </Providers>,
    );
    return onChange;
};

const nav = () => screen.getByRole("navigation", { name: /pagina/i });
const botao = (nome: string) =>
    within(nav()).getByRole("button", { name: nome });

describe("CatalogPagination", () => {
    it("ordem: Primeira, Anterior, números, Próxima, Última", () => {
        montar(3, 6);
        const nomes = within(nav())
            .getAllByRole("button")
            .map((b) => b.getAttribute("aria-label") ?? b.textContent);
        expect(nomes[0]).toBe("Primeira");
        expect(nomes[1]).toMatch(/Anterior/);
        expect(nomes[nomes.length - 2]).toMatch(/Próxima/);
        expect(nomes[nomes.length - 1]).toBe("Última");
    });

    it("na primeira página, Primeira e Anterior ficam desativadas", () => {
        montar(1, 6);
        expect(botao("Primeira")).toBeDisabled();
        expect(botao("Anterior")).toBeDisabled();
        expect(botao("Próxima")).toBeEnabled();
        expect(botao("Última")).toBeEnabled();
        expect(botao("Página 1")).toHaveAttribute("aria-current", "page");
    });

    it("na última página, Próxima e Última ficam desativadas", () => {
        montar(6, 6);
        expect(botao("Próxima")).toBeDisabled();
        expect(botao("Última")).toBeDisabled();
        expect(botao("Primeira")).toBeEnabled();
    });

    it("Primeira e Última levam aos extremos", () => {
        const onChange = montar(3, 6);
        fireEvent.click(botao("Primeira"));
        fireEvent.click(botao("Última"));
        expect(onChange.mock.calls).toEqual([[1], [6]]);
    });

    it("uma página só: sem paginação", () => {
        montar(1, 1);
        expect(screen.queryByRole("navigation")).toBeNull();
    });
});
