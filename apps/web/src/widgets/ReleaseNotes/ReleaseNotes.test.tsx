import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { LangProvider } from "@/app/LangContext";
import { RouterProvider } from "@/app/RouterContext";
import { ReleaseNotes, PAGE_SIZE } from "./ReleaseNotes";
import type { ReleaseEntry } from "@/shared/config/releaseNotes";

/** Fixture com histórico longo o bastante para exercitar a paginação. */
const entry = (
    version: string,
    date: string,
    extra: Partial<ReleaseEntry> = {},
): ReleaseEntry => ({
    version,
    date,
    title: { pt: `Versão ${version}`, en: `Version ${version}` },
    summary: { pt: `Resumo ${version}`, en: `Summary ${version}` },
    changes: {
        added: [{ pt: `Novidade ${version}`, en: `New in ${version}` }],
    },
    ...extra,
});

const ENTRIES: ReleaseEntry[] = [
    entry("2.0.0", "2026-08-04", {
        featured: true,
        tags: ["design"],
        title: { pt: "Segunda geração", en: "Second generation" },
        body: { pt: "Texto do post.", en: "Post body." },
    }),
    entry("1.5.0", "2026-07-26", { tags: ["perf"] }),
    entry("1.4.0", "2026-07-23", { tags: ["design"] }),
    entry("1.3.0", "2026-07-20", { tags: ["fix"] }),
    entry("1.2.0", "2026-07-15", { tags: ["perf"] }),
];

const setup = (entries = ENTRIES, page?: number) => {
    localStorage.setItem("portfolio-lang", "pt");
    return render(
        <RouterProvider>
            <LangProvider>
                <ReleaseNotes entries={entries} page={page} />
            </LangProvider>
        </RouterProvider>,
    );
};

/* Quantas entradas sobram na última página. Precisa ser MENOR que
   PAGE_SIZE, senão o resto forma uma terceira página e as asserções de
   "página 2 de 2" deixam de valer.

   Estava fixo em 5, o que só dava duas páginas enquanto PAGE_SIZE fosse
   grande: quando ele caiu para 4, `PAGE_SIZE + 5` virou três páginas e
   três casos quebraram. Derivado, o fixture acompanha o valor real. */
const RESTO = 2;

/** Histórico maior que uma página, para exercitar a paginação. */
const muitasEntradas = [
    ENTRIES[0]!,
    ...Array.from({ length: PAGE_SIZE + RESTO }, (_, i) =>
        entry(`1.${100 - i}.0`, "2026-06-01", { tags: ["fix"] }),
    ),
];

/** Cabeçalhos dos itens colapsáveis do histórico (lista possivelmente vazia). */
const historyTriggers = () => screen.queryAllByRole("button", { name: /^v\d/ });

describe("ReleaseNotes", () => {
    it("mostra a versão mais recente no topo, já expandida", () => {
        setup();
        const card = screen.getByRole("article", { name: "Segunda geração" });

        expect(within(card).getByText("v2.0.0")).toBeInTheDocument();
        /* O topo não é colapsável: seu conteúdo não fica atrás de um botão. */
        expect(
            within(card).queryByRole("button", { name: /^v/ }),
        ).not.toBeInTheDocument();
    });

    /* O índice resume; a página da versão é que traz o artigo. Antes o
       cartão do topo abria o corpo inteiro enquanto as outras entradas
       mostravam uma linha — a assimetria empurrava o histórico para
       ~1.400px abaixo da dobra. */
    it("o cartão do índice traz o resumo, não o corpo do artigo", () => {
        setup();
        const card = screen.getByRole("article", { name: "Segunda geração" });

        expect(within(card).getByText("Resumo 2.0.0")).toBeInTheDocument();
        expect(
            within(card).queryByText("Texto do post."),
        ).not.toBeInTheDocument();
    });

    it("marca o topo como a versão mais recente", () => {
        setup();
        expect(screen.getByText("mais recente")).toBeInTheDocument();
    });

    it("lista o histórico colapsado", () => {
        setup();
        /* As 4 do histórico cabem numa página só. */
        expect(historyTriggers()).toHaveLength(4);
        historyTriggers().forEach((btn) =>
            expect(btn).toHaveAttribute("aria-expanded", "false"),
        );
    });

    it("cada versão do histórico mostra o título", () => {
        setup();
        expect(screen.getByText("Versão 1.5.0")).toBeInTheDocument();
    });

    it("o destaque leva à página da própria versão", () => {
        setup();
        const card = screen.getByRole("article", { name: "Segunda geração" });

        expect(
            within(card).getByRole("link", { name: /Ver esta versão/ }),
        ).toHaveAttribute("href", "/release-notes/v2.0.0");
    });

    it("versão expandida oferece o link para a página dela", async () => {
        const user = userEvent.setup();
        setup();

        /* O link vive no painel: colapsado, ele está fora da árvore de
           acessibilidade, como o resto do conteúdo. O destaque no topo
           tem um link com o mesmo rótulo, daí a busca ser feita dentro
           do item do histórico, e não na página inteira. */
        const item = historyTriggers()[0]!.closest(".release-item__wrapper")!;
        await user.click(historyTriggers()[0]!);

        expect(
            within(item as HTMLElement).getByRole("link", {
                name: /Ver esta versão/,
            }),
        ).toHaveAttribute("href", "/release-notes/v1.5.0");
    });

    it("histórico curto não mostra paginação", () => {
        setup();
        expect(
            screen.queryByRole("link", { name: /Próxima página/ }),
        ).not.toBeInTheDocument();
    });

    it("pagina o histórico quando ele passa do tamanho da página", () => {
        setup(muitasEntradas);

        expect(historyTriggers()).toHaveLength(PAGE_SIZE);
        expect(
            screen.getByRole("link", { name: /Próxima página/ }),
        ).toHaveAttribute("href", "/release-notes/page/2");
        /* Na primeira página não há para onde voltar. */
        expect(
            screen.queryByRole("link", { name: /Página anterior/ }),
        ).not.toBeInTheDocument();
    });

    it("a segunda página traz o resto do histórico", () => {
        setup(muitasEntradas, 2);

        expect(historyTriggers()).toHaveLength(RESTO);
        expect(
            screen.getByRole("link", { name: /Página anterior/ }),
        ).toHaveAttribute("href", "/release-notes");
        expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();
    });

    it("página fora do intervalo cai na última existente", () => {
        setup(muitasEntradas, 99);
        expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();
    });

    it("expande e recolhe um item do histórico", async () => {
        const user = userEvent.setup();
        setup();
        const first = historyTriggers()[0]!;

        await user.click(first);
        expect(first).toHaveAttribute("aria-expanded", "true");

        await user.click(first);
        expect(first).toHaveAttribute("aria-expanded", "false");
    });

    it("filtra o histórico por tema", async () => {
        const user = userEvent.setup();
        setup();

        await user.click(screen.getByRole("button", { name: "Performance" }));

        /* 1.5.0 e 1.2.0 têm a tag perf. */
        expect(historyTriggers()).toHaveLength(2);
    });

    it("o filtro não afeta a versão do topo", async () => {
        const user = userEvent.setup();
        setup();

        await user.click(screen.getByRole("button", { name: "Correções" }));

        expect(
            screen.getByRole("article", { name: "Segunda geração" }),
        ).toBeInTheDocument();
    });

    it("marca o filtro ativo com aria-pressed", async () => {
        const user = userEvent.setup();
        setup();

        const all = screen.getByRole("button", { name: "Tudo" });
        const perf = screen.getByRole("button", { name: "Performance" });

        expect(all).toHaveAttribute("aria-pressed", "true");
        await user.click(perf);
        expect(perf).toHaveAttribute("aria-pressed", "true");
        expect(all).toHaveAttribute("aria-pressed", "false");
    });

    it("trocar de filtro volta para a primeira página", async () => {
        const user = userEvent.setup();
        setup(muitasEntradas, 2);
        expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Correções" }));

        /* O filtro navega para a página 1 — senão o usuário cairia numa
           página que talvez nem exista no recorte novo. */
        expect(window.location.pathname).toBe("/release-notes");
    });

    it("avisa quando o filtro não casa com nenhuma versão", async () => {
        const user = userEvent.setup();
        setup([
            ENTRIES[0]!,
            entry("1.5.0", "2026-07-26", { tags: ["perf"] }),
            entry("1.4.0", "2026-07-23", { tags: ["perf"] }),
        ]);

        await user.click(screen.getByRole("button", { name: "Design" }));

        const aviso = screen.getByRole("status");
        expect(
            within(aviso).getByText("Nenhuma versão com este tema."),
        ).toBeInTheDocument();

        /* Filtro sem resultado é beco sem saída se a única forma de voltar
           for adivinhar qual chip desmarcar — daí a saída dentro do aviso. */
        await user.click(within(aviso).getByRole("button", { name: "Tudo" }));
        expect(historyTriggers()).toHaveLength(2);
    });

    it("exibe a data por extenso no idioma corrente", () => {
        setup();
        expect(screen.getByText("4 de agosto de 2026")).toBeInTheDocument();
    });

    it("renderiza sem histórico quando só há uma versão", () => {
        setup([ENTRIES[0]!]);
        expect(historyTriggers()).toHaveLength(0);
        expect(
            screen.queryByText("Versões anteriores"),
        ).not.toBeInTheDocument();
    });
});
