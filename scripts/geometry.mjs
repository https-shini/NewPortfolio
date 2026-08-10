/**
 * Diff de geometria — a caixa de cada elemento, antes e depois.
 *
 *   node scripts/geometry.mjs captura antes.json
 *   ...mexe no CSS...
 *   node scripts/geometry.mjs captura depois.json
 *   node scripts/geometry.mjs diff antes.json depois.json
 *
 * Foi o que provou que a conversão para mobile-first não mudou o layout
 * renderizado. Fica versionado como ferramenta manual, para refatoração
 * de CSS — no CI roda a asserção de zero-overflow, que não precisa de
 * linha de base e por isso não vira ruído.
 *
 * Por que não comparar capturas de tela: duas capturas do MESMO código já
 * diferiram em 41 quadros, porque o autoplay do carrossel e os contadores
 * do Sobre tornam o pixel instável. Hash não separa ruído de regressão, e
 * quando difere não diz o que difere.
 *
 * Aqui, para cada rota × largura × tema, colhe-se de todo elemento com
 * classe um par `caminho → "x,y,largura,altura"`. Uma refatoração que
 * preserva o layout produz o mapa idêntico: a caixa não depende de qual
 * slide está ativo nem do valor corrente de um contador.
 */

import { readFileSync, writeFileSync } from "node:fs";
import {
    launchBrowser,
    newContext,
    startPreview,
    ROUTES,
} from "./lib/browser.mjs";

const ROTAS = Object.values(ROUTES);
const TEMAS = ["dark", "light"];

/* Cada ponto da escala e seus dois vizinhos — é nos vizinhos que um
   limite trocado por engano (640 em vez de 641) aparece. */
const LARGURAS = [
    320, 375, 479, 480, 481, 559, 560, 561, 599, 600, 601, 639, 640, 641, 767,
    768, 769, 779, 780, 781, 879, 880, 881, 899, 900, 901, 1023, 1024, 1025,
    1099, 1100, 1101, 1280, 1440, 1920, 2560,
];

/* ── Coleta ─────────────────────────────────────────────────────── */

function colher() {
    /* Caminho estável: tag + primeira classe + índice entre os irmãos.
       A classe entra porque o índice sozinho muda de significado ao menor
       reordenamento; o índice entra porque a classe sozinha não distingue
       itens de uma lista. */
    const mapa = {};
    const caminhoDe = (el) => {
        const partes = [];
        let n = el;
        while (n && n !== document.body) {
            const pai = n.parentElement;
            const i = pai ? [...pai.children].indexOf(n) : 0;
            const cls =
                typeof n.className === "string" && n.className.trim()
                    ? "." + n.className.trim().split(/\s+/)[0]
                    : "";
            partes.unshift(`${n.tagName.toLowerCase()}${cls}[${i}]`);
            n = pai;
        }
        return partes.join(">");
    };

    for (const el of document.querySelectorAll("body *")) {
        const temClasse =
            typeof el.className === "string" && el.className.trim() !== "";
        if (!temClasse) continue;
        const r = el.getBoundingClientRect();
        const q = (v) => Math.round(v * 100) / 100;
        mapa[caminhoDe(el)] =
            `${q(r.x + window.scrollX)},${q(r.y + window.scrollY)},${q(r.width)},${q(r.height)}`;
    }
    return mapa;
}

/* ── Captura ────────────────────────────────────────────────────── */

async function capturar(destino) {
    if (!destino) throw new Error("informe o arquivo de destino");

    const preview = await startPreview();
    const browser = await launchBrowser();
    const saida = {};

    try {
        for (const tema of TEMAS) {
            /* newContext já força reducedMotion: sem isso o autoplay do
               carrossel corre e cada captura pega um slide diferente. */
            const { ctx, page } = await newContext(browser, {
                baseUrl: preview.url,
                theme: tema,
                lang: "pt",
                viewport: { width: 1280, height: 900 },
            });

            for (const rota of ROTAS) {
                await page.goto(`${preview.url}${rota}`, {
                    waitUntil: "domcontentloaded",
                });
                await page.waitForSelector("main, .links-page, .release-page", {
                    timeout: 25_000,
                });
                await page.evaluate(() => document.fonts.ready);
                /* 2s: o count-up do Sobre dura 1200ms e crava o alvo. */
                await page.waitForTimeout(2000);

                for (const w of LARGURAS) {
                    await page.setViewportSize({ width: w, height: 900 });
                    await page.evaluate(() => window.scrollTo(0, 0));
                    await page.waitForTimeout(260);
                    saida[`${tema}|${rota}|${w}`] = await page.evaluate(colher);
                }
                process.stderr.write(`  ${tema} ${rota}\n`);
            }
            await ctx.close();
        }
    } finally {
        await browser.close();
        await preview.stop();
    }

    writeFileSync(destino, JSON.stringify(saida));
    const total = Object.values(saida).reduce(
        (n, m) => n + Object.keys(m).length,
        0,
    );
    console.log(
        `capturado: ${Object.keys(saida).length} cenários, ${total} caixas → ${destino}`,
    );
}

/* ── Diff ───────────────────────────────────────────────────────── */

/* Tolerância de meio pixel.
   Duas capturas do MESMO código diferiram em 22 caixas de 92.820 — todas
   em texto, todas entre 0,02 e 0,1px. É ruído de medição do motor, não
   layout. Meio pixel é o limiar certo por dois motivos: está uma ordem de
   grandeza acima do maior ruído observado, e uma ordem de grandeza abaixo
   de qualquer diferença que um breakpoint possa causar — trocar o limite
   move a caixa em pixels inteiros, nunca em centésimos. Arredondar para
   inteiro seria pior: valores perto de .5 cairiam para lados opostos e
   inventariam diferença onde não há. */
const TOL = 0.5;

function equivalente(x, y) {
    if (x === y) return true;
    if (x === undefined || y === undefined) return false;
    const px = x.split(",").map(Number);
    const py = y.split(",").map(Number);
    return px.every((v, i) => Math.abs(v - py[i]) <= TOL);
}

function diff(aPath, bPath) {
    if (!aPath || !bPath) throw new Error("informe os dois arquivos");

    const a = JSON.parse(readFileSync(aPath, "utf8"));
    const b = JSON.parse(readFileSync(bPath, "utf8"));
    const cenarios = [...new Set([...Object.keys(a), ...Object.keys(b)])];

    let totalDif = 0;
    let maiorRuido = 0;
    const porCenario = [];

    for (const c of cenarios) {
        const ma = a[c] ?? {};
        const mb = b[c] ?? {};
        const chaves = [...new Set([...Object.keys(ma), ...Object.keys(mb)])];
        const difs = [];

        for (const k of chaves) {
            if (ma[k] === mb[k]) continue;
            if (equivalente(ma[k], mb[k])) {
                /* Dentro da tolerância: não é diferença, mas o maior valor
                   visto vai no relatório — se algum dia chegar perto do
                   limiar, é sinal de que o limiar mente. */
                const px = ma[k].split(",").map(Number);
                const py = mb[k].split(",").map(Number);
                maiorRuido = Math.max(
                    maiorRuido,
                    ...px.map((v, i) => Math.abs(v - py[i])),
                );
                continue;
            }
            difs.push(
                ma[k] === undefined
                    ? `  + ${k}  ${mb[k]}`
                    : mb[k] === undefined
                      ? `  - ${k}  ${ma[k]}`
                      : `  ~ ${k}\n      antes  ${ma[k]}\n      depois ${mb[k]}`,
            );
        }

        if (difs.length) {
            totalDif += difs.length;
            porCenario.push(`${c}  (${difs.length})\n${difs.join("\n")}`);
        }
    }

    const ruido = `maior variação sob tolerância: ${maiorRuido.toFixed(2)}px (limiar ${TOL}px)`;
    if (!totalDif) {
        console.log(
            `IDÊNTICO — ${cenarios.length} cenários, zero diferenças.\n${ruido}`,
        );
        return 0;
    }
    console.log(porCenario.join("\n\n"));
    console.log(
        `\n${totalDif} diferenças em ${porCenario.length} de ${cenarios.length} cenários.\n${ruido}`,
    );
    return 1;
}

/* ── CLI ────────────────────────────────────────────────────────── */

const [modo, p1, p2] = process.argv.slice(2);

if (modo === "captura") {
    await capturar(p1);
} else if (modo === "diff") {
    process.exitCode = diff(p1, p2);
} else {
    console.error(
        "uso:\n" +
            "  node scripts/geometry.mjs captura <saida.json>\n" +
            "  node scripts/geometry.mjs diff <antes.json> <depois.json>",
    );
    process.exitCode = 2;
}
