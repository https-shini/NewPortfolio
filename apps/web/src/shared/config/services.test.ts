import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { renderServicesHtml } from "../../../config/servicesMetadata";
import { SERVICE_META } from "./services";
describe("HTML e rotas de serviços", () => {
    it("gera entrada de orçamento própria sem indexar combinações de seleção", () => {
        const html = renderServicesHtml(
            '<html><head><title>Home</title><meta name="robots" content="index, follow"/><link rel="canonical" href="https://gcruz.dev.br/"/><script type="application/ld+json">{"@type":"Person"}</script></head></html>',
            "https://gcruz.dev.br",
            true,
        );
        expect(html).toContain("Solicitar orçamento | GCRUZ");
        expect(html).toContain('content="noindex, follow"');
        expect(html).toContain('"@type":"WebPage"');
        expect(html).toContain('href="https://gcruz.dev.br/orcamento"');
        const config = JSON.parse(readFileSync("../../vercel.json", "utf8"));
        for (const source of ["/orcamento", "/orcamento/"])
            expect(
                config.rewrites.find(
                    (r: { source: string }) => r.source === source,
                )?.destination,
            ).toBe("/quote.html");
    });
    it("gera metadados estáticos e remove Person da home", () => {
        const html = renderServicesHtml(
            '<html><head><title>Home</title><meta name="description" content="home"/><meta property="og:title" content="home"/><link rel="canonical" href="https://gcruz.dev.br/"/><script type="application/ld+json">{"@type":"Person"}</script></head></html>',
            "https://gcruz.dev.br",
        );
        expect(html).toContain(SERVICE_META.pt.title);
        expect(html).toContain(SERVICE_META.pt.description);
        expect(html).toContain('"@type":"Service"');
        expect(html).toContain('hreflang="en"');
        expect(html).not.toContain('>{"@type":"Person"}');
    });
    it("rewrites de crawler precedem o documento público sem fallback global", () => {
        const config = JSON.parse(readFileSync("../../vercel.json", "utf8"));
        const rules = config.rewrites.filter(
            (r: { source: string }) => r.source === "/servicos",
        );
        expect(rules[0].destination).toBe("/api/crawler?path=/servicos");
        expect(rules[1].destination).toBe("/services.html");
        expect(
            config.rewrites.some(
                (r: { source: string }) => r.source === "/(.*)",
            ),
        ).toBe(false);
    });
});
