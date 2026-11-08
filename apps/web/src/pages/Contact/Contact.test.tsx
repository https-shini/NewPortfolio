import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Providers } from "@/app/providers";
import { Routes } from "@/app/routes";

/* A seção de contato nasce com `data-reveal`, que o CSS global deixa em
   `opacity: 0` até ganhar `.is-visible`. Na home quem revela é a
   HomePage; na /contato a chamada faltava, e a página abria só com o
   cabeçalho e o rodapé — o conteúdo estava no DOM, mas transparente.
   Testes que só procuram o texto não pegam isso, por isso a asserção é
   sobre a classe. */

const matchMediaOriginal = window.matchMedia;

afterEach(() => {
    window.history.replaceState({}, "", "/");
    window.matchMedia = matchMediaOriginal;
    vi.unstubAllGlobals();
});

function setup() {
    /* Com movimento reduzido o hook revela tudo na montagem, sem depender
       do IntersectionObserver (que o jsdom não implementa). */
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }));
    window.history.replaceState({}, "", "/contato");
    localStorage.setItem("portfolio-lang", "pt");
    vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
    );
    render(
        <Providers>
            <Routes />
        </Providers>,
    );
}

describe("página /contato", () => {
    it("revela a seção de contato em vez de deixá-la transparente", async () => {
        setup();
        const titulo = await screen.findByRole("heading", { level: 1 });
        const secao = titulo.closest("section");
        expect(secao).toHaveAttribute("data-reveal");
        expect(secao).toHaveClass("is-visible");
    });
});
