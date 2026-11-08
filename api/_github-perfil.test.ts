import { describe, it, expect } from "vitest";
import {
    achatar,
    calcularSequencias,
    distribuirLinguagens,
    janelasAnuais,
    marcos,
} from "./_github-perfil";

const dias = (inicio: string, contagens: number[]) => {
    const base = new Date(`${inicio}T00:00:00Z`);
    return contagens.map((c, i) => {
        const d = new Date(base);
        d.setUTCDate(base.getUTCDate() + i);
        return { date: d.toISOString().slice(0, 10), contributionCount: c };
    });
};

describe("_github-perfil — cálculos do panorama", () => {
    it("achatar ordena e remove dias repetidos entre anos", () => {
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
        expect(r[2].contributionCount).toBe(9);
    });

    it("maior sequência e sequência atual com períodos", () => {
        const d = dias("2026-11-01", [1, 1, 1, 0, 2, 3, 0]);
        const r = calcularSequencias(d, "2026-11-07");
        expect(r.total).toBe(8);
        expect(r.longest).toEqual({
            days: 3,
            start: "2026-11-01",
            end: "2026-11-03",
        });
        /* hoje (07) sem contribuição ainda não quebra: conta 05–06 */
        expect(r.current).toEqual({
            days: 2,
            start: "2026-11-05",
            end: "2026-11-06",
        });
    });

    it("sequência atual zerada quando ontem e hoje ficaram em branco", () => {
        const d = dias("2026-11-01", [1, 1, 0, 0]);
        expect(calcularSequencias(d, "2026-11-04").current.days).toBe(0);
    });

    it("ignora dias futuros", () => {
        const d = dias("2026-11-06", [1, 1, 5]);
        const r = calcularSequencias(d, "2026-11-07");
        expect(r.total).toBe(2);
        expect(r.current.end).toBe("2026-11-07");
    });

    it("linguagens por bytes, somadas entre repositórios, com Outras", () => {
        const repo = (langs: [string, number][]) => ({
            name: "r",
            stargazerCount: 0,
            forkCount: 0,
            languages: {
                edges: langs.map(([name, size]) => ({
                    size,
                    node: { name, color: "#000" },
                })),
            },
        });
        const r = distribuirLinguagens(
            [
                repo([
                    ["TS", 600],
                    ["CSS", 100],
                ]),
                repo([
                    ["TS", 200],
                    ["Go", 50],
                    ["Lua", 50],
                ]),
            ],
            2,
        );
        expect(r).toEqual([
            { name: "TS", color: "#000", percent: 80 },
            { name: "CSS", color: "#000", percent: 10 },
            { name: "Outras", color: null, percent: 10 },
        ]);
        expect(distribuirLinguagens([])).toEqual([]);
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
        expect(marcos(dias("2026-01-01", [0, 0]))).toEqual({
            busiestYear: null,
            busiestDay: null,
        });
    });

    it("janelas anuais da criação da conta até hoje", () => {
        const j = janelasAnuais(
            "2022-02-23T10:00:00Z",
            new Date("2024-06-01T00:00:00Z"),
        );
        expect(j).toHaveLength(3);
        expect(j[0].from).toBe("2022-02-23T10:00:00.000Z");
        expect(j[0].to).toBe("2022-12-31T23:59:59.000Z");
        expect(j[2].to).toBe("2024-06-01T00:00:00.000Z");
    });
});
