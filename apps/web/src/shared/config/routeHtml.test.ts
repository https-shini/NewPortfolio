import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fillHomeMetadata } from "../../../config/homeMetadata";
import { ROUTE_DOCUMENTS, renderRouteHtml } from "../../../config/routeHtml";
import { ROUTES } from "./routes";

const SITE = "https://gcruz.dev.br";
const indexHtml = fillHomeMetadata(
    readFileSync(resolve(process.cwd(), "index.html"), "utf8"),
).replace(/__SITE_URL__/g, SITE);

const meta = (doc: Document, seletor: string) =>
    doc.querySelector(seletor)?.getAttribute("content");

describe("HTML por rota estática", () => {
    it("cobre as rotas indexáveis fora da home", () => {
        expect(ROUTE_DOCUMENTS.map((r) => r.path).sort()).toEqual(
            [
                ROUTES.CONTACT,
                ROUTES.LINKS,
                ROUTES.PROJECTS,
                ROUTES.RELEASE_NOTES,
                ROUTES.SERVICES,
                ROUTES.QUOTE,
            ].sort(),
        );
    });

    it.each(ROUTE_DOCUMENTS)(
        "$path chega com título, descrição e canonical próprios",
        (rota) => {
            const doc = new DOMParser().parseFromString(
                renderRouteHtml(indexHtml, rota, SITE),
                "text/html",
            );
            const url = `${SITE}${rota.path}`;
            expect(doc.title).toBe(rota.title);
            expect(doc.title).not.toContain("React, TypeScript");
            expect(
                doc
                    .querySelector('link[rel="canonical"]')
                    ?.getAttribute("href"),
            ).toBe(url);
            expect(meta(doc, 'meta[property="og:url"]')).toBe(url);
            expect(meta(doc, 'meta[name="description"]')).toBe(
                rota.description,
            );
            expect(meta(doc, 'meta[property="og:title"]')).toBe(rota.title);
            expect(meta(doc, 'meta[name="twitter:description"]')).toBe(
                rota.description,
            );
            /* Uma tag de cada, sem duplicar ao substituir. */
            expect(doc.querySelectorAll('link[rel="canonical"]')).toHaveLength(
                1,
            );
            expect(
                doc.querySelectorAll('meta[name="description"]'),
            ).toHaveLength(1);
        },
    );

    it("o vercel.json reescreve cada rota (com e sem barra) para o seu arquivo", () => {
        const vercel = JSON.parse(
            readFileSync(resolve(process.cwd(), "../../vercel.json"), "utf8"),
        ) as {
            rewrites: { source: string; destination: string; has?: unknown }[];
        };
        const comuns = vercel.rewrites.filter((r) => !r.has);
        for (const rota of ROUTE_DOCUMENTS) {
            for (const fonte of [rota.path, `${rota.path}/`]) {
                const regra = comuns.find((r) => r.source === fonte);
                expect(regra?.destination, fonte).toBe(`/${rota.file}`);
            }
        }
    });

    it("/servicos troca o Person da home por Service, com hreflang e imagem própria", () => {
        const rota = ROUTE_DOCUMENTS.find((r) => r.path === ROUTES.SERVICES)!;
        const doc = new DOMParser().parseFromString(
            renderRouteHtml(indexHtml, rota, SITE),
            "text/html",
        );
        const blocos = doc.querySelectorAll(
            'script[type="application/ld+json"]',
        );
        expect(blocos).toHaveLength(1);
        expect(JSON.parse(blocos[0].textContent!)["@type"]).toBe("Service");
        expect(meta(doc, 'meta[name="robots"]')).toBe("index, follow");
        expect(meta(doc, 'meta[property="og:image"]')).toBe(
            `${SITE}/api/og?page=services`,
        );
        expect(
            doc.querySelector('link[hreflang="en"]')?.getAttribute("href"),
        ).toBe(`${SITE}/servicos?lang=en`);
    });

    it("/orcamento não é indexável e não carrega o Person da home", () => {
        const rota = ROUTE_DOCUMENTS.find((r) => r.path === ROUTES.QUOTE)!;
        const doc = new DOMParser().parseFromString(
            renderRouteHtml(indexHtml, rota, SITE),
            "text/html",
        );
        expect(meta(doc, 'meta[name="robots"]')).toBe("noindex, follow");
        expect(doc.querySelectorAll('meta[name="robots"]')).toHaveLength(1);
        expect(
            JSON.parse(
                doc.querySelector('script[type="application/ld+json"]')!
                    .textContent!,
            )["@type"],
        ).toBe("WebPage");
    });
});
