import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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
    for (const script of [
        "lint",
        "lint:api",
        "type-check",
        "type-check:api",
        "format:check",
        "test",
        "icones:check",
        "imagens:check",
        "changelog:check",
        "build",
        "csp:check",
        "audit:bundle",
    ])
        npm(["run", script]);
    npm(["audit", "--audit-level=low"]);
    if (process.argv.includes("--browser")) {
        const { startPreview } = await import("./lib/browser.mjs");
        const preview = await startPreview();
        try {
            const env = { ...process.env, BASE_URL: preview.url };
            for (const script of [
                "audit:a11y",
                "audit:overflow",
                "audit:layers",
                "audit:identity",
                "audit:release-notes",
                "audit:not-found",
                "audit:linkedin",
                "audit:codex",
                "audit:contato",
                "audit:modals",
            ])
                npm(["run", script], env);
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
