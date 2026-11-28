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

    it("o vercel.json reescreve cada rota para o seu arquivo, sem variante com barra", () => {
        const comuns = vercel.rewrites.filter((r) => !r.has);
        expect(vercel.trailingSlash).toBe(false);
        for (const rota of ROUTE_DOCUMENTS) {
            const regra = comuns.find((r) => r.source === rota.path);
            expect(regra?.destination, rota.path).toBe(`/${rota.file}`);
            /* A Vercel redireciona `/rota/` → `/rota`; uma rewrite com
               barra voltaria a servir a mesma página em dois endereços. */
            expect(comuns.some((r) => r.source === `${rota.path}/`)).toBe(
                false,
            );
        }
    });
});

/* ─────────────────────────────────────────────────────────
   Endereços públicos — nenhum arquivo interno é a URL de uma página
───────────────────────────────────────────────────────── */

interface Regra {
    source: string;
    destination: string;
    has?: unknown;
    permanent?: boolean;
}
const vercel = JSON.parse(
    readFileSync(resolve(process.cwd(), "../../vercel.json"), "utf8"),
) as { trailingSlash?: boolean; rewrites: Regra[]; redirects: Regra[] };

const redirecionaPara = (origem: string) =>
    vercel.redirects.find((r) => r.source === origem);

describe("vercel.json — arquivos internos e endereços antigos", () => {
    it.each([
        ["/index.html", "/"],
        ["/404.html", "/404"],
        ["/projects/firecode/index.html", ROUTES.FIRECODE],
        ["/projects/firecode/readme.html", ROUTES.FIRECODE],
        ["/projects/codex", ROUTES.FIRECODE],
        ["/projects/codex/:resto*", ROUTES.FIRECODE],
        ["/projects", ROUTES.PROJECTS],
    ])("%s redireciona (permanente) para %s", (origem, destino) => {
        const regra = redirecionaPara(origem);
        expect(regra?.destination).toBe(destino);
        expect(regra?.permanent).toBe(true);
    });

    it.each(ROUTE_DOCUMENTS)(
        "o arquivo gerado de $path não fica acessível pelo próprio nome",
        (rota) => {
            const regra = redirecionaPara(`/${rota.file}`);
            expect(regra?.destination).toBe(rota.path);
            expect(regra?.permanent).toBe(true);
        },
    );

    it("as capturas antigas apontam para a pasta nova", () => {
        const regra = vercel.redirects.find((r) =>
            r.source.startsWith("/projects/codex/:imagem"),
        );
        expect(regra?.destination).toBe("/projects/firecode/:imagem.webp");
        /* a regra das imagens vem antes da regra genérica da pasta */
        expect(vercel.redirects.indexOf(regra!)).toBeLessThan(
            vercel.redirects.findIndex(
                (r) => r.source === "/projects/codex/:resto*",
            ),
        );
    });

    it("a página técnica tem rota limpa", () => {
        const regra = vercel.rewrites.find(
            (r) => r.source === ROUTES.FIRECODE && !r.has,
        );
        expect(regra?.destination).toBe("/projects/firecode/index.html");
    });

    it("nenhum redirecionamento aponta para um arquivo .html", () => {
        for (const r of vercel.redirects)
            expect(r.destination, r.source).not.toMatch(/\.html$/);
    });
});
