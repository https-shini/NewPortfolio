// @vitest-environment node

import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { lastModified, RAIZ_DO_REPO } from "../../../config/lastModified";

/**
 * Este teste existe por causa de um defeito concreto, e não por zelo.
 *
 * A função morava no `vite.config.ts` e rodava o git em `apps/`, um
 * nível curto da raiz, porque usava `path.resolve(__dirname, "..")` com
 * um `__dirname` que já era `apps/web`. Os caminhos consultados são
 * relativos à raiz, então o git respondia vazio para todos e a função
 * devolvia `null` sem reclamar. Resultado medido no sitemap gerado: 7
 * de 20 URLs com `<lastmod>`, e as 7 eram as páginas de versão, cuja
 * data não vem do git. Nada reprovava, porque nada testava.
 *
 * O caso que guarda a regressão é o primeiro: a raiz tem de ser a raiz.
 */

/** O ambiente responde pelo git? Sem isso o caso normal não é mensurável. */
function temHistorico(): boolean {
    try {
        execFileSync("git", ["log", "-1", "--format=%cs"], {
            cwd: RAIZ_DO_REPO,
            stdio: ["ignore", "pipe", "ignore"],
        });
        return true;
    } catch {
        return false;
    }
}

describe("lastModified", () => {
    it("RAIZ_DO_REPO aponta para a raiz, não para apps/ nem apps/web/", () => {
        /* A verificação é estrutural de propósito: estes três só coexistem
           na raiz. Se a contagem de saltos do módulo mudar, este caso cai
           antes de o sitemap sair silenciosamente sem datas. */
        expect(existsSync(path.join(RAIZ_DO_REPO, "package.json"))).toBe(true);
        expect(existsSync(path.join(RAIZ_DO_REPO, "apps", "web"))).toBe(true);
        expect(existsSync(path.join(RAIZ_DO_REPO, "api"))).toBe(true);
        /* E não é um nível acima: a raiz do repositório declara workspaces. */
        expect(existsSync(path.join(RAIZ_DO_REPO, "vercel.json"))).toBe(true);
    });

    it.skipIf(!temHistorico())(
        "devolve a data do último commit de um caminho versionado",
        () => {
            /* `apps/web/src` é o diretório que mais muda no projeto; se o
               histórico disponível não o alcançar, nada alcança. */
            const data = lastModified(["apps/web/src"]);
            expect(data).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        },
    );

    it.skipIf(!temHistorico())(
        "o caminho mais recente entre vários é o que vale",
        () => {
            const umSo = lastModified(["apps/web/src/shared/lib"]);
            const comOutro = lastModified([
                "apps/web/src/shared/lib",
                "apps/web/src",
            ]);
            /* Nenhum dos dois é nulo num clone com histórico, e o conjunto
               maior nunca pode ser mais antigo que o subconjunto. */
            expect(umSo).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(comOutro).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect((comOutro as string) >= (umSo as string)).toBe(true);
        },
    );

    it("devolve null para caminho sem histórico, em vez de inventar data", () => {
        expect(lastModified(["apps/web/caminho/que/nunca/existiu"])).toBeNull();
    });

    it("devolve null quando a raiz não é um repositório", () => {
        /* O caso do tarball e do build fora de um clone. `os.tmpdir()` não
           é versionado, então o git falha e o catch responde. */
        const fora = path.join(path.sep, "tmp");
        expect(lastModified(["apps/web/src"], fora)).toBeNull();
    });
});
