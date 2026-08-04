import { describe, it, expect } from "vitest";
import {
    RELEASE_NOTES,
    CHANGE_TYPES,
    getCurrentVersion,
    getUsedTags,
} from "./releaseNotes";

describe("RELEASE_NOTES — integridade dos dados", () => {
    it("a versão do topo casa com a do package.json", () => {
        expect(getCurrentVersion()).toBe(__APP_VERSION__);
    });

    it("não tem versões repetidas", () => {
        const versions = RELEASE_NOTES.map((e) => e.version);
        expect(new Set(versions).size).toBe(versions.length);
    });

    it("está ordenado da mais recente para a mais antiga", () => {
        const dates = RELEASE_NOTES.map((e) => Date.parse(e.date));
        const desc = [...dates].sort((a, b) => b - a);
        expect(dates).toEqual(desc);
    });

    it("toda entrada tem data ISO válida", () => {
        RELEASE_NOTES.forEach((entry) => {
            expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(Number.isNaN(Date.parse(entry.date))).toBe(false);
        });
    });

    it("toda entrada tem a camada estruturada preenchida", () => {
        RELEASE_NOTES.forEach((entry) => {
            const total = CHANGE_TYPES.reduce(
                (sum, type) => sum + (entry.changes?.[type]?.length ?? 0),
                0,
            );
            expect(total).toBeGreaterThan(0);
        });
    });

    it("todo texto tem pt e en preenchidos", () => {
        const bilingual = (v?: { pt: string; en: string }) => {
            if (!v) return;
            expect(v.pt.length).toBeGreaterThan(0);
            expect(v.en.length).toBeGreaterThan(0);
        };

        RELEASE_NOTES.forEach((entry) => {
            bilingual(entry.title);
            bilingual(entry.summary);
            bilingual(entry.body);
            CHANGE_TYPES.forEach((type) =>
                entry.changes?.[type]?.forEach(bilingual),
            );
            entry.links?.forEach((l) => bilingual(l.label));
        });
    });

    it("só a entrada do topo é destaque", () => {
        const featured = RELEASE_NOTES.filter((e) => e.featured);
        expect(featured).toHaveLength(1);
        expect(featured[0]).toBe(RELEASE_NOTES[0]);
    });

    it("toda entrada do histórico tem resumo de uma linha", () => {
        RELEASE_NOTES.slice(1).forEach((entry) => {
            expect(entry.summary).toBeDefined();
        });
    });
});

describe("getUsedTags", () => {
    it("lista cada tag uma vez, na ordem de aparição", () => {
        const tags = getUsedTags([
            { version: "1.0.0", date: "2026-01-01", tags: ["design", "fix"] },
            { version: "0.9.0", date: "2025-12-01", tags: ["fix", "perf"] },
        ]);
        expect(tags).toEqual(["design", "fix", "perf"]);
    });

    it("ignora entradas sem tags", () => {
        expect(getUsedTags([{ version: "1.0.0", date: "2026-01-01" }])).toEqual(
            [],
        );
    });
});
