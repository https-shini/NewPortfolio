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

/** Histórico maior que uma página, para exercitar a paginação. */
const muitasEntradas = [
    ENTRIES[0]!,
    ...Array.from({ length: PAGE_SIZE + 5 }, (_, i) =>
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
        expect(within(card).getByText("Texto do post.")).toBeInTheDocument();
        /* O topo não é colapsável: seu conteúdo não fica atrás de um botão. */
        expect(
            within(card).queryByRole("button", { name: /^v/ }),
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

    it("versão expandida oferece o link para a página dela", async () => {
        const user = userEvent.setup();
        setup();

        /* O link vive no painel: colapsado, ele está fora da árvore de
           acessibilidade, como o resto do conteúdo. */
        await user.click(historyTriggers()[0]!);

        expect(
            screen.getByRole("link", { name: /Ver esta versão/ }),
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

        expect(historyTriggers()).toHaveLength(5);
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

        expect(
            screen.getByText("Nenhuma versão com este tema."),
        ).toBeInTheDocument();
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
