import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderNotFoundHtml } from "../../../config/notFound";

describe("HTML 404 de produção", () => {
    it("usa o documento da aplicação sem herdar indexação e dados estruturados da home", () => {
        const original = readFileSync(
            resolve(process.cwd(), "index.html"),
            "utf8",
        );
        const document404 = new DOMParser().parseFromString(
            renderNotFoundHtml(original),
            "text/html",
        );
        expect(document404.title).toBe("404 — Página não encontrada");
        expect(
            document404
                .querySelector('meta[name="robots"]')
                ?.getAttribute("content"),
        ).toBe("noindex, follow");
        expect(document404.querySelector('link[rel="canonical"]')).toBeNull();
        expect(
            document404.querySelector('script[type="application/ld+json"]'),
        ).toBeNull();
        expect(
            document404
                .querySelector('meta[property="og:title"]')
                ?.getAttribute("content"),
        ).toContain("404");
        expect(document404.querySelector("#root h1")?.textContent).toBe(
            "Página não encontrada",
        );
        expect(document404.querySelector("#root a")?.getAttribute("href")).toBe(
            "/",
        );
        expect(
            document404
                .querySelector('script[type="module"]')
                ?.getAttribute("src"),
        ).toBe("/src/main.tsx");
    });
});
