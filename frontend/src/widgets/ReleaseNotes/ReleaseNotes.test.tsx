import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { LangProvider } from "@/app/LangContext";
import { RouterProvider } from "@/app/RouterContext";
import { ReleaseNotes } from "./ReleaseNotes";
import type { ReleaseEntry } from "@/shared/config/releaseNotes";

/** Fixture com histórico longo o bastante para exercitar a paginação. */
const entry = (
    version: string,
    date: string,
    extra: Partial<ReleaseEntry> = {},
): ReleaseEntry => ({
    version,
    date,
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

const setup = (entries = ENTRIES) => {
    localStorage.setItem("portfolio-lang", "pt");
    return render(
        <RouterProvider>
            <LangProvider>
                <ReleaseNotes entries={entries} />
            </LangProvider>
        </RouterProvider>,
    );
};

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

    it("lista o histórico colapsado, respeitando a paginação", () => {
        setup();
        /* 4 no histórico, 3 por página. */
        expect(historyTriggers()).toHaveLength(3);
        historyTriggers().forEach((btn) =>
            expect(btn).toHaveAttribute("aria-expanded", "false"),
        );
    });

    it("revela as versões restantes ao carregar mais", async () => {
        const user = userEvent.setup();
        setup();

        await user.click(
            screen.getByRole("button", { name: /versões mais antigas/i }),
        );

        expect(historyTriggers()).toHaveLength(4);
        expect(
            screen.queryByRole("button", { name: /versões mais antigas/i }),
        ).not.toBeInTheDocument();
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

    it("recomeça a paginação ao trocar de filtro", async () => {
        const user = userEvent.setup();
        setup();

        await user.click(
            screen.getByRole("button", { name: /versões mais antigas/i }),
        );
        expect(historyTriggers()).toHaveLength(4);

        await user.click(screen.getByRole("button", { name: "Design" }));
        await user.click(screen.getByRole("button", { name: "Tudo" }));

        expect(historyTriggers()).toHaveLength(3);
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
