import { describe, it, expect } from "vitest";
import { matchReleaseNotes } from "./routes";
import { releaseNotePath, releaseNotesPagePath } from "@/shared/config/routes";

describe("construtores de rota das notas", () => {
    it("monta o caminho de uma versão com o prefixo v", () => {
        expect(releaseNotePath("2.0.0")).toBe("/release-notes/v2.0.0");
    });

    it("não duplica o v quando a versão já vem com ele", () => {
        expect(releaseNotePath("v2.0.0")).toBe("/release-notes/v2.0.0");
    });

    it("preserva o identificador de pré-lançamento", () => {
        expect(releaseNotePath("2.0.0-beta.1")).toBe(
            "/release-notes/v2.0.0-beta.1",
        );
    });

    it("a primeira página é o próprio índice", () => {
        expect(releaseNotesPagePath(1)).toBe("/release-notes");
        expect(releaseNotesPagePath(0)).toBe("/release-notes");
    });

    it("da segunda em diante, ganha o segmento page", () => {
        expect(releaseNotesPagePath(2)).toBe("/release-notes/page/2");
    });
});

describe("matchReleaseNotes", () => {
    it("o índice é a página 1", () => {
        expect(matchReleaseNotes("/release-notes")).toEqual({
            kind: "index",
            page: 1,
        });
    });

    it("lê o número da página", () => {
        expect(matchReleaseNotes("/release-notes/page/3")).toEqual({
            kind: "index",
            page: 3,
        });
    });

    it("página inválida volta para a primeira, sem cair na home", () => {
        for (const path of [
            "/release-notes/page/abc",
            "/release-notes/page/0",
            "/release-notes/page/-2",
            "/release-notes/page",
        ]) {
            expect(matchReleaseNotes(path)).toEqual({ kind: "index", page: 1 });
        }
    });

    it("extrai a versão sem o prefixo v", () => {
        expect(matchReleaseNotes("/release-notes/v2.0.0")).toEqual({
            kind: "entry",
            version: "2.0.0",
        });
    });

    it("aceita pré-lançamento", () => {
        expect(matchReleaseNotes("/release-notes/v2.0.0-beta.1")).toEqual({
            kind: "entry",
            version: "2.0.0-beta.1",
        });
    });

    it("caminho ida e volta é estável", () => {
        const versao = "2.1.0-rc.2";
        expect(matchReleaseNotes(releaseNotePath(versao))).toEqual({
            kind: "entry",
            version: versao,
        });
    });

    it("ignora rotas que não são das notas", () => {
        expect(matchReleaseNotes("/")).toBeNull();
        expect(matchReleaseNotes("/links")).toBeNull();
        expect(matchReleaseNotes("/release-notes-outra")).toBeNull();
    });

    it("segmento a mais não é rota nossa", () => {
        expect(matchReleaseNotes("/release-notes/v2.0.0/extra")).toBeNull();
    });
});
