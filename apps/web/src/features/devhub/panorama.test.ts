import { describe, it, expect } from "vitest";
import {
    agrupar,
    anosDisponiveis,
    intervalo,
    linguagens,
    resumo,
    selos,
    serieDiaria,
} from "./panorama";
import type { GithubProfile } from "./types";

/* 2025-12-29 (segunda) … 2026-01-11 (domingo): 14 dias. */
const P = {
    createdAt: "2025-12-29T12:00:00Z",
    pullRequests: 12,
    issues: 3,
    days: {
        start: "2025-12-29",
        counts: [1, 0, 2, 0, 0, 3, 1, 0, 0, 4, 0, 0, 0, 5],
    },
    streak: {
        total: 16,
        since: "",
        current: { days: 1, start: null, end: null },
        longest: { days: 8, start: null, end: null },
    },
    langs: [
        { name: "TS", color: "#00f" },
        { name: "Go", color: null },
    ],
    repos: [
        {
            name: "a",
            fork: false,
            stars: 1,
            forks: 0,
            createdAt: "",
            lang: 0,
            languages: [
                [0, 75],
                [1, 25],
            ],
        },
        {
            name: "b",
            fork: true,
            stars: 0,
            forks: 0,
            createdAt: "",
            lang: 1,
            languages: [[1, 100]],
        },
    ],
    activity: {
        repos: ["https-shini/a"],
        commits: [
            [0, 0, 1],
            [9, 0, 4],
        ],
        pullRequests: [[2, 0]],
        issues: [],
        reviews: [],
        truncated: false,
    },
} as unknown as GithubProfile;

describe("panorama — recortes exatos", () => {
    it("intervalos por período, limitados ao calendário", () => {
        expect(intervalo(P, { kind: "30d" })).toEqual([0, 13]);
        expect(intervalo(P, { kind: "year", year: 2026 })).toEqual([3, 13]);
        expect(
            intervalo(P, {
                kind: "custom",
                from: "2026-01-05",
                to: "2026-01-02",
            }),
        ).toEqual([4, 7]);
        expect(anosDisponiveis(P)).toEqual([2026, 2025]);
    });

    it("série: oficial sem recorte, detalhada com tipo", () => {
        expect(serieDiaria(P, [0, 3], "all", null)).toEqual({
            counts: [1, 0, 2, 0],
            oficial: true,
        });
        expect(serieDiaria(P, [0, 3], "commits", null)).toEqual({
            counts: [1, 0, 0, 0],
            oficial: false,
        });
        expect(serieDiaria(P, [0, 3], "pullRequests", null).counts).toEqual([
            0, 0, 1, 0,
        ]);
    });

    it("agrupa por semana (domingo) e por mês", () => {
        const s = P.days.counts;
        expect(agrupar(P, 0, s, "week").map((b) => [b.key, b.total])).toEqual([
            ["2025-12-28", 6],
            ["2026-01-04", 5],
            ["2026-01-11", 5],
        ]);
        expect(agrupar(P, 0, s, "month").map((b) => [b.key, b.total])).toEqual([
            ["2025-12", 3],
            ["2026-01", 13],
        ]);
        expect(resumo(P, 0, s)).toEqual({
            total: 16,
            ativos: 6,
            dias: 14,
            melhor: { date: "2026-01-11", count: 5 },
        });
    });

    it("linguagens por bytes dos repositórios dados", () => {
        expect(linguagens(P, P.repos).map((l) => [l.name, l.percent])).toEqual([
            ["Go", 62.5],
            ["TS", 37.5],
        ]);
    });

    it("selos com faixas fixas e progresso até o próximo nível", () => {
        const pr = selos(P).find((s) => s.id === "pullRequests")!;
        expect(pr).toMatchObject({ value: 12, level: 1, next: 25 });
        expect(pr.progress).toBe(13); // (12-10)/(25-10)
        expect(selos(P).find((s) => s.id === "streak")).toMatchObject({
            value: 8,
            level: 1,
            next: 14,
        });
    });
});
