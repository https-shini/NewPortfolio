import { describe, it, expect } from "vitest";
import { buildPeriod, buildDuration, buildTotalDuration } from "./careerDates";
import type { CareerPosition } from "./Timeline.types";

const position = (
    startDate: string,
    endDate: string | undefined,
): CareerPosition => ({
    id: `pos-${startDate}`,
    title: { pt: "Cargo", en: "Role" },
    employmentType: "CLT",
    startDate,
    endDate,
    statusType: endDate ? "done" : "active",
    bullets: [],
    tags: [],
});

describe("buildPeriod", () => {
    it("usa presentLabel quando não há endDate", () => {
        const out = buildPeriod("2025-04", undefined, "en", "Present");
        expect(out).toMatch(/— Present$/);
    });

    it("formata início e fim localizados", () => {
        const out = buildPeriod("2025-04", "2025-12", "en", "Present");
        expect(out).toMatch(/Apr.*2025 — Dec.*2025/);
    });
});

describe("buildDuration", () => {
    it("remove o prefixo 'Em andamento' — status é exibido separado", () => {
        const out = buildDuration("2024-01", "2024-07", "pt");
        expect(out).toBe("6 meses");
        expect(out).not.toContain("Em andamento");
    });
});

describe("buildTotalDuration", () => {
    it("soma da posição mais antiga até a mais recente", () => {
        const positions = [
            position("2025-01", "2025-12"), // mais recente primeiro
            position("2024-01", "2024-12"),
        ];
        expect(buildTotalDuration(positions, "en")).toBe(
            "1 year and 11 months",
        );
    });

    it("retorna string vazia sem posições", () => {
        expect(buildTotalDuration([], "pt")).toBe("");
    });
});
