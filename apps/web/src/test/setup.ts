import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

/* Quase toda a suíte roda em jsdom, mas alguns casos precisam do node
   puro — a geração da imagem de compartilhamento, por exemplo, escolhe um
   rasterizador diferente conforme o ambiente. Sem esta guarda o setup
   tentaria remendar um `window` inexistente e derrubaria o arquivo antes
   do primeiro teste, por um motivo que nada tem a ver com o que ele afirma. */
const temDom = typeof window !== "undefined";

afterEach(() => {
    if (!temDom) return;
    cleanup();
    localStorage.clear();

    /* `sessionStorage` também, e não é simetria gratuita: shared/lib/cache.ts
       guarda respostas de rede ali, com validade. O useGithubStats usa esse
       cache com TTL de uma hora, então um caso que resolve as métricas
       envenenava o seguinte — o readCache devolvia o valor anterior e o fetch
       nem era tentado. Não mordia ninguém enquanto nada testava a área. */
    sessionStorage.clear();

    /* E a URL. O LangProvider sincroniza o idioma na query por
       `history.replaceState` (app/LangContext.tsx:84), e o getInitialLang lê
       a URL ANTES do localStorage. Sem esta linha, um caso que renderiza em
       inglês deixa `?lang=en` para trás e o caso seguinte nasce em inglês
       mesmo tendo pedido português. Medido: foi o que fez dois casos do Work
       compararem inglês com inglês. */
    window.history.replaceState({}, "", "/");
});

if (temDom) {
    /* jsdom não implementa matchMedia nem IntersectionObserver —
       stubs mínimos para os hooks de tema/reveal renderizarem em teste. */
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });

    /* jsdom não implementa scrollTo — o router chama no pushState. */
    Object.defineProperty(window, "scrollTo", {
        writable: true,
        value: vi.fn(),
    });

    /* Nem scrollIntoView, usado pelo permalink de /release-notes. */
    Object.defineProperty(Element.prototype, "scrollIntoView", {
        writable: true,
        value: vi.fn(),
    });

    class IntersectionObserverStub {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
        takeRecords = vi.fn(() => []);
        root = null;
        rootMargin = "";
        thresholds = [];
    }

    Object.defineProperty(window, "IntersectionObserver", {
        writable: true,
        value: IntersectionObserverStub,
    });

    /* jsdom também não implementa ResizeObserver — o Accordion o usa para
       medir a altura do painel e animar a transição. */
    class ResizeObserverStub {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
    }

    Object.defineProperty(window, "ResizeObserver", {
        writable: true,
        value: ResizeObserverStub,
    });
}
