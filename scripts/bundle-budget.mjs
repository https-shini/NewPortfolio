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

const DIST = "apps/web/dist/assets";

const TETOS = [
    // Página técnica do Codex: ~5.7 KB gzip adicionais, carregados por rota.
    // DevHub (/projetos e /projetos/:nome): ~8.8 KB gzip adicionais, também
    // só na rota — o JS principal da home não cresceu (45.7 → 45.6 KB).
    // Teto refeito sobre 137.2 KB medidos, com a folga de ~10% de sempre.
    // Modal de projeto (galeria + documentação do README): ~3.0 KB gzip
    // num chunk lazy, baixado só ao abrir. Na home entram ~2 KB: chips
    // de tecnologia (catálogo + TechList) e o ícone do TypeScript, que o
    // Vite embute como data URI junto dos outros. Teto refeito sobre
    // 151.1 KB medidos, com ~10% de folga.
    { nome: "JS total", limite: 165, alvo: (f) => f.tipo === "js" },
    {
        nome: "vendor (react + react-dom)",
        limite: 50,
        alvo: (f) => f.nome.startsWith("vendor-"),
    },
    // DevHub: CSS próprio carregado só nas rotas dele. Com o catálogo
    // (filtros, chips, paginação), as capas compostas e a página do
    // projeto (números, abas, atividade, estrutura), o chunk lazy foi de
    // ~3.7 para 5.9 KB gzip; o CSS principal da home (22.1 KB) não muda
    // com isso. Teto refeito sobre 45.1 KB medidos, com ~10% de folga.
    { nome: "CSS total", limite: 50, alvo: (f) => f.tipo === "css" },
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
