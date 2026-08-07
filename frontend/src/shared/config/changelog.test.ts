import { describe, it } from "vitest";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

/**
 * O CHANGELOG.md é derivado de RELEASE_NOTES. Derivado só continua sendo
 * derivado enquanto alguém regenera — e ninguém regenera o que não avisa
 * quando fica para trás.
 *
 * Este teste roda o próprio gerador em modo de conferência. Acrescentar
 * uma versão sem rodar `npm run changelog` falha aqui, na suíte de
 * sempre, e não meses depois quando alguém reparar que o arquivo mente.
 */
describe("CHANGELOG.md", () => {
    it("está em dia com RELEASE_NOTES", () => {
        const raiz = resolve(process.cwd(), "..");
        try {
            execFileSync(
                process.execPath,
                [
                    "--experimental-strip-types",
                    "--no-warnings",
                    "scripts/changelog.mjs",
                    "--check",
                ],
                {
                    cwd: raiz,
                    encoding: "utf8",
                    stdio: ["ignore", "pipe", "pipe"],
                },
            );
        } catch (err) {
            const e = err as { stderr?: string };
            throw new Error(
                e.stderr?.trim() ||
                    "o gerador do changelog falhou sem explicar por quê",
            );
        }
    });
});
