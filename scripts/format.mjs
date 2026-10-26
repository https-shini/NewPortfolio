import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(resolve(root, "apps/web/package.json"));
const cli = resolve(
    dirname(require.resolve("prettier/package.json")),
    "bin/prettier.cjs",
);
let files = [];
try {
    files = execFileSync("git", ["ls-files", "-z"], {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
    })
        .split("\0")
        .filter((file) => file && existsSync(resolve(root, file)));
} catch {
    // O ZIP contém a mesma aplicação, mas não leva o histórico .git.
}
if (!files.length) {
    const allowed = new Set([
        "api",
        "apps",
        "docs",
        "scripts",
        ".github",
        ".husky",
    ]);
    const excluded = new Set([
        "node_modules",
        "dist",
        "coverage",
        ".git",
        "build",
        "release",
        "android",
        "ios",
        ".maestri",
    ]);
    const walk = (dir, prefix = "") => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
            if (entry.isSymbolicLink() || excluded.has(entry.name)) continue;
            const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
            if (entry.isDirectory()) {
                if (prefix || allowed.has(entry.name))
                    walk(resolve(dir, entry.name), relative);
            } else files.push(relative);
        }
    };
    walk(root);
}
const mode = process.argv.includes("--write") ? "--write" : "--check";
for (let i = 0; i < files.length; i += 100) {
    const result = spawnSync(
        process.execPath,
        [cli, mode, "--ignore-unknown", ...files.slice(i, i + 100)],
        { cwd: root, stdio: "inherit" },
    );
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
}
