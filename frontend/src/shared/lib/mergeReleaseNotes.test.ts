import { describe, it, expect } from "vitest";
import { mergeReleaseNotes, type GithubRelease } from "./mergeReleaseNotes";
import type { ReleaseEntry } from "@/shared/config/releaseNotes";

const gh = (
    version: string,
    date: string,
    extra: Partial<GithubRelease> = {},
): GithubRelease => ({
    version,
    date,
    title: `Release ${version}`,
    html: `<p>Notas de ${version}</p>`,
    url: `https://github.com/x/y/releases/tag/v${version}`,
    ...extra,
});

const local = (
    version: string,
    date: string,
    extra: Partial<ReleaseEntry> = {},
): ReleaseEntry => ({
    version,
    date,
    title: { pt: `Versão ${version}`, en: `Version ${version}` },
    ...extra,
});

describe("mergeReleaseNotes", () => {
    it("com lista vazia dos dois lados, devolve vazio", () => {
        expect(mergeReleaseNotes([], [])).toEqual([]);
    });

    it("só GitHub: entra com título e corpo de lá", () => {
        const [entry] = mergeReleaseNotes([], [gh("2.0.0", "2026-08-04")]);

        expect(entry!.version).toBe("2.0.0");
        expect(entry!.title).toEqual({
            pt: "Release 2.0.0",
            en: "Release 2.0.0",
        });
        expect(entry!.html).toBe("<p>Notas de 2.0.0</p>");
        expect(entry!.url).toContain("releases/tag/v2.0.0");
    });

    it("só local: continua aparecendo (degradação sem rede)", () => {
        const entries = mergeReleaseNotes(
            [local("1.0.0", "2026-01-01", { featured: true })],
            [],
        );

        expect(entries).toHaveLength(1);
        expect(entries[0]!.featured).toBe(true);
        expect(entries[0]!.html).toBeUndefined();
    });

    it("nas duas fontes: estrutura do GitHub, edição do local", () => {
        const [entry] = mergeReleaseNotes(
            [
                local("2.0.0", "1999-01-01", {
                    title: { pt: "Título local", en: "Local title" },
                    featured: true,
                    tags: ["design"],
                }),
            ],
            [gh("2.0.0", "2026-08-04T18:00:00Z")],
        );

        /* Data e link são do GitHub. */
        expect(entry!.date).toBe("2026-08-04");
        expect(entry!.url).toContain("releases/tag");
        /* Título, destaque e tags são do local. */
        expect(entry!.title).toEqual({ pt: "Título local", en: "Local title" });
        expect(entry!.featured).toBe(true);
        expect(entry!.tags).toEqual(["design"]);
    });

    it("corpo local substitui o HTML do GitHub", () => {
        const [entry] = mergeReleaseNotes(
            [
                local("2.0.0", "2026-08-04", {
                    body: { pt: "Texto traduzido.", en: "Translated text." },
                }),
            ],
            [gh("2.0.0", "2026-08-04")],
        );

        expect(entry!.body).toEqual({
            pt: "Texto traduzido.",
            en: "Translated text.",
        });
        /* Não exibe as duas versões do mesmo conteúdo. */
        expect(entry!.html).toBeUndefined();
    });

    it("sem corpo local, mantém o HTML do GitHub", () => {
        const [entry] = mergeReleaseNotes(
            [local("2.0.0", "2026-08-04", { tags: ["fix"] })],
            [gh("2.0.0", "2026-08-04")],
        );

        expect(entry!.html).toBe("<p>Notas de 2.0.0</p>");
    });

    it("casa versões com e sem o prefixo v", () => {
        const entries = mergeReleaseNotes(
            [local("2.0.0", "2026-08-04", { featured: true })],
            [gh("v2.0.0", "2026-08-04")],
        );

        expect(entries).toHaveLength(1);
        expect(entries[0]!.featured).toBe(true);
    });

    it("ordena da mais recente para a mais antiga", () => {
        const entries = mergeReleaseNotes(
            [local("1.0.0", "2026-01-01")],
            [gh("2.0.0", "2026-08-04"), gh("1.5.0", "2026-05-01")],
        );

        expect(entries.map((e) => e.version)).toEqual([
            "2.0.0",
            "1.5.0",
            "1.0.0",
        ]);
    });

    it("desempata datas iguais pela versão, de forma estável", () => {
        const entries = mergeReleaseNotes(
            [],
            [gh("2.0.0", "2026-08-04"), gh("2.1.0", "2026-08-04")],
        );

        expect(entries.map((e) => e.version)).toEqual(["2.1.0", "2.0.0"]);
    });

    it("reduz o timestamp do GitHub ao dia", () => {
        const [entry] = mergeReleaseNotes(
            [],
            [gh("2.0.0", "2026-08-04T23:59:59Z")],
        );
        expect(entry!.date).toBe("2026-08-04");
    });

    it("não muta as listas recebidas", () => {
        const localList = [local("1.0.0", "2026-01-01")];
        const githubList = [gh("2.0.0", "2026-08-04")];
        const snapshot = JSON.stringify({ localList, githubList });

        mergeReleaseNotes(localList, githubList);

        expect(JSON.stringify({ localList, githubList })).toBe(snapshot);
    });
});
