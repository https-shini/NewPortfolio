import { describe, it, expect, vi, afterEach } from "vitest";
import { act, render, screen, within, fireEvent } from "@testing-library/react";
import { Providers } from "@/app/providers";
import { ProjectsPage } from "./index";
import { LANG_KEY } from "@/shared/config/constants";
import { fetchPorOp, repo } from "@/test/repoFixture";

const muitos = Array.from({ length: 20 }, (_, i) =>
    repo({
        name: `proj-${String(i).padStart(2, "0")}`,
        stargazerCount: i === 0 ? 5 : 0,
        pushedAt: new Date(Date.UTC(2026, 0, 1 + i)).toISOString(),
        updatedAt: new Date(Date.UTC(2026, 0, 1 + i)).toISOString(),
        // criação na ordem inversa do push: separa "recentes" de "atualizados"
        createdAt: new Date(Date.UTC(2025, 0, 20 - i)).toISOString(),
    }),
);
const INDICE = {
    repositories: [
        ...muitos,
        repo({
            name: "um-fork",
            isFork: true,
            primaryLanguage: { name: "Python", color: null },
            languages: [{ name: "Python", color: null, size: 1 }],
        }),
    ],
    followers: 7,
    fetchedAt: "2026-11-06T12:00:00Z",
};

const FIXADOS = {
    repositories: [muitos[3], muitos[5]],
    source: "pinned",
    fetchedAt: "2026-11-06T12:00:00Z",
};

const montar = (respostas: Record<string, unknown> = { index: INDICE }) => {
    vi.stubGlobal("fetch", vi.fn(fetchPorOp(respostas)));
    localStorage.setItem(LANG_KEY, "pt");
    window.history.replaceState({}, "", "/projetos");
    return render(
        <Providers>
            <ProjectsPage />
        </Providers>,
    );
};

afterEach(() => vi.unstubAllGlobals());

describe("/projetos", () => {
    it("trilha, h1 e números calculados da coleta (sem forks)", async () => {
        montar({ index: INDICE, pinned: FIXADOS });
        const trilha = screen.getByRole("navigation", {
            name: "Trilha de navegação",
        });
        expect(
            within(trilha).getByRole("link", { name: "Início" }),
        ).toHaveAttribute("href", "/");
        expect(
            screen.getByRole("heading", { level: 1, name: /Projetos/ }),
        ).toBeInTheDocument();
        const numeros = screen.getByRole("region", {
            name: "O acervo em números",
        });
        const valor = (rotulo: RegExp) =>
            within(numeros)
                .getByText(rotulo)
                .closest("div")
                ?.querySelector("dd")?.textContent;
        await within(numeros).findByText("20");
        expect(valor(/Projetos autorais/)).toBe("20");
        expect(valor(/^Fixados/)).toBe("02");
        expect(valor(/^Linguagens/)).toBe("01");
        expect(valor(/Com demonstração/)).toBe("00");
    });

    it("atalho Fixados: só os fixados, com selo, e vai para a URL", async () => {
        montar({ index: INDICE, pinned: FIXADOS });
        const sec = await catalogo();
        const atalhos = within(sec).getByRole("group", {
            name: "Atalhos do catálogo",
        });
        const pino = await within(atalhos).findByRole("button", {
            name: /Fixados\s*2/,
        });
        fireEvent.click(pino);
        expect(pino).toHaveAttribute("aria-pressed", "true");
        expect(titulos(sec).sort()).toEqual(["Proj 03", "Proj 05"]);
        expect(within(sec).getAllByText("Fixado")).toHaveLength(2);
        expect(window.location.search).toContain("fixados=1");
        fireEvent.click(within(atalhos).getByRole("button", { name: /Todos/ }));
        expect(titulos(sec)).toHaveLength(12);
    });

    const catalogo = () =>
        screen.findByRole("region", {
            name: "Encontre seu próximo projeto para explorar.",
        });
    const titulos = (el: HTMLElement) =>
        within(el)
            .getAllByRole("article")
            .map((a) => within(a).getByRole("heading").textContent);
    const filtros = (el: HTMLElement) =>
        within(el.querySelector("aside") as HTMLElement);

    it("catálogo: padrão 'Mais recentes' por data de criação e 12 por página", async () => {
        montar();
        const sec = await catalogo();
        expect(
            within(sec).getByRole("combobox", { name: "Ordenar por" }),
        ).toHaveValue("recent");
        // proj-00 foi criado por último (createdAt), apesar do push antigo.
        expect(titulos(sec)[0]).toBe("Proj 00");
        expect(titulos(sec)).toHaveLength(12);
        expect(
            within(sec).getByText("Mostrando 1–12 de 20"),
        ).toBeInTheDocument();
    });

    it("paginação: página 2 mostra o restante e vai para a URL", async () => {
        montar();
        const sec = await catalogo();
        const nav = within(sec).getByRole("navigation", {
            name: "Paginação dos resultados",
        });
        fireEvent.click(within(nav).getByRole("button", { name: "Página 2" }));
        expect(titulos(sec)).toHaveLength(8);
        expect(
            within(sec).getByText("Mostrando 13–20 de 20"),
        ).toBeInTheDocument();
        expect(
            within(nav).getByRole("button", { name: "Página 2" }),
        ).toHaveAttribute("aria-current", "page");
        expect(window.location.search).toContain("pagina=2");
    });

    it("ordenação muda a ordem e persiste na URL", async () => {
        montar();
        const sec = await catalogo();
        fireEvent.change(
            within(sec).getByRole("combobox", { name: "Ordenar por" }),
            { target: { value: "stars" } },
        );
        expect(titulos(sec)[0]).toBe("Proj 00");
        fireEvent.change(
            within(sec).getByRole("combobox", { name: "Ordenar por" }),
            { target: { value: "updated" } },
        );
        expect(titulos(sec)[0]).toBe("Proj 19");
        expect(window.location.search).toContain("ordem=updated");
    });

    it("filtros combinados com contadores, chips e 'limpar tudo'", async () => {
        montar();
        const sec = await catalogo();
        const lateral = filtros(sec);
        fireEvent.click(
            lateral.getByRole("checkbox", { name: /Incluir forks/ }),
        );
        expect(
            within(sec).getByText("Mostrando 1–12 de 21"),
        ).toBeInTheDocument();
        fireEvent.click(lateral.getByRole("checkbox", { name: /^Python/ }));
        expect(titulos(sec)).toEqual(["Um Fork"]);
        const chips = within(sec).getByRole("group", {
            name: "Filtros ativos",
        });
        expect(
            within(chips).getByRole("button", {
                name: /Remover filtro: Python/,
            }),
        ).toBeInTheDocument();
        expect(window.location.search).toContain("ling=Python");
        fireEvent.click(
            within(chips).getByRole("button", { name: "Limpar tudo" }),
        );
        expect(
            within(sec).getByText("Mostrando 1–12 de 20"),
        ).toBeInTheDocument();
        expect(
            within(sec).queryByRole("group", { name: "Filtros ativos" }),
        ).toBeNull();
    });

    it("estado inicial vem da URL (link compartilhável)", async () => {
        vi.stubGlobal("fetch", vi.fn(fetchPorOp({ index: INDICE })));
        localStorage.setItem(LANG_KEY, "pt");
        window.history.replaceState({}, "", "/projetos?forks=1&ling=Python");
        render(
            <Providers>
                <ProjectsPage />
            </Providers>,
        );
        const sec = await catalogo();
        expect(titulos(sec)).toEqual(["Um Fork"]);
    });

    it("busca por texto com debounce", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        try {
            montar();
            const sec = await catalogo();
            fireEvent.change(within(sec).getByRole("searchbox"), {
                target: { value: "proj-07" },
            });
            await act(() => vi.advanceTimersByTimeAsync(300));
            expect(titulos(sec)).toEqual(["Proj 07"]);
        } finally {
            vi.useRealTimers();
        }
    });

    it("cada card abre o modal do projeto e leva ao repositório", async () => {
        montar();
        const sec = await catalogo();
        expect(
            within(sec).getByRole("button", { name: "Proj 00" }),
        ).toHaveAttribute("aria-haspopup", "dialog");
        expect(
            within(sec).getAllByRole("link", {
                name: /^Acessar repositório: Proj 00/,
            })[0],
        ).toHaveAttribute("href", "https://github.com/https-shini/proj-00");
    });

    it("chamada final leva ao contato", async () => {
        montar();
        await catalogo();
        expect(
            screen.getByRole("link", { name: /Entrar em contato/ }),
        ).toHaveAttribute("href", "/contato");
    });

    it("com erro: alerta, tentar de novo e saída para o GitHub", async () => {
        montar({});
        const alerta = await screen.findByRole("alert");
        expect(
            within(alerta).getByRole("button", { name: "Tentar novamente" }),
        ).toBeInTheDocument();
        expect(
            within(alerta).getByRole("link", { name: /Abrir no GitHub/ }),
        ).toHaveAttribute("target", "_blank");
    });
});
