import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { LangProvider } from "@/app/LangContext";
import { About } from "./About";
import { LANG_KEY } from "@/shared/config/constants";
import { TRANSLATIONS } from "@/shared/lib/translations";

/**
 * O que este arquivo existe para provar: a seção NUNCA mostra erro.
 *
 * O cabeçalho do `useGithubStats` declara o contrato — "valores podem ser
 * `null` (API indisponível / rate limit); o consumidor deve aplicar um
 * fallback local, nunca exibir erro ao usuário". O About cumpre com
 * `commits ?? COMMITS_FALLBACK`. Sem teste, esse contrato vivia só no
 * comentário.
 *
 * ── Por que há um IntersectionObserver aqui ──────────────────────────
 *
 * O número passa por `useCountUp`, que só começa quando o observer avisa que
 * a seção entrou na tela. O stub de `src/test/setup.ts` tem
 * `observe = vi.fn()` — a callback nunca é chamada. Com ele, `active` fica
 * `false`, o contador fica em 0, e o texto renderizado é "0" para sempre.
 *
 * Medi isso antes de escrever os casos: um teste afirmando "mostra 1000
 * quando a API falha" reprovaria pelo motivo errado. O observador abaixo
 * dispara na hora, e é o que faz a animação de fato rodar — hoje NENHUM outro
 * teste da suíte exercita o `useCountUp`, porque o stub global silencia todos.
 */
const FALLBACK = 1000;
const ROTULO_COMMITS = TRANSLATIONS.pt["about.stats.commits.label"];

/** Observer que entrega `isIntersecting: true` assim que observa. */
function observerImediato() {
    return class {
        constructor(private cb: IntersectionObserverCallback) {}
        observe(alvo: Element) {
            this.cb(
                [
                    {
                        isIntersecting: true,
                        target: alvo,
                    } as IntersectionObserverEntry,
                ],
                this as unknown as IntersectionObserver,
            );
        }
        unobserve() {}
        disconnect() {}
        takeRecords() {
            return [];
        }
    };
}

const montar = () => {
    localStorage.setItem(LANG_KEY, "pt");
    return render(
        <LangProvider>
            <About />
        </LangProvider>,
    );
};

/**
 * O card de commits, achado pelo rótulo e não por posição no grid.
 *
 * O sufixo "+" mora DENTRO de `.stat-card__value`, então ler o textContent
 * inteiro devolve "1000+" e não "1000". O número é o primeiro nó de texto;
 * o sufixo tem elemento próprio e é conferido à parte.
 */
function cardDeCommits(): HTMLElement {
    const card = screen.getByText(ROTULO_COMMITS).closest(".stat-card");
    if (!card) throw new Error("card de commits não encontrado");
    return card as HTMLElement;
}

function valorDeCommits(): string {
    const valor = cardDeCommits().querySelector(".stat-card__value");
    const sufixo =
        valor?.querySelector(".stat-card__suffix")?.textContent ?? "";
    const tudo = valor?.textContent ?? "";
    return sufixo ? tudo.slice(0, -sufixo.length) : tudo;
}

beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(window, "IntersectionObserver", {
        writable: true,
        value: observerImediato(),
    });
});

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
});

/** Roda a animação de ~1200ms até o fim e devolve o valor assentado. */
async function valorFinalDeCommits(): Promise<string> {
    await vi.advanceTimersByTimeAsync(1500);
    return valorDeCommits();
}

describe("About — o contador de commits", () => {
    it("mostra o número que a API devolveu", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ commits: 4321, repos: 12 }),
            }),
        );

        montar();
        await waitFor(() => expect(valorDeCommits()).not.toBe("0"));

        expect(await valorFinalDeCommits()).toBe("4321");
    });

    it("o número vem acompanhado do sufixo +", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ commits: 4321, repos: 12 }),
            }),
        );

        montar();
        await vi.advanceTimersByTimeAsync(1500);

        /* "4321" e "4321+" dizem coisas diferentes: o segundo admite que a
           contagem é um piso, não um número exato. */
        expect(
            cardDeCommits().querySelector(".stat-card__suffix")?.textContent,
        ).toBe("+");
    });

    /* O caso que a #28 nomeia. A rede cai, e a pessoa que visita não fica
       sabendo: vê o número de reserva, e a seção segue inteira. */
    it("com o fetch rejeitando, cai no fallback e não mostra erro", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockRejectedValue(new Error("rede fora")),
        );

        montar();

        expect(await valorFinalDeCommits()).toBe(String(FALLBACK));
        expect(screen.getByText(ROTULO_COMMITS)).toBeInTheDocument();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        expect(screen.queryByText(/erro|error|falha|failed/i)).toBeNull();
    });

    /* `r.ok ? r.json() : null` — 500 não estoura, devolve null, e o
       consumidor aplica o mesmo fallback. */
    it("resposta 500 usa o mesmo fallback", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                json: async () => ({}),
            }),
        );

        montar();

        expect(await valorFinalDeCommits()).toBe(String(FALLBACK));
    });

    /* O cache de sessão existe para não repetir a chamada a cada navegação
       dentro da aba. Sem esta garantia, o hook bateria na função serverless
       em toda montagem. */
    it("reusa o valor de sessão sem segunda ida à rede", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ commits: 777, repos: 3 }),
        });
        vi.stubGlobal("fetch", fetchMock);

        const primeira = montar();
        await waitFor(() => expect(valorDeCommits()).not.toBe("0"));
        expect(fetchMock).toHaveBeenCalledTimes(1);
        primeira.unmount();

        montar();
        expect(await valorFinalDeCommits()).toBe("777");
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
