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
