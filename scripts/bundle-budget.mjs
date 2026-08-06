/**
 * Orçamento de tamanho do bundle.
 *
 *   npm run build && node scripts/bundle-budget.mjs
 *   node scripts/bundle-budget.mjs --print   só mostra, não julga
 *
 * Os tetos têm folga de cerca de 15% sobre o tamanho medido quando foram
 * escritos. Isso é de propósito: um orçamento colado no valor atual
 * dispara a cada oscilação do minificador e ensina a ignorá-lo. O que ele
 * precisa pegar é tendência — a biblioteca que entrou, o chunk que
 * dobrou.
 *
 * O peso é consequência. A causa é a contagem de dependências de runtime,
 * vigiada por src/shared/config/dependencies.test.ts.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const DIST = "frontend/dist/assets";

const TETOS = [
    { nome: "JS total", limite: 125, alvo: (f) => f.tipo === "js" },
    { nome: "vendor (react + react-dom)", limite: 50, alvo: (f) => f.nome.startsWith("vendor-") },
    { nome: "CSS total", limite: 36, alvo: (f) => f.tipo === "css" },
];

function listar(dir, tipo) {
    const caminho = join(DIST, dir);
    try {
        return readdirSync(caminho)
            .filter((n) => n.endsWith(`.${tipo}`))
            .map((nome) => {
                const bruto = readFileSync(join(caminho, nome));
                return {
                    nome,
                    tipo,
                    kb: statSync(join(caminho, nome)).size / 1024,
                    gzip: gzipSync(bruto).length / 1024,
                };
            });
    } catch {
        throw new Error(
            `[bundle-budget] ${caminho} não existe. Rode 'npm run build' antes.`,
        );
    }
}

const arquivos = [...listar("js", "js"), ...listar("css", "css")];
const soPrint = process.argv.includes("--print");

for (const f of [...arquivos].sort((a, b) => b.gzip - a.gzip)) {
    console.log(`  ${f.gzip.toFixed(1).padStart(6)} KB gzip  ${f.nome}`);
}
console.log("");

let estourou = false;
for (const teto of TETOS) {
    const total = arquivos.filter(teto.alvo).reduce((s, f) => s + f.gzip, 0);
    const folga = teto.limite - total;
    const ok = total <= teto.limite;
    if (!ok) estourou = true;
    console.log(
        `${ok ? "  ok " : "FALHA"}  ${teto.nome.padEnd(28)} ` +
            `${total.toFixed(1).padStart(6)} KB / ${teto.limite} KB` +
            `  (${folga >= 0 ? "folga" : "excesso"} de ${Math.abs(folga).toFixed(1)} KB)`,
    );
}

process.exit(!soPrint && estourou ? 1 : 0);
