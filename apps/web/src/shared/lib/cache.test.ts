import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readCache, writeCache, clearCache } from "./cache";

const KEY = "teste";
const HOUR = 1000 * 60 * 60;

describe("cache", () => {
    beforeEach(() => sessionStorage.clear());
    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it("devolve o valor gravado", () => {
        writeCache(KEY, { a: 1 });
        expect(readCache<{ a: number }>(KEY)).toEqual({ a: 1 });
    });

    it("devolve null para chave inexistente", () => {
        expect(readCache(KEY)).toBeNull();
    });

    it("sem TTL, o valor vale por toda a sessão", () => {
        vi.useFakeTimers();
        writeCache(KEY, "v");
        vi.setSystemTime(Date.now() + HOUR * 24);
        expect(readCache(KEY)).toBe("v");
    });

    it("respeita o TTL", () => {
        vi.useFakeTimers();
        writeCache(KEY, "v");

        vi.setSystemTime(Date.now() + HOUR - 1000);
        expect(readCache(KEY, HOUR)).toBe("v");

        vi.setSystemTime(Date.now() + 2000);
        expect(readCache(KEY, HOUR)).toBeNull();
    });

    it("descarta o registro expirado do storage", () => {
        vi.useFakeTimers();
        writeCache(KEY, "v");
        vi.setSystemTime(Date.now() + HOUR * 2);

        readCache(KEY, HOUR);

        expect(sessionStorage.getItem(KEY)).toBeNull();
    });

    it("ignora registro sem envelope (formato antigo)", () => {
        sessionStorage.setItem(KEY, JSON.stringify({ a: 1 }));
        expect(readCache(KEY)).toBeNull();
    });

    it("ignora JSON inválido", () => {
        sessionStorage.setItem(KEY, "{ nao é json");
        expect(readCache(KEY)).toBeNull();
    });

    it("clearCache remove o registro", () => {
        writeCache(KEY, "v");
        clearCache(KEY);
        expect(readCache(KEY)).toBeNull();
    });

    it("não lança quando o storage está indisponível", () => {
        vi.stubGlobal("sessionStorage", {
            getItem: () => {
                throw new Error("bloqueado");
            },
            setItem: () => {
                throw new Error("bloqueado");
            },
            removeItem: () => {
                throw new Error("bloqueado");
            },
        });

        expect(() => writeCache(KEY, "v")).not.toThrow();
        expect(() => clearCache(KEY)).not.toThrow();
        expect(readCache(KEY)).toBeNull();
    });
});
