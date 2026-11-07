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
    it("h1, métricas calculadas da coleta e nenhum número fixo", async () => {
        montar();
        expect(
            screen.getByRole("heading", { level: 1, name: "Projetos" }),
        ).toBeInTheDocument();
        const metricas = await screen.findByRole("region", {
            name: "Métricas do GitHub",
        });
        await within(metricas).findByText("21");
        const par = (rotulo: string) =>
            within(metricas)
                .getByText(rotulo)
                .parentElement?.querySelector("dd")?.textContent;
        expect(par("repositórios públicos")).toBe("21");
        expect(par("estrelas recebidas")).toBe("5");
        expect(par("seguidores")).toBe("7");
        expect(par("linguagens")).toBe("2");
    });

    it("projetos recentes: 6 cards, do mais novo ao mais antigo", async () => {
        montar();
        const secao = await screen.findByRole("region", {
            name: "Projetos recentes",
        });
        const titulos = within(secao)
            .getAllByRole("article")
            .map((a) => within(a).getByRole("heading").textContent);
        expect(titulos).toEqual([
            "proj-19",
            "proj-18",
            "proj-17",
            "proj-16",
            "proj-15",
            "proj-14",
        ]);
    });

    const catalogo = () =>
        screen.findByRole("region", { name: "Todos os projetos" });
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
        expect(titulos(sec)[0]).toBe("proj-00");
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
        expect(titulos(sec)[0]).toBe("proj-00");
        fireEvent.change(
            within(sec).getByRole("combobox", { name: "Ordenar por" }),
            { target: { value: "updated" } },
        );
        expect(titulos(sec)[0]).toBe("proj-19");
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
        expect(titulos(sec)).toEqual(["um-fork"]);
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
        expect(titulos(sec)).toEqual(["um-fork"]);
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
            expect(titulos(sec)).toEqual(["proj-07"]);
        } finally {
            vi.useRealTimers();
        }
    });

    it("cada card leva à página do projeto", async () => {
        montar();
        const secao = await screen.findByRole("region", {
            name: "Projetos recentes",
        });
        expect(
            within(secao).getByRole("link", { name: "proj-19" }),
        ).toHaveAttribute("href", "/projetos/proj-19");
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
