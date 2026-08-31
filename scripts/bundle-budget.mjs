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

const DIST_RAIZ = "apps/web/dist";
const DIST = join(DIST_RAIZ, "assets");

/* ── Por documento, e não por diretório ──────────────────────────────────
 *
 * Havia dois tetos somando TUDO em assets/js e assets/css. Fazia sentido
 * quando existia um documento só: a soma era o que qualquer visita
 * baixava. Com um documento por rota deixou de ser — a soma passou a
 * contar pedaços que nenhuma visita baixa junto, e a reprovar por causa
 * disso: o mesmo código, repartido em mais arquivos, comprime pior, e a
 * soma subiu 4,6 KB enquanto CADA rota ficava mais leve.
 *
 * Então o teto passa a medir o que o visitante paga até a primeira
 * pintura: o que o documento daquela rota referencia — script de entrada,
 * modulepreload e folhas. É a pergunta que o orçamento sempre quis fazer.
 *
 * Os limites mantêm a folga de ~15% sobre o medido, pelo motivo que este
 * arquivo já explicava: teto colado no valor de hoje dispara a cada
 * oscilação do minificador e ensina a ignorar o aviso.
 */
const TETOS_POR_DOCUMENTO = [
    { documento: "index.html", limite: 126 },
    { documento: "links.html", limite: 92 },
    { documento: "release-notes.html", limite: 94 },
];

/* O que não está em documento nenhum: modais, galeria, as páginas que o
   roteador busca sob demanda. Não entra na primeira pintura, mas cresce
   sem ninguém olhar se não tiver teto. */
const TETO_SOB_DEMANDA = 56;

const TETOS = [
    {
        nome: "vendor (react + react-dom)",
        limite: 50,
        alvo: (f) => f.nome.startsWith("vendor-"),
    },
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

/** Ativos que um documento referencia: entrada, modulepreload e folhas. */
function referenciasDe(documento) {
    const html = readFileSync(join(DIST_RAIZ, documento), "utf8");
    return new Set(
        [...html.matchAll(/(?:src|href)="\/assets\/(?:js|css)\/([^"]+)"/g)].map(
            (m) => m[1],
        ),
    );
}

const porDocumento = TETOS_POR_DOCUMENTO.map((teto) => {
    const refs = referenciasDe(teto.documento);
    const seus = arquivos.filter((f) => refs.has(f.nome));
    return {
        nome: `documento ${teto.documento}`,
        limite: teto.limite,
        total: seus.reduce((s, f) => s + f.gzip, 0),
        detalhe: `${seus.length} arquivos`,
    };
});

const referenciados = new Set(
    TETOS_POR_DOCUMENTO.flatMap((t) => [...referenciasDe(t.documento)]),
);
const sobDemanda = arquivos.filter((f) => !referenciados.has(f.nome));

for (const f of [...arquivos].sort((a, b) => b.gzip - a.gzip)) {
    console.log(`  ${f.gzip.toFixed(1).padStart(6)} KB gzip  ${f.nome}`);
}
console.log("");

let estourou = false;
const linhas = [
    ...porDocumento,
    {
        nome: "sob demanda (fora dos documentos)",
        limite: TETO_SOB_DEMANDA,
        total: sobDemanda.reduce((s, f) => s + f.gzip, 0),
        detalhe: `${sobDemanda.length} arquivos`,
    },
    ...TETOS.map((t) => ({
        nome: t.nome,
        limite: t.limite,
        total: arquivos.filter(t.alvo).reduce((s, f) => s + f.gzip, 0),
    })),
];

for (const teto of linhas) {
    const total = teto.total;
    const folga = teto.limite - total;
    const ok = total <= teto.limite;
    if (!ok) estourou = true;
    console.log(
        `${ok ? "  ok " : "FALHA"}  ${teto.nome.padEnd(34)} ` +
            `${total.toFixed(1).padStart(6)} KB / ${teto.limite} KB` +
            `  (${folga >= 0 ? "folga" : "excesso"} de ${Math.abs(folga).toFixed(1)} KB)` +
            (teto.detalhe ? `  · ${teto.detalhe}` : ""),
    );
}

process.exit(!soPrint && estourou ? 1 : 0);
