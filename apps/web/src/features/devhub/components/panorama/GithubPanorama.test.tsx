import { describe, it, expect, afterEach, vi } from "vitest";
import {
    render,
    screen,
    cleanup,
    within,
    fireEvent,
} from "@testing-library/react";
import { Providers } from "@/app/providers";
import { GithubPanorama } from "./GithubPanorama";
import { LANG_KEY } from "@/shared/config/constants";
import type { GithubProfile } from "@/features/devhub/types";

/* 40 dias: 2026-09-29 … 2026-11-07. Dia 39 = hoje. */
const COUNTS: number[] = Array.from({ length: 40 }, (_, i) =>
    i % 4 === 0 ? 0 : 2,
);

const PERFIL: GithubProfile = {
    login: "https-shini",
    name: "Guilherme Cruz",
    createdAt: "2026-09-29T17:00:00Z",
    followers: 38,
    pullRequests: 46,
    issues: 55,
    lastYear: {
        from: "2025-11-02T03:00:00Z",
        to: "2026-11-08T02:59:59Z",
        contributions: 60,
        commits: 50,
        pullRequests: 3,
        issues: 2,
        reviews: 0,
        reposContributed: 2,
        restricted: 0,
    },
    days: { start: "2026-09-29", counts: COUNTS },
    streak: {
        total: 60,
        since: "2026-09-29T17:00:00Z",
        current: { days: 3, start: "2026-11-05", end: "2026-11-07" },
        longest: { days: 3, start: "2026-09-30", end: "2026-10-02" },
    },
    langs: [
        { name: "TypeScript", color: "#3178c6" },
        { name: "CSS", color: "#663399" },
    ],
    repos: [
        {
            name: "app",
            fork: false,
            stars: 3,
            forks: 1,
            createdAt: "2026-01-01T00:00:00Z",
            lang: 0,
            languages: [
                [0, 900],
                [1, 100],
            ],
        },
        {
            name: "site",
            fork: false,
            stars: 2,
            forks: 0,
            createdAt: "2026-01-01T00:00:00Z",
            lang: 1,
            languages: [[1, 500]],
        },
        {
            name: "lib-fork",
            fork: true,
            stars: 0,
            forks: 0,
            createdAt: "2026-01-01T00:00:00Z",
            lang: 0,
            languages: [[0, 5000]],
        },
    ],
    activity: {
        repos: ["https-shini/app", "https-shini/site", "outro/projeto"],
        commits: [
            [1, 0, 10],
            [20, 1, 5],
            [35, 0, 7],
            [38, 2, 4],
        ],
        pullRequests: [[36, 2]],
        issues: [[37, 1]],
        reviews: [],
        truncated: false,
    },
    milestones: {
        busiestYear: { year: 2026, count: 60 },
        busiestDay: null,
        topRepo: { name: "app", stars: 3 },
    },
    fetchedAt: "2026-11-08T01:00:00Z",
};

const montar = (status = 200) => {
    localStorage.setItem(LANG_KEY, "pt");
    vi.stubGlobal(
        "fetch",
        vi.fn(() =>
            Promise.resolve(
                new Response(status === 200 ? JSON.stringify(PERFIL) : "{}", {
                    status,
                }),
            ),
        ),
    );
    return render(
        <Providers>
            <GithubPanorama />
        </Providers>,
    );
};

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    localStorage.clear();
});

const kpi = (rotulo: string) =>
    screen
        .getByText(rotulo, { selector: ".ghp__kpi-label" })
        .closest(".ghp__kpi")!
        .querySelector("dd")!;

describe("GithubPanorama", () => {
    it("janela com cinco abas acessíveis e endereço em nova aba", async () => {
        montar();
        const link = screen.getByRole("link", {
            name: "Abrir o perfil https-shini no GitHub (abre em nova aba)",
        });
        expect(link).toHaveAttribute("href", "https://github.com/https-shini");
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
        const abas = screen.getAllByRole("tab");
        expect(abas.map((a) => a.textContent)).toEqual([
            "GitHub · https-shini",
            "Linguagens",
            "Contribuições",
            "Sequências",
            "Conquistas",
        ]);
        expect(abas[0]).toHaveAttribute("aria-selected", "true");
        expect(abas[1]).toHaveAttribute("tabindex", "-1");
        fireEvent.keyDown(abas[0], { key: "ArrowRight" });
        expect(screen.getByRole("tab", { name: "Linguagens" })).toHaveAttribute(
            "aria-selected",
            "true",
        );
        fireEvent.keyDown(screen.getByRole("tab", { name: "Linguagens" }), {
            key: "End",
        });
        expect(screen.getByRole("tab", { name: "Conquistas" })).toHaveAttribute(
            "aria-selected",
            "true",
        );
        expect(screen.getByRole("tabpanel")).toHaveAttribute(
            "aria-labelledby",
            "ghp-tab-badges",
        );
    });

    it("visão geral: escopo autoral por padrão; filtros atualizam só o compatível", async () => {
        montar();
        await screen.findByRole("heading", { name: "Estatísticas gerais" });
        expect(kpi("Repositórios")).toHaveTextContent("2");
        expect(kpi("Estrelas recebidas")).toHaveTextContent("5");
        expect(kpi("Commits")).toHaveTextContent("22"); // só repositórios autorais

        fireEvent.click(
            screen.getByRole("button", { name: "Todos", pressed: false }),
        );
        expect(kpi("Repositórios")).toHaveTextContent("3");
        expect(kpi("Commits")).toHaveTextContent("26"); // inclui outro/projeto
        expect(screen.getByText("1 filtro ativo")).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText("Repositório"), {
            target: { value: "site" },
        });
        expect(kpi("Estrelas recebidas")).toHaveTextContent("2");
        expect(kpi("Commits")).toHaveTextContent("5");

        fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
        expect(kpi("Repositórios")).toHaveTextContent("2");
        expect(screen.getByText("Sem filtros ativos")).toBeInTheDocument();
    });

    it("linguagens: distribuição por bytes e troca de visualização", async () => {
        montar();
        fireEvent.click(screen.getByRole("tab", { name: "Linguagens" }));
        const langs = await screen.findByRole("region", {
            name: "Linguagens mais usadas",
        });
        expect(within(langs).getByText("TypeScript")).toBeInTheDocument();
        expect(
            within(langs).getByText(/não domínio técnico/),
        ).toBeInTheDocument();
        fireEvent.change(screen.getByLabelText("Repositório"), {
            target: { value: "site" },
        });
        expect(within(langs).queryByText("TypeScript")).toBeNull();
        expect(within(langs).getByText("CSS")).toBeInTheDocument();
        fireEvent.click(
            within(langs).getByRole("button", { name: "Segmentada" }),
        );
        expect(
            within(langs).getByRole("button", { name: "Segmentada" }),
        ).toHaveAttribute("aria-pressed", "true");
    });

    it("cada aba guarda os próprios filtros ao alternar", async () => {
        montar();
        await screen.findByRole("heading", { name: "Estatísticas gerais" });
        fireEvent.click(screen.getByRole("button", { name: "Forks" }));
        fireEvent.click(screen.getByRole("tab", { name: "Linguagens" }));
        /* a aba Linguagens tem o seu próprio escopo, ainda no padrão */
        expect(
            screen.getByRole("button", { name: "Autorais" }),
        ).toHaveAttribute("aria-pressed", "true");
        fireEvent.click(
            screen.getByRole("tab", { name: "GitHub · https-shini" }),
        );
        expect(screen.getByRole("button", { name: "Forks" })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
    });

    it("contribuições: calendário oficial sem recorte; detalhamento com tipo/repositório", async () => {
        montar();
        fireEvent.click(screen.getByRole("tab", { name: "Contribuições" }));
        fireEvent.click(await screen.findByRole("button", { name: "30 dias" }));
        const oficial = COUNTS.slice(10).reduce((s, n) => s + n, 0);
        expect(kpi("Contribuições")).toHaveTextContent(String(oficial));
        expect(
            screen.getByText(/Calendário oficial do GitHub/),
        ).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText("Tipo de atividade"), {
            target: { value: "commits" },
        });
        expect(kpi("Contribuições")).toHaveTextContent("16"); // 5 + 7 + 4
        expect(
            screen.getByText(/Soma das contribuições públicas/),
        ).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText("Repositório"), {
            target: { value: "https-shini/app" },
        });
        expect(kpi("Contribuições")).toHaveTextContent("7");
    });

    it("sequências e conquistas: históricos, sem filtros", async () => {
        montar();
        fireEvent.click(screen.getByRole("tab", { name: "Sequências" }));
        expect(await screen.findByText("Sequência atual")).toBeInTheDocument();
        const anos = screen.getByRole("region", {
            name: "Contribuições por ano",
        });
        expect(within(anos).getByText("2026")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("tab", { name: "Conquistas" }));
        expect(
            await screen.findByText(/de 9 selos conquistados/),
        ).toBeInTheDocument();
        expect(screen.getAllByRole("progressbar")).toHaveLength(9);
    });

    it("falha da API vira aviso com link para o perfil", async () => {
        montar(503);
        expect(
            await screen.findByText(
                "Não foi possível carregar os dados do GitHub agora.",
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /Ver o perfil no GitHub/ }),
        ).toHaveAttribute("href", "https://github.com/https-shini");
    });
});
