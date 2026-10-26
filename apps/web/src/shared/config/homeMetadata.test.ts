import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fillHomeMetadata } from "../../../config/homeMetadata";

describe("metadados HTML de entrada", () => {
    it("preenche o modelo da home sem deixar placeholders em atributos ou títulos", () => {
        const html = fillHomeMetadata(
            readFileSync(resolve(process.cwd(), "index.html"), "utf8"),
        );
        const document = new DOMParser().parseFromString(html, "text/html");
        expect(document.title).toContain(
            "Guilherme Cruz — Desenvolvedor de Software",
        );
        expect(
            document
                .querySelector('link[rel="canonical"]')
                ?.getAttribute("href"),
        ).toBe("__SITE_URL__/");
        expect(document.head.textContent).not.toMatch(/__ROTA_[A-Z_]+__/);
        for (const element of document.head.querySelectorAll("meta, link")) {
            expect(element.outerHTML).not.toMatch(/__ROTA_[A-Z_]+__/);
        }
    });
    it("não altera os metadados próprios da apresentação Codex", () => {
        const html = readFileSync(
            resolve(process.cwd(), "projects/codex/readme.html"),
            "utf8",
        );
        expect(fillHomeMetadata(html)).toBe(html);
    });
});
