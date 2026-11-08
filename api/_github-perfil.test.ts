import { describe, it, expect } from "vitest";
import {
    achatar,
    calcularSequencias,
    dataLocal,
    denso,
    deslocamentoDoFuso,
    detalhar,
    janelasTrimestrais,
    marcos,
    normalizarRepos,
    type Janela,
} from "./_github-perfil";

const dias = (inicio: string, contagens: number[]) => {
    const base = new Date(`${inicio}T00:00:00Z`);
    return contagens.map((c, i) => {
        const d = new Date(base);
        d.setUTCDate(base.getUTCDate() + i);
        return { date: d.toISOString().slice(0, 10), contributionCount: c };
    });
};

const pagina = <T>(nodes: T[], hasNextPage = false) => ({
    pageInfo: { hasNextPage },
    nodes,
});
const pub = (n: string) => ({ nameWithOwner: n, isPrivate: false });
const priv = (n: string) => ({ nameWithOwner: n, isPrivate: true });

describe("_github-perfil — cálculos do panorama", () => {
    it("achatar ordena e remove dias repetidos entre janelas", () => {
        const a = { weeks: [{ contributionDays: dias("2025-12-30", [1, 2]) }] };
        const b = {
            weeks: [{ contributionDays: dias("2025-12-31", [2, 9, 4]) }],
        };
        const r = achatar([b, a]);
        expect(r.map((d) => d.date)).toEqual([
            "2025-12-30",
            "2025-12-31",
            "2026-01-01",
            "2026-01-02",
        ]);
    });

    it("denso preenche lacunas com zero", () => {
        const d = [...dias("2026-01-01", [1]), ...dias("2026-01-04", [5])];
        expect(denso(d)).toEqual({ start: "2026-01-01", counts: [1, 0, 0, 5] });
    });

    it("sequências atual e maior com períodos", () => {
        const r = calcularSequencias(
            dias("2026-11-01", [1, 1, 1, 0, 2, 3, 0]),
            "2026-11-07",
        );
        expect(r.total).toBe(8);
        expect(r.longest).toEqual({
            days: 3,
            start: "2026-11-01",
            end: "2026-11-03",
        });
        expect(r.current).toEqual({
            days: 2,
            start: "2026-11-05",
            end: "2026-11-06",
        });
        expect(
            calcularSequencias(dias("2026-11-01", [1, 1, 0, 0]), "2026-11-04")
                .current.days,
        ).toBe(0);
    });

    it("marcos: ano e dia mais ativos", () => {
        const d = [
            ...dias("2025-12-30", [2, 9]),
            ...dias("2026-01-01", [3, 3, 3, 3]),
        ];
        expect(marcos(d)).toEqual({
            busiestYear: { year: 2026, count: 12 },
            busiestDay: { date: "2025-12-31", count: 9 },
        });
    });

    it("fuso: deslocamento e data local", () => {
        expect(deslocamentoDoFuso("2025-11-02T03:00:00Z")).toBe(180);
        expect(deslocamentoDoFuso("2025-11-01T22:00:00Z")).toBe(-120);
        /* 01:30Z do dia 6 é 22:30 do dia 5 em UTC-3 */
        expect(dataLocal("2026-11-06T01:30:00Z", 180)).toBe("2026-11-05");
        expect(dataLocal("2026-11-06T03:00:00Z", 180)).toBe("2026-11-06");
    });

    it("janelas trimestrais em meia-noite local, sem passar de agora", () => {
        const j = janelasTrimestrais(
            "2022-02-23T17:00:00Z",
            new Date("2022-08-10T12:00:00Z"),
            180,
        );
        expect(j).toEqual([
            {
                from: "2022-01-01T03:00:00.000Z",
                to: "2022-04-01T02:59:59.000Z",
            },
            {
                from: "2022-04-01T03:00:00.000Z",
                to: "2022-07-01T02:59:59.000Z",
            },
            {
                from: "2022-07-01T03:00:00.000Z",
                to: "2022-08-10T12:00:00.000Z",
            },
        ]);
    });

    it("detalhar descarta repositórios privados e indexa dias e repositórios", () => {
        const janela: Janela = {
            contributionCalendar: { weeks: [] },
            commitContributionsByRepository: [
                {
                    repository: pub("u/a"),
                    contributions: pagina([
                        { occurredAt: "2026-01-02T03:00:00Z", commitCount: 4 },
                    ]),
                },
                {
                    repository: priv("u/segredo"),
                    contributions: pagina([
                        { occurredAt: "2026-01-02T03:00:00Z", commitCount: 9 },
                    ]),
                },
            ],
            pullRequestContributions: pagina([
                {
                    occurredAt: "2026-01-03T15:00:00Z",
                    pullRequest: { repository: pub("o/b") },
                },
                {
                    occurredAt: "2026-01-03T15:00:00Z",
                    pullRequest: { repository: priv("u/segredo") },
                },
            ]),
            issueContributions: pagina([], true),
            pullRequestReviewContributions: pagina([
                {
                    occurredAt: "2026-01-01T12:00:00Z",
                    pullRequestReview: { repository: pub("u/a") },
                },
            ]),
        };
        const r = detalhar([janela], "2026-01-01", 180);
        expect(r.repos).toEqual(["u/a", "o/b"]);
        expect(r.commits).toEqual([[1, 0, 4]]);
        expect(r.pullRequests).toEqual([[2, 1]]);
        expect(r.reviews).toEqual([[0, 0]]);
        expect(r.truncated).toBe(true);
        expect(JSON.stringify(r)).not.toContain("segredo");
    });

    it("detalhar descarta o dia repetido na fronteira entre janelas", () => {
        const commits = (d: string) => [
            {
                repository: pub("u/a"),
                contributions: pagina([{ occurredAt: d, commitCount: 5 }]),
            },
        ];
        const base = {
            contributionCalendar: { totalContributions: 0, weeks: [] },
            pullRequestContributions: pagina([]),
            issueContributions: pagina([]),
            pullRequestReviewContributions: pagina([]),
        };
        /* fuso -03:00 (180 min): 31/03 15h local aparece nas duas janelas */
        const r = detalhar(
            [
                {
                    ...base,
                    limite: { de: "2026-01-01", ate: "2026-03-31" },
                    commitContributionsByRepository: commits(
                        "2026-03-31T18:00:00Z",
                    ),
                },
                {
                    ...base,
                    limite: { de: "2026-04-01", ate: "2026-06-30" },
                    commitContributionsByRepository: commits(
                        "2026-03-31T18:00:00Z",
                    ),
                },
            ],
            "2026-01-01",
            180,
        );
        expect(r.commits).toEqual([[89, 0, 5]]);
    });

    it("normalizarRepos compartilha o dicionário de linguagens", () => {
        const { langs, repos } = normalizarRepos([
            {
                name: "a",
                isFork: false,
                stargazerCount: 2,
                forkCount: 1,
                createdAt: "2024-01-01T00:00:00Z",
                primaryLanguage: { name: "TS" },
                languages: {
                    edges: [{ size: 10, node: { name: "TS", color: "#00f" } }],
                },
            },
            {
                name: "b",
                isFork: true,
                stargazerCount: 0,
                forkCount: 0,
                createdAt: "2024-01-01T00:00:00Z",
                primaryLanguage: null,
                languages: {
                    edges: [
                        { size: 5, node: { name: "CSS", color: null } },
                        { size: 3, node: { name: "TS", color: "#00f" } },
                    ],
                },
            },
        ]);
        expect(langs).toEqual([
            { name: "TS", color: "#00f" },
            { name: "CSS", color: null },
        ]);
        expect(repos[0]).toMatchObject({
            name: "a",
            fork: false,
            lang: 0,
            languages: [[0, 10]],
        });
        expect(repos[1]).toMatchObject({
            fork: true,
            lang: null,
            languages: [
                [1, 5],
                [0, 3],
            ],
        });
    });
});
