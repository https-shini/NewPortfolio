// @vitest-environment node
import { describe, expect, it } from "vitest";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
    assertNoPrivateCodexDocuments,
    isPrivateCodexDocument,
} from "../../../config/privateDocuments";

describe("documentos internos do Codex", () => {
    it.each([
        "/projects/codex/README.md",
        "/projects/codex/readme.MD?download=1",
        "/projects/codex/%52EADME%2Emd",
        "/projects/codex/ABOUT.md",
        "/projects/codex/APRESENTACAO_TCC.pdf",
        "/projects/codex/internal/documento.docx",
        "/projects/codex/backend/main.py",
        "/projects/codex/code-validator.zip",
    ])("bloqueia %s", (url) => {
        expect(isPrivateCodexDocument(url)).toBe(true);
    });

    it.each([
        "/projects/codex/readme.html",
        "/projects/codex/readme.html?lang=en",
        "/projects/codex/index.html",
        "/projects/codex/",
        "/projects/codex/overview.webp",
        "/projects/codex/pipeline.webp",
        "/projects/codex/features.webp",
        "/projects/codex/score.webp",
        "/docs/curriculo.pdf",
        "/release-notes",
    ])("preserva o recurso público %s", (url) => {
        expect(isPrivateCodexDocument(url)).toBe(false);
    });

    it("recusa documentos originais encontrados no artefato, sem apagá-los", async () => {
        const directory = await mkdtemp(
            path.join(os.tmpdir(), "codex-documents-"),
        );
        try {
            await writeFile(
                path.join(directory, "readme.html"),
                "<!doctype html><title>Codex</title>",
            );
            await expect(
                assertNoPrivateCodexDocuments(directory),
            ).resolves.toBeUndefined();
            await mkdir(path.join(directory, "internal"));
            await writeFile(
                path.join(directory, "internal", "README.md"),
                "Documento privado",
            );
            await expect(
                assertNoPrivateCodexDocuments(directory),
            ).rejects.toThrow("Documento interno não pode ser publicado");
        } finally {
            await rm(directory, { recursive: true });
        }
    });
});
