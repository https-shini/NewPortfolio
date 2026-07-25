import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    calculateDuration,
    formatMonthYear,
    monthsSince,
    yearsSince,
} from "./dateUtils";

const at = (y: number, m: number) => new Date(y, m - 1, 15);

describe("monthsSince", () => {
    it("conta meses inteiros desde a data", () => {
        expect(monthsSince("2020-01", at(2026, 7))).toBe(78);
    });
    it("zero no mesmo mês", () => {
        expect(monthsSince("2026-07", at(2026, 7))).toBe(0);
    });
});

describe("yearsSince", () => {
    it("deriva anos inteiros (marco de jornada dev)", () => {
        expect(yearsSince("2020-01", at(2026, 7))).toBe(6);
    });
    it("arredonda para baixo (11 meses = 0 ano)", () => {
        expect(yearsSince("2025-09", at(2026, 7))).toBe(0);
    });
});

describe("calculateDuration", () => {
    it("calcula anos e meses com datas fechadas (pt)", () => {
        expect(calculateDuration("2022-01", "2023-04", "pt")).toBe(
            "1 ano e 3 meses",
        );
    });

    it("calcula anos e meses com datas fechadas (en)", () => {
        expect(calculateDuration("2022-01", "2024-03", "en")).toBe(
            "2 years and 2 months",
        );
    });

    it("pluraliza corretamente 1 mês", () => {
        expect(calculateDuration("2024-01", "2024-02", "pt")).toBe("1 mês");
        expect(calculateDuration("2024-01", "2024-02", "en")).toBe("1 month");
    });

    it("retorna 'menos de 1 mês' para o mesmo mês", () => {
        expect(calculateDuration("2024-05", "2024-05", "pt")).toBe(
            "menos de 1 mês",
        );
    });

    describe("posição em andamento (endDate undefined)", () => {
        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 6, 15)); // jul/2026
        });
        afterEach(() => {
            vi.useRealTimers();
        });

        it("usa a data atual e prefixa 'Em andamento'", () => {
            expect(calculateDuration("2026-01", undefined, "pt")).toBe(
                "Em andamento · 6 meses",
            );
        });

        it("usa 'Ongoing' em inglês", () => {
            expect(calculateDuration("2025-07", undefined, "en")).toBe(
                "Ongoing · 1 year",
            );
        });
    });
});

describe("formatMonthYear", () => {
    it("formata mês/ano em pt-BR", () => {
        expect(formatMonthYear("2024-01", "pt")).toMatch(/jan/i);
        expect(formatMonthYear("2024-01", "pt")).toContain("2024");
    });

    it("formata mês/ano em en-US", () => {
        expect(formatMonthYear("2024-12", "en")).toMatch(/Dec/);
        expect(formatMonthYear("2024-12", "en")).toContain("2024");
    });
});
