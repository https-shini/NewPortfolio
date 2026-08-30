import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    calculateDuration,
    formatFullDate,
    formatMonthYear,
    formatShortDate,
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

    /* A opção que a carreira usa: currículo conta o primeiro e o último
       mês como cheios, e é assim que o LinkedIn mostra os mesmos cargos. */
    it("conta início e fim quando inclusive", () => {
        expect(
            calculateDuration("2025-04", "2025-12", "pt", { inclusive: true }),
        ).toBe("9 meses");
        expect(calculateDuration("2025-04", "2025-12", "pt")).toBe("8 meses");
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

describe("formatFullDate", () => {
    it("formata a data por extenso em pt-BR", () => {
        expect(formatFullDate("2026-04-06", "pt")).toBe("6 de abril de 2026");
    });

    it("formata a data por extenso em en-US", () => {
        expect(formatFullDate("2026-04-06", "en")).toBe("April 6, 2026");
    });

    it("aceita timestamp ISO completo (published_at do GitHub)", () => {
        expect(formatFullDate("2026-04-06T18:30:00Z", "pt")).toBe(
            "6 de abril de 2026",
        );
    });

    it("não desloca o dia por fuso horário", () => {
        /* new Date("2026-01-01") seria UTC e viraria 31/12 em fusos negativos. */
        expect(formatFullDate("2026-01-01", "pt")).toContain("1 de janeiro");
    });
});

describe("formatShortDate", () => {
    it("devolve a data em YYYY-MM-DD", () => {
        expect(formatShortDate("2026-04-06")).toBe("2026-04-06");
    });

    it("corta o horário do timestamp do GitHub", () => {
        expect(formatShortDate("2026-04-06T18:30:00Z")).toBe("2026-04-06");
    });

    it("não passa pelo Date — nada de deslocamento de fuso", () => {
        /* O caso que quebraria uma implementação via `new Date`: em fuso
           negativo, 1º de janeiro à meia-noite UTC vira 31 de dezembro. */
        expect(formatShortDate("2026-01-01T00:00:00Z")).toBe("2026-01-01");
    });
});
