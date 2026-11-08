import { afterEach, describe, expect, it, vi } from "vitest";
import { Suspense } from "react";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary/ErrorBoundary";
import { lazyComRetry } from "./lazyComRetry";

afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
});

const Pagina = () => <p>página carregada</p>;

function montar(carregar: () => Promise<{ default: typeof Pagina }>) {
    const recarregar = vi.fn();
    const Lazy = lazyComRetry(carregar, recarregar);
    render(
        <ErrorBoundary>
            <Suspense fallback={<p>carregando</p>}>
                <Lazy />
            </Suspense>
        </ErrorBoundary>,
    );
    return recarregar;
}

describe("lazyComRetry", () => {
    it("carrega normalmente quando o módulo existe", async () => {
        const recarregar = montar(() => Promise.resolve({ default: Pagina }));
        expect(await screen.findByText("página carregada")).toBeInTheDocument();
        expect(recarregar).not.toHaveBeenCalled();
    });

    it("recarrega a página uma vez quando o chunk sumiu", async () => {
        const recarregar = montar(() =>
            Promise.reject(
                new Error("Failed to fetch dynamically imported module"),
            ),
        );
        await vi.waitFor(() => expect(recarregar).toHaveBeenCalledTimes(1));
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("na segunda falha não recarrega de novo: mostra a recuperação", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        sessionStorage.setItem("rota:recarregou-por-chunk", "1");
        const recarregar = montar(() => Promise.reject(new Error("de novo")));
        expect(await screen.findByRole("alert")).toBeInTheDocument();
        expect(recarregar).not.toHaveBeenCalled();
    });
});
