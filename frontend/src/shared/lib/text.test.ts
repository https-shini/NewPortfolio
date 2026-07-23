import { describe, it, expect } from "vitest";
import { getInitials, clampText } from "./text";

describe("getInitials", () => {
    it("retorna a inicial de um único nome", () => {
        expect(getInitials("Guilherme")).toBe("G");
    });

    it("retorna primeira + última inicial em nomes compostos", () => {
        expect(getInitials("Guilherme Cruz")).toBe("GC");
        expect(getInitials("Guilherme Henrique Cruz")).toBe("GC");
    });

    it("normaliza espaços extras e string vazia", () => {
        expect(getInitials("  Guilherme   Cruz  ")).toBe("GC");
        expect(getInitials("   ")).toBe("");
    });
});

describe("clampText", () => {
    it("não altera texto dentro do limite", () => {
        expect(clampText("Hi", 5)).toBe("Hi");
    });

    it("trunca na última palavra inteira com reticências", () => {
        expect(clampText("Lorem ipsum", 8)).toBe("Lorem…");
    });

    it("trunca palavra única sem espaço", () => {
        expect(clampText("Abcdefghij", 4)).toBe("Abcd…");
    });
});
