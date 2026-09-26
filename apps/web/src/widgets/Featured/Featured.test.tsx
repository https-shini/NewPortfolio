import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LangProvider } from "@/app/LangContext";
import { Featured } from "./Featured";
import { FEATURED_PROJECT } from "./Featured.data";
import { LANG_KEY } from "@/shared/config/constants";
import { TRANSLATIONS } from "@/shared/lib/translations";

/**
 * O carrossel tem duas coisas que só um teste pega: a circularidade do
 * índice, que é aritmética e não se vê olhando, e o autoplay não começar sob
 * `prefers-reduced-motion` — invariante de acessibilidade que vive num
 * `&&` dentro do `startAuto`.
 *
 * O autoplay usa `setInterval` de 7 s. Os casos que o envolvem usam
 * temporizadores falsos; os que não, usam os reais. Misturar os dois é o que
 * faz teste de carrossel ficar lento e intermitente.
 */
const SLIDES = FEATURED_PROJECT.slides.length;
const t = (k: "featured.autoplay.pause" | "featured.autoplay.play") =>
    TRANSLATIONS.pt[k];

const montar = () => {
    localStorage.setItem(LANG_KEY, "pt");
    return render(
        <LangProvider>
            <Featured />
        </LangProvider>,
    );
};

/** O índice do slide marcado como ativo, lido do DOM. */
function indiceAtivo(): number {
    const slides = [...document.querySelectorAll(".featured__slide")];
    return slides.findIndex((s) => s.classList.contains("is-active"));
}

const setaProxima = () =>
    screen.getByRole("button", { name: /pr[óo]xim|next/i });
const setaAnterior = () =>
    screen.getByRole("button", { name: /anterior|previous|prev/i });

/** matchMedia respondendo o que se pedir sobre movimento reduzido. */
function comMovimentoReduzido(reduzido: boolean) {
    vi.mocked(window.matchMedia).mockImplementation(
        (query: string) =>
            ({
                matches: reduzido && query.includes("prefers-reduced-motion"),
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            }) as unknown as MediaQueryList,
    );
}

beforeEach(() => comMovimentoReduzido(false));
afterEach(() => vi.useRealTimers());

describe("Featured — o carrossel", () => {
    it("começa no primeiro slide", () => {
        montar();
        expect(SLIDES).toBeGreaterThan(1);
        expect(indiceAtivo()).toBe(0);
    });

    it("avançar anda um slide", async () => {
        const user = userEvent.setup();
        montar();

        await user.click(setaProxima());
        expect(indiceAtivo()).toBe(1);
    });

    /* Duas navegações seguidas precisam de 700 ms entre elas: o `goTo` sai
       cedo enquanto `animating` for true, e isso dura o tempo da transição.
       Não é defeito — é o que impede pular dois slides no meio do movimento.
       Descobri porque o caso de circularidade reprovou antes de eu respeitar
       o guarda, e o número que aparecia era o de uma navegação engolida. */
    const usuarioComTempo = () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        return userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    };
    const passarTransicao = () => vi.advanceTimersByTimeAsync(750);

    it("uma segunda navegação dentro da transição é ignorada", async () => {
        const user = usuarioComTempo();
        montar();

        await user.click(setaProxima());
        await user.click(setaProxima());

        /* Andou UM, não dois — o guarda está de pé. */
        expect(indiceAtivo()).toBe(1);
    });

    /* A circularidade é `((index % len) + len) % len`. Aritmética não se
       confere olhando o carrossel — e o erro clássico aqui é o módulo de
       número negativo, que em JavaScript devolve negativo. */
    it("do último volta ao primeiro", async () => {
        const user = usuarioComTempo();
        montar();

        for (let i = 0; i < SLIDES; i++) {
            await user.click(setaProxima());
            await passarTransicao();
        }

        expect(indiceAtivo()).toBe(0);
    });

    it("voltar do primeiro leva ao último", async () => {
        const user = userEvent.setup();
        montar();

        await user.click(setaAnterior());

        expect(indiceAtivo()).toBe(SLIDES - 1);
    });

    it("as setas do teclado navegam", async () => {
        const user = usuarioComTempo();
        montar();

        const galeria = screen.getByRole("region", {
            name: /capturas do projeto/i,
        });
        galeria.focus();

        await user.keyboard("{ArrowRight}");
        expect(indiceAtivo()).toBe(1);

        await passarTransicao();

        await user.keyboard("{ArrowLeft}");
        expect(indiceAtivo()).toBe(0);
    });

    it("o botão de autoplay alterna o próprio rótulo", async () => {
        const user = userEvent.setup();
        montar();

        /* Começa tocando, então o botão oferece pausar. */
        await user.click(
            screen.getByRole("button", { name: t("featured.autoplay.pause") }),
        );
        expect(
            screen.getByRole("button", { name: t("featured.autoplay.play") }),
        ).toBeInTheDocument();
    });
});

describe("Featured — o autoplay e o movimento reduzido", () => {
    it("avança sozinho depois do intervalo", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        montar();

        expect(indiceAtivo()).toBe(0);
        await vi.advanceTimersByTimeAsync(7000);

        await waitFor(() => expect(indiceAtivo()).toBe(1));
    });

    /* O invariante. Quem pede menos movimento no sistema não deve receber
       uma imagem trocando sozinha — e a garantia é um `&&` no startAuto que
       nada conferia. */
    it("NÃO avança sozinho sob prefers-reduced-motion", async () => {
        comMovimentoReduzido(true);
        vi.useFakeTimers({ shouldAdvanceTime: true });
        montar();

        expect(indiceAtivo()).toBe(0);
        /* Três intervalos inteiros: se houvesse timer, teria andado três. */
        await vi.advanceTimersByTimeAsync(7000 * 3);

        expect(indiceAtivo()).toBe(0);
    });

    it("pausado, não avança sozinho", async () => {
        const user = userEvent.setup();
        montar();
        await user.click(
            screen.getByRole("button", { name: t("featured.autoplay.pause") }),
        );

        vi.useFakeTimers({ shouldAdvanceTime: true });
        await vi.advanceTimersByTimeAsync(7000 * 2);

        expect(indiceAtivo()).toBe(0);
    });
});

describe("Featured — o lightbox", () => {
    /* Carregado por `lazy`, então o caso espera o Suspense resolver. */
    it("abre pelo gatilho do slide ativo", async () => {
        const user = userEvent.setup();
        montar();

        const gatilhos = screen.getAllByRole("button", {
            name: /ampliar|expand|abrir/i,
        });
        await user.click(gatilhos[0]!);

        await waitFor(() =>
            expect(screen.getByRole("dialog")).toBeInTheDocument(),
        );
    });
});
