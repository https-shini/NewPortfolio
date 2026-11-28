import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/* ─────────────────────────────────────────────────────────
   CSP aplicada — o que impede a política de voltar a afrouxar
   ─────────────────────────────────────────────────────────
   A CSP saiu de Report-Only depois de `audit-csp.mjs` percorrer o site
   sob bloqueio sem nenhuma violação. Estes testes travam as condições
   que tornaram isso possível.
───────────────────────────────────────────────────────── */

const raiz = resolve(process.cwd(), "../..");
const vercel = JSON.parse(
    readFileSync(resolve(raiz, "vercel.json"), "utf8"),
) as {
    headers: { source: string; headers: { key: string; value: string }[] }[];
};
const cabecalhos = vercel.headers.flatMap((h) => h.headers);
const politica =
    cabecalhos.find((h) => h.key === "Content-Security-Policy")?.value ?? "";
const diretiva = (nome: string) =>
    politica
        .split(";")
        .map((d) => d.trim())
        .find((d) => d.startsWith(`${nome} `)) ?? "";

describe("CSP aplicada", () => {
    it("é enviada como Content-Security-Policy, não como Report-Only", () => {
        expect(politica).not.toBe("");
        expect(
            cabecalhos.some(
                (h) => h.key === "Content-Security-Policy-Report-Only",
            ),
        ).toBe(false);
    });

    it("script-src só libera o próprio domínio e hashes de scripts", () => {
        const scripts = diretiva("script-src");
        expect(scripts).toMatch(
            /^script-src 'self'( 'sha256-[A-Za-z0-9+/=]+')+$/,
        );
        for (const frouxo of [
            "'unsafe-inline'",
            "'unsafe-eval'",
            "'unsafe-hashes'",
        ])
            expect(scripts).not.toContain(frouxo);
    });

    it("mantém as travas básicas e o envio de relatórios", () => {
        for (const d of [
            "default-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "frame-ancestors 'none'",
            "report-uri /api/csp-report",
        ])
            expect(politica).toContain(d);
        expect(cabecalhos.some((h) => h.key === "Reporting-Endpoints")).toBe(
            true,
        );
    });

    it.each(["apps/web/index.html", "apps/web/projects/firecode/index.html"])(
        "%s não tem handler inline (onload=, onclick=…), que a CSP bloquearia",
        (arquivo) => {
            const html = readFileSync(resolve(raiz, arquivo), "utf8");
            expect(html).not.toMatch(/<[^>]+\son[a-z]+\s*=/i);
        },
    );
});
