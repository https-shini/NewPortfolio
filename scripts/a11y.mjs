/**
 * Auditoria de acessibilidade — axe-core nas quatro rotas.
 *
 *   node scripts/a11y.mjs              4 rotas x 2 temas x 2 idiomas
 *   node scripts/a11y.mjs --json       saída legível por máquina
 *   node scripts/a11y.mjs --baseline   grava a contagem em docs/a11y-baseline.json
 *
 * Sai com código 1 se houver violação `serious` ou `critical`. As `moderate`
 * viram aviso: valem correção, não valem barrar uma entrega.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { launchBrowser, newContext, startPreview, visit, ROUTES } from "./lib/browser.mjs";

const require = createRequire(import.meta.url);
const AXE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const BLOQUEIA = new Set(["serious", "critical"]);

const asJson = process.argv.includes("--json");
const gravarBase = process.argv.includes("--baseline");
const log = (...a) => !asJson && console.log(...a);

const preview = await startPreview();
const browser = await launchBrowser();
const resultados = [];

try {
    for (const [nome, route] of Object.entries(ROUTES)) {
        for (const theme of ["dark", "light"]) {
            for (const lang of ["pt", "en"]) {
                const { ctx, page } = await newContext(browser, {
                    baseUrl: preview.url,
                    theme,
                    lang,
                    viewport: { width: 1280, height: 900 },
                });

                await visit(page, preview.url, route);
                await page.addScriptTag({ content: AXE });

                const violacoes = await page.evaluate(async (tags) => {
                    const r = await window.axe.run(document, {
                        runOnly: { type: "tag", values: tags },
                    });
                    return r.violations.map((v) => ({
                        id: v.id,
                        impact: v.impact,
                        nodes: v.nodes.length,
                        alvo: v.nodes[0]?.target?.join(" ") ?? "",
                        ajuda: v.help,
                    }));
                }, TAGS);

                /* O idioma declarado precisa bater com o renderizado — é o
                   critério 3.1.1, e o axe não pega quando o atributo existe
                   mas está errado. */
                const langDeclarado = await page.evaluate(
                    () => document.documentElement.lang,
                );

                resultados.push({
                    rota: nome,
                    route,
                    theme,
                    lang,
                    langDeclarado,
                    violacoes,
                });
                await ctx.close();
            }
        }
    }
} finally {
    await browser.close();
    await preview.stop();
}

/* ── Relatório ─────────────────────────────────────────────────── */

const bloqueantes = [];
const avisos = [];
const langErrado = [];

for (const r of resultados) {
    const rotulo = `${r.route} · ${r.theme} · ${r.lang}`;
    const graves = r.violacoes.filter((v) => BLOQUEIA.has(v.impact));
    const leves = r.violacoes.filter((v) => !BLOQUEIA.has(v.impact));

    if (graves.length) bloqueantes.push({ rotulo, violacoes: graves });
    if (leves.length) avisos.push({ rotulo, violacoes: leves });

    /* pt renderizado deve declarar pt-*, en deve declarar en-* */
    const esperado = r.lang === "pt" ? "pt" : "en";
    if (!r.langDeclarado?.toLowerCase().startsWith(esperado)) {
        langErrado.push(`${rotulo} → documento declara "${r.langDeclarado || "vazio"}"`);
    }

    log(
        `${graves.length ? "FALHA" : leves.length ? "aviso" : "  ok "}  ${rotulo}` +
            (r.violacoes.length
                ? `  ${r.violacoes.map((v) => `${v.id}(${v.impact},${v.nodes}x)`).join(" ")}`
                : ""),
    );
}

log("");
if (langErrado.length) {
    log(`FALHA  idioma declarado diverge do renderizado (WCAG 3.1.1):`);
    langErrado.forEach((l) => log(`         ${l}`));
    log("");
}

const totalViolacoes = resultados.reduce((n, r) => n + r.violacoes.length, 0);
const limpos = resultados.filter((r) => !r.violacoes.length).length;

log(`${limpos}/${resultados.length} combinações sem violação · ${totalViolacoes} violações no total`);
if (avisos.length) log(`${avisos.length} combinação(ões) com violação moderada — aviso, não barra`);

if (asJson) console.log(JSON.stringify(resultados, null, 2));

if (gravarBase) {
    const base = {
        gravadoEm: new Date().toISOString().slice(0, 10),
        combinacoes: resultados.length,
        semViolacao: limpos,
        totalViolacoes,
        porRegra: Object.entries(
            resultados
                .flatMap((r) => r.violacoes)
                .reduce((acc, v) => ({ ...acc, [v.id]: (acc[v.id] ?? 0) + 1 }), {}),
        )
            .sort((a, b) => b[1] - a[1])
            .map(([id, n]) => ({ id, ocorrencias: n })),
        idiomaDivergente: langErrado.length,
    };
    writeFileSync("docs/a11y-baseline.json", JSON.stringify(base, null, 2) + "\n");
    log(`\nlinha de base gravada em docs/a11y-baseline.json`);
}

process.exit(bloqueantes.length || langErrado.length ? 1 : 0);
