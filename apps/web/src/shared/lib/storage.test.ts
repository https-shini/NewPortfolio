import { afterEach, describe, expect, it, vi } from "vitest";
import { gravarPreferencia, lerPreferencia } from "./storage";

afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
});

describe("preferências do visitante", () => {
    it("lê e grava normalmente quando o armazenamento existe", () => {
        gravarPreferencia("chave", "valor");
        expect(lerPreferencia("chave")).toBe("valor");
    });

    it("não lança quando o navegador bloqueia o armazenamento", () => {
        const bloqueio = new DOMException("bloqueado", "SecurityError");
        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
            throw bloqueio;
        });
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
            throw bloqueio;
        });
        expect(() => gravarPreferencia("chave", "valor")).not.toThrow();
        expect(lerPreferencia("chave")).toBeNull();
    });
});
