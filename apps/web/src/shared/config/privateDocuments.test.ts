// @vitest-environment node
import { describe, expect, it } from "vitest";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
    assertNoPrivateProjectDocuments,
    isPrivateProjectDocument,
} from "../../../config/privateDocuments";

describe("documentos internos do projeto em destaque (Firecode)", () => {
    it.each([
        "/projects/firecode/README.md",
        "/projects/firecode/readme.MD?download=1",
        "/projects/firecode/%52EADME%2Emd",
        "/projects/firecode/ABOUT.md",
        "/projects/firecode/APRESENTACAO_TCC.pdf",
        "/projects/firecode/internal/documento.docx",
        "/projects/firecode/backend/main.py",
        "/projects/firecode/code-validator.zip",
        /* O HTML de origem não é mais publicado com esse nome. */
        "/projects/firecode/readme.html",
    ])("bloqueia %s", (url) => {
        expect(isPrivateProjectDocument(url)).toBe(true);
    });

    it.each([
        "/projects/firecode/index.html",
        "/projects/firecode/",
        "/projects/firecode/overview.webp",
        "/projects/firecode/pipeline.webp",
        "/projects/firecode/features.webp",
        "/projects/firecode/score.webp",
        "/docs/curriculo.pdf",
        "/release-notes",
    ])("preserva o recurso público %s", (url) => {
        expect(isPrivateProjectDocument(url)).toBe(false);
    });

    it("recusa documentos originais encontrados no artefato, sem apagá-los", async () => {
        const directory = await mkdtemp(
            path.join(os.tmpdir(), "firecode-documents-"),
        );
        try {
            /* A página gerada pelo build é pública; um readme.* não é. */
            await writeFile(
                path.join(directory, "index.html"),
                "<!doctype html><title>Firecode</title>",
            );
            await expect(
                assertNoPrivateProjectDocuments(directory),
            ).resolves.toBeUndefined();
            await mkdir(path.join(directory, "internal"));
            await writeFile(
                path.join(directory, "internal", "README.md"),
                "Documento privado",
            );
            await expect(
                assertNoPrivateProjectDocuments(directory),
            ).rejects.toThrow("Documento interno não pode ser publicado");
        } finally {
            await rm(directory, { recursive: true });
        }
    });
});
