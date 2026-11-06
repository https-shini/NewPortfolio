import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
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

    it("galeria: 12 por vez e 'carregar mais' revela o resto", async () => {
        montar();
        const galeria = await screen.findByRole("region", {
            name: "Todos os projetos",
        });
        expect(within(galeria).getAllByRole("article")).toHaveLength(12);
        expect(
            within(galeria).getByText("Mostrando 12 de 20 projetos"),
        ).toBeInTheDocument();
        fireEvent.click(
            within(galeria).getByRole("button", {
                name: /Carregar mais projetos/,
            }),
        );
        expect(within(galeria).getAllByRole("article")).toHaveLength(20);
        expect(
            within(galeria).queryByRole("button", { name: /Carregar mais/ }),
        ).toBeNull();
    });

    it("forks entram pelo filtro, e o filtro de linguagem recorta", async () => {
        montar();
        const galeria = await screen.findByRole("region", {
            name: "Todos os projetos",
        });
        fireEvent.click(
            within(galeria).getByRole("button", { name: "Filtros" }),
        );
        fireEvent.click(
            within(galeria).getByRole("checkbox", { name: "Forks" }),
        );
        expect(
            within(galeria).getByText("Mostrando 12 de 21 projetos"),
        ).toBeInTheDocument();
        fireEvent.click(
            within(galeria).getByRole("button", { name: "Python" }),
        );
        expect(within(galeria).getAllByRole("article")).toHaveLength(1);
        fireEvent.click(
            within(galeria).getByRole("button", { name: "Limpar filtros" }),
        );
        expect(
            within(galeria).getByText("Mostrando 12 de 20 projetos"),
        ).toBeInTheDocument();
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
