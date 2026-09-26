import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Providers } from "@/app/providers";
import { Header } from "./Header";
import { LANG_KEY } from "@/shared/config/constants";

/**
 * O Header é o widget que prova o custo de não haver teste: a auditoria
 * encontrou nele QUATRO defeitos em produção, e todos os quatro eram
 * comportamento, não aparência.
 *
 *   1. o X do overlay não fechava o menu — o do header ficava visível e
 *      morto, porque o `inert` do fundo o alcançava;
 *   2. o menu ficava invisível sob prefers-reduced-motion;
 *   3. o foco não voltava ao gatilho ao fechar, e quem navega por teclado
 *      perdia o lugar na página;
 *   4. o logotipo sobrepunha o primeiro item.
 *
 * Os defeitos 1 e 3 são exatamente o que este arquivo cobre, e o 2 em
 * parte — ver a nota no teste de movimento reduzido. O 4 é geometria: mora
 * no `audit:overflow` e no `geometry.mjs`, não aqui.
 *
 * O Header precisa da árvore inteira de providers: ele usa useTheme,
 * useLang, useRoute, useScrollLock, useFocusTrap e useInertBackground.
 */
const montar = () => {
    localStorage.setItem(LANG_KEY, "pt");
    return render(
        <Providers>
            <Header />
        </Providers>,
    );
};

/** O gatilho tem id próprio; o X do overlay divide o rótulo com ele. */
const hamburguer = () => document.querySelector("#site-hamburger")!;

describe("Header", () => {
    beforeEach(() => {
        window.history.pushState({}, "", "/");
    });

    it("começa com o menu fechado, e o gatilho diz isso", () => {
        montar();
        expect(hamburguer()).toHaveAttribute("aria-expanded", "false");
        /* aria-hidden no overlay fechado tira o dialog da árvore — é o que
           faz o leitor de tela não anunciar um menu que não está lá. */
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("o gatilho abre o menu e passa a anunciar o estado aberto", async () => {
        const user = userEvent.setup();
        montar();

        await user.click(hamburguer());

        expect(hamburguer()).toHaveAttribute("aria-expanded", "true");
        const dialogo = screen.getByRole("dialog", {
            name: "Menu de navegação",
        });
        expect(dialogo).toHaveAttribute("aria-modal", "true");
        expect(dialogo.className).toContain("is-open");
    });

    /* DEFEITO 1. O X do header inteiro fica inerte enquanto o menu existe —
       ele estava visível e não respondia. O X que fecha é o de DENTRO do
       overlay, e é esse que este teste exercita. Os dois dividem o rótulo
       "Fechar menu", daí a busca ser dentro do dialog. */
    it("o X de dentro do overlay fecha o menu", async () => {
        const user = userEvent.setup();
        montar();

        await user.click(hamburguer());
        const dialogo = screen.getByRole("dialog");

        await user.click(
            within(dialogo).getByRole("button", { name: "Fechar menu" }),
        );

        expect(hamburguer()).toHaveAttribute("aria-expanded", "false");
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    /* DEFEITO 3. Fechar devolvia o foco ao body: a chamada acontecia
       enquanto o header ainda estava inerte, e `inert` bloqueia foco — era
       um no-op silencioso. A correção move o foco para um efeito, que roda
       depois de o atributo sair. */
    it("devolve o foco ao gatilho depois de fechar", async () => {
        const user = userEvent.setup();
        montar();

        await user.click(hamburguer());

        /* Este passo é o teste. Sem ele o clique acima já deixa o gatilho
           focado, a asserção do fim passa sozinha, e o teste não afirma
           nada — medi: removendo a devolução de foco do componente, a
           versão anterior deste caso continuava verde. Tirar o foco de lá
           primeiro é o que torna a restauração observável. */
        const fechar = within(screen.getByRole("dialog")).getByRole("button", {
            name: "Fechar menu",
        });
        fechar.focus();
        expect(hamburguer()).not.toHaveFocus();

        await user.keyboard("{Escape}");

        expect(hamburguer()).toHaveFocus();
    });

    it("Escape fecha o menu", async () => {
        const user = userEvent.setup();
        montar();

        await user.click(hamburguer());
        expect(screen.getByRole("dialog")).toBeInTheDocument();

        await user.keyboard("{Escape}");

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("clicar no fundo do overlay fecha; clicar no conteúdo não", async () => {
        const user = userEvent.setup();
        montar();

        await user.click(hamburguer());
        const dialogo = screen.getByRole("dialog");

        /* O conteúdo primeiro: se fechasse aqui, o menu seria inutilizável. */
        await user.click(within(dialogo).getByRole("navigation"));
        expect(screen.getByRole("dialog")).toBeInTheDocument();

        await user.click(dialogo);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("os oito itens de navegação estão no menu aberto", async () => {
        const user = userEvent.setup();
        montar();

        await user.click(hamburguer());
        const nav = within(screen.getByRole("dialog")).getByRole("navigation");

        /* Oito é a contagem de NAV_LINKS. Se alguém acrescentar uma seção
           sem acrescentar o link, ou o contrário, este número desmente. */
        expect(within(nav).getAllByRole("link")).toHaveLength(8);
    });

    /* DEFEITO 2, a metade que dá para testar aqui. A causa era CSS, e o
       vitest roda com `css: false` — então não há como medir visibilidade
       neste arquivo. O que se afirma é o que importa para o JS: nenhum
       caminho do componente depende de haver movimento, então sob
       prefers-reduced-motion o menu abre e o conteúdo continua alcançável.

       A metade visual é do `audit:a11y`, que roda com
       `reducedMotion: "reduce"` e desde a #29 abre o menu. */
    it("abre e mantém o conteúdo alcançável sob prefers-reduced-motion", async () => {
        vi.mocked(window.matchMedia).mockImplementation(
            (query: string) =>
                ({
                    matches: query.includes("prefers-reduced-motion"),
                    media: query,
                    onchange: null,
                    addListener: vi.fn(),
                    removeListener: vi.fn(),
                    addEventListener: vi.fn(),
                    removeEventListener: vi.fn(),
                    dispatchEvent: vi.fn(),
                }) as unknown as MediaQueryList,
        );

        const user = userEvent.setup();
        montar();

        await user.click(hamburguer());

        const dialogo = screen.getByRole("dialog");
        expect(dialogo.className).toContain("is-open");
        expect(
            within(dialogo).getByRole("button", { name: "Fechar menu" }),
        ).toBeInTheDocument();
        expect(
            within(within(dialogo).getByRole("navigation")).getAllByRole(
                "link",
            ),
        ).toHaveLength(8);
    });

    /* Fora da home o observer de seção não existe, e `activeSection` é
       derivada como vazia — nenhum item pode aparecer marcado. Marcar um
       item numa página que não tem aquela seção mentiria sobre onde a
       pessoa está. */
    it("fora da home nenhum item de navegação fica marcado como ativo", async () => {
        window.history.pushState({}, "", "/release-notes");
        const user = userEvent.setup();
        montar();

        await user.click(hamburguer());
        const nav = within(screen.getByRole("dialog")).getByRole("navigation");

        for (const link of within(nav).getAllByRole("link")) {
            expect(link.className).not.toContain("is-active");
        }
    });
});
