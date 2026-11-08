import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "./ErrorBoundary";

const Quebra = () => {
    throw new Error("falha de render");
};

afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.lang = "pt-BR";
});

describe("ErrorBoundary", () => {
    it("mostra a recuperação em vez de uma página em branco", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        render(
            <ErrorBoundary>
                <Quebra />
            </ErrorBoundary>,
        );
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Recarregar a página" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "Ir para o início" }),
        ).toHaveAttribute("href", "/");
    });

    it("segue o idioma declarado no documento", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        document.documentElement.lang = "en";
        render(
            <ErrorBoundary>
                <Quebra />
            </ErrorBoundary>,
        );
        expect(
            screen.getByRole("heading", { name: "Something went wrong." }),
        ).toBeInTheDocument();
    });

    it("não interfere quando nada falha", () => {
        render(
            <ErrorBoundary>
                <p>conteúdo</p>
            </ErrorBoundary>,
        );
        expect(screen.getByText("conteúdo")).toBeInTheDocument();
    });
});
