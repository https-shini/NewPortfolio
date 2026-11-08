import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PORTOES_ESTATICOS, PORTOES_NAVEGADOR } from "./portoes.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("Execute pela raiz com npm run verify.");
function npm(args, env = process.env) {
    console.log(`\nVerificando: npm ${args.join(" ")}\n`);
    const result = spawnSync(process.execPath, [npmCli, ...args], {
        cwd: root,
        env,
        stdio: "inherit",
    });
    if (result.error) throw result.error;
    if (result.status !== 0)
        throw new Error(`Verificação falhou: npm ${args.join(" ")}`);
}
try {
    for (const script of PORTOES_ESTATICOS) npm(["run", script]);
    npm(["audit", "--audit-level=low"]);
    if (process.argv.includes("--browser")) {
        const { startPreview } = await import("./lib/browser.mjs");
        const preview = await startPreview();
        try {
            const env = { ...process.env, BASE_URL: preview.url };
            for (const script of PORTOES_NAVEGADOR) npm(["run", script], env);
        } finally {
            await preview.stop();
        }
    }
    console.log(
        "\nTodas as verificações selecionadas foram aprovadas. Nenhum commit ou push foi executado.",
    );
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
}
