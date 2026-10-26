import { readdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const paths = ["apps/web/dist"];
if (!process.argv.includes("--dist-only")) {
    paths.push("node_modules");
    for (const entry of readdirSync(resolve(root, "apps"), {
        withFileTypes: true,
    })) {
        if (entry.isDirectory()) paths.push(`apps/${entry.name}/node_modules`);
    }
}
for (const path of paths) {
    rmSync(resolve(root, path), { recursive: true, force: true });
    console.log(`Removido artefato gerado: ${path}`);
}
