// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

/* `scripts/portoes.mjs` é a lista única de portões: o `npm run verify`
   executa dela. Este teste garante que o CI execute a mesma lista —
   três portões chegaram a rodar só localmente, e uma regressão de
   /contato passou pela `main` sem reprovar nada. */

const raiz = resolve(process.cwd(), "../..");
const portoes = (await import(
    pathToFileURL(resolve(raiz, "scripts/portoes.mjs")).href
)) as {
    PORTOES_ESTATICOS: string[];
    PORTOES_NAVEGADOR: string[];
    FERRAMENTAS_MANUAIS: string[];
};
const ci = readFileSync(resolve(raiz, ".github/workflows/ci.yml"), "utf8");
const pacote = JSON.parse(
    readFileSync(resolve(raiz, "package.json"), "utf8"),
) as { scripts: Record<string, string> };

describe("portões de qualidade", () => {
    const todos = [...portoes.PORTOES_ESTATICOS, ...portoes.PORTOES_NAVEGADOR];

    it.each(todos)("o CI executa `%s`", (script) => {
        /* `npm test` é atalho do npm para `npm run test`. */
        const nome = script.replace(":", "\\:");
        const comando =
            script === "test" ? `npm (run )?test` : `npm run ${nome}`;
        expect(ci).toMatch(new RegExp(`${comando}\\s*$`, "m"));
    });

    it.each(todos)("`%s` existe no package.json", (script) => {
        expect(pacote.scripts[script]).toBeTruthy();
    });

    it("ferramentas manuais ficam fora do CI, de propósito", () => {
        for (const script of portoes.FERRAMENTAS_MANUAIS) {
            expect(ci).not.toContain(`npm run ${script}`);
        }
    });

    it("toda auditoria do package.json está numa das listas", () => {
        const auditorias = Object.keys(pacote.scripts).filter((s) =>
            s.startsWith("audit:"),
        );
        for (const a of auditorias) {
            expect([...todos, ...portoes.FERRAMENTAS_MANUAIS]).toContain(a);
        }
    });
});
