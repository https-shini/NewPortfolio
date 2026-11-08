import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import { Providers } from "@/app/providers";
import { GithubPanorama } from "./GithubPanorama";
import { LANG_KEY } from "@/shared/config/constants";
import type { GithubProfile } from "@/features/devhub/types";

const PERFIL: GithubProfile = {
    login: "https-shini",
    name: "Guilherme Cruz",
    createdAt: "2022-02-23T14:10:00Z",
    followers: 28,
    publicRepos: 86,
    ownRepos: 66,
    stars: 5,
    forks: 1,
    pullRequests: 46,
    issues: 55,
    lastYear: {
        from: "2025-11-07T00:00:00Z",
        to: "2026-11-07T23:59:59Z",
        contributions: 843,
        commits: 812,
        pullRequests: 31,
        issues: 40,
        reviews: 6,
        reposContributed: 24,
        restricted: 214,
    },
    calendar: {
        start: "2026-10-01",
        counts: Array.from({ length: 38 }, (_, i) => i % 3),
    },
    streak: {
        total: 2075,
        since: "2022-02-23T14:10:00Z",
        current: { days: 2, start: "2026-11-05", end: "2026-11-06" },
        longest: { days: 15, start: "2025-08-03", end: "2025-08-17" },
    },
    languages: [
        { name: "TypeScript", color: "#3178c6", percent: 60.5 },
        { name: "Outras", color: null, percent: 39.5 },
    ],
    milestones: {
        busiestYear: { year: 2025, count: 904 },
        busiestDay: { date: "2025-03-12", count: 41 },
        topRepo: null,
    },
    fetchedAt: "2026-11-07T22:30:00Z",
};

const montar = () => {
    localStorage.setItem(LANG_KEY, "pt");
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

describe("GithubPanorama", () => {
    it("endereço da janela abre o perfil em nova aba", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => Promise.resolve(new Response(JSON.stringify(PERFIL)))),
        );
        montar();
        const link = screen.getByRole("link", {
            name: "Abrir o perfil https-shini no GitHub (abre em nova aba)",
        });
        expect(link).toHaveAttribute("href", "https://github.com/https-shini");
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
        await screen.findByText("843");
    });

    it("mostra indicadores, períodos, sequências e linguagens reais", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => Promise.resolve(new Response(JSON.stringify(PERFIL)))),
        );
        montar();
        expect(await screen.findByText("843")).toBeInTheDocument();
        expect(
            screen.getByText(/Últimos 12 meses · commits/),
        ).toBeInTheDocument();
        expect(screen.getByText("66 autorais, sem forks")).toBeInTheDocument();
        const stats = screen.getByRole("region", {
            name: "Estatísticas gerais",
        });
        expect(within(stats).getByText("812")).toBeInTheDocument();
        expect(
            within(stats).getByText("Desde fev. de 2022"),
        ).toBeInTheDocument();
        const seq = screen.getByRole("region", {
            name: "Sequência de contribuições",
        });
        expect(within(seq).getByText("2.075")).toBeInTheDocument();
        expect(within(seq).getByText(/15/)).toBeInTheDocument();
        const langs = screen.getByRole("region", {
            name: "Linguagens mais usadas",
        });
        expect(within(langs).getByText("TypeScript")).toBeInTheDocument();
        expect(within(langs).getByText("Outras")).toBeInTheDocument();
        expect(
            within(langs).getByText(/não nível de proficiência/),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("img", { name: /843 contribuições entre/ }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/incluem 214 em repositórios privados/),
        ).toBeInTheDocument();
        /* Sem repositório estrelado, o marco não aparece. */
        expect(screen.queryByText("Repositório mais estrelado")).toBeNull();
    });

    it("falha da API vira aviso com link para o perfil", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => Promise.resolve(new Response("{}", { status: 503 }))),
        );
        montar();
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
