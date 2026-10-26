import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import dictionaries from "@/shared/lib/translations.json";
import entries from "./releaseNotes.json";

beforeEach(() => {
    vi.resetModules();
});
afterEach(() => {
    vi.unstubAllGlobals();
});
const response = (data: unknown) => ({ ok: true, json: async () => data });

describe("conteúdo público fora do JavaScript", () => {
    it("preserva o mesmo conjunto de chaves em português e inglês", () => {
        expect(Object.keys(dictionaries.pt).sort()).toEqual(
            Object.keys(dictionaries.en).sort(),
        );
        expect(
            Object.values(dictionaries.pt).every((text) => text.length > 0),
        ).toBe(true);
        expect(
            Object.values(dictionaries.en).every((text) => text.length > 0),
        ).toBe(true);
    });
    it("deduplica buscas de tradução concorrentes e mantém o cache", async () => {
        const fetchMock = vi.fn().mockResolvedValue(response(dictionaries));
        vi.stubGlobal("fetch", fetchMock);
        const { loadTranslations } =
            await import("@/shared/lib/loadTranslations");
        await Promise.all([loadTranslations(), loadTranslations()]);
        await loadTranslations();
        expect(fetchMock).toHaveBeenCalledTimes(1);
        const { TRANSLATIONS } = await import("@/shared/lib/translations");
        expect(TRANSLATIONS).toEqual(dictionaries);
    });
    it("permite tentar novamente após uma falha ao buscar traduções", async () => {
        vi.stubGlobal(
            "fetch",
            vi
                .fn()
                .mockRejectedValueOnce(new Error("rede"))
                .mockResolvedValueOnce(response(dictionaries)),
        );
        const { loadTranslations } =
            await import("@/shared/lib/loadTranslations");
        await expect(loadTranslations()).rejects.toThrow("rede");
        await expect(loadTranslations()).resolves.toBeUndefined();
        expect(fetch).toHaveBeenCalledTimes(2);
    });
    it("rejeita JSON inválido em vez de iniciar com textos incompletos", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => {
                    throw new SyntaxError("JSON inválido");
                },
            }),
        );
        const { loadTranslations } =
            await import("@/shared/lib/loadTranslations");
        await expect(loadTranslations()).rejects.toThrow("JSON inválido");
    });
    it("carrega todas as versões com uma busca local, incluindo os corpos editoriais", async () => {
        const fetchMock = vi.fn().mockResolvedValue(response(entries));
        vi.stubGlobal("fetch", fetchMock);
        const { loadLocalReleaseNotes, RELEASE_NOTES } =
            await import("./releaseNotesClient");
        await Promise.all([loadLocalReleaseNotes(), loadLocalReleaseNotes()]);
        await loadLocalReleaseNotes();
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(RELEASE_NOTES).toEqual(entries);
    });
    it("não deixa erro HTTP impedir uma tentativa posterior do histórico", async () => {
        vi.stubGlobal(
            "fetch",
            vi
                .fn()
                .mockResolvedValueOnce({ ok: false })
                .mockResolvedValueOnce(response(entries)),
        );
        const { loadLocalReleaseNotes } = await import("./releaseNotesClient");
        await expect(loadLocalReleaseNotes()).rejects.toThrow(
            "histórico local",
        );
        await expect(loadLocalReleaseNotes()).resolves.toBeUndefined();
    });
});
