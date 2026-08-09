/**
 * Camadas — três invariantes sobre a atmosfera, sem linha de base.
 *
 *   node scripts/layers.mjs
 *
 * Do mesmo molde do `overflow.mjs`, e pelo mesmo motivo: o que roda no CI
 * precisa ser uma verdade que não exige regravação a cada mudança visual.
 *
 * Os três invariantes nasceram de defeitos reais deste repositório:
 *
 *   1. ORDEM DE PINTURA — `.ambient` era posicionada com z-index 0, e
 *      elemento posicionado pinta DEPOIS de bloco em fluxo. `.about` e
 *      `.work`, que não declaram `position`, ficavam submersas; as outras
 *      seis seções se salvavam por acidente, porque já eram `relative`
 *      por outro motivo. Com z-index negativo o problema deixa de existir
 *      para qualquer elemento, presente ou futuro — por isso o invariante
 *      cobra o z-index e não o posicionamento de cada seção.
 *
 *   2. TETO DE VIDRO — `backdrop-filter` tem custo fixo por elemento, e
 *      medindo a `/links` foram 6 elementos somando só 0,14 Mpx que
 *      derrubaram a taxa de quadros pela metade. O teto é de contagem,
 *      não de área, e conta só o que de fato PINTA.
 *
 *   3. COBERTURA DE PARTÍCULAS — a paralaxe empurrava as camadas para
 *      fora da janela e a atmosfera esvaziava conforme a página descia.
 *      Medido na home: 4 partículas no topo, ZERO no rodapé. Este é o
 *      invariante que teria pego aquilo em qualquer ponto do histórico.
 */

import {
    launchBrowser,
    newContext,
    startPreview,
    visit,
    ROUTES,
} from "./lib/browser.mjs";

/* Seis é o que existe hoje — os dois controles e os quatro cartões da
   `/links`, que são o desenho de referência do conceito e ficam como
   estão. O teto não é uma meta, é um limite: um sétimo elemento
   desfocado é decoração, não estrutura. E o custo do `backdrop-filter`
   é fixo POR ELEMENTO — na medição que derrubou a /links pela metade,
   os seis somavam só 0,14 Mpx. Por isso o teto é de contagem. */
const TETO_VIDRO = 6;
/* Abaixo disto o campo não está povoado e a razão de cobertura não diz
   nada. Ver o atraso negativo em AmbientBackground.tsx. */
const POVOAMENTO_MINIMO = 4;
/* Fração da contagem inicial que precisa sobreviver em qualquer posição
   de rolagem. Não é 100% porque as partículas piscam de propósito: cada
   uma passa parte do ciclo em opacidade zero. */
const COBERTURA_MINIMA = 0.6;
const POSICOES = [0, 0.2, 0.4, 0.6, 0.8, 1];

const preview = await startPreview();
const browser = await launchBrowser();
const falhas = [];
const ok = (m) => console.log(`  ok   ${m}`);
const falha = (m) => {
    falhas.push(m);
    console.log(`FALHA  ${m}`);
};

try {
    /* ── 1 e 2: ordem de pintura e teto de vidro ─────────────────── */
    for (const rota of Object.values(ROUTES)) {
        for (const largura of [1280, 390]) {
            const { ctx, page } = await newContext(browser, {
                baseUrl: preview.url,
                theme: "dark",
                viewport: { width: largura, height: 900 },
            });
            await visit(page, preview.url, rota);

            const r = await page.evaluate(() => {
                const amb = document.querySelector(".ambient");
                const z = amb ? getComputedStyle(amb).zIndex : null;

                /* Só o que pinta: oculto não custa e não deve contar. */
                const vidro = [...document.querySelectorAll("*")]
                    .filter((el) => {
                        const cs = getComputedStyle(el);
                        const bf = cs.backdropFilter || cs.webkitBackdropFilter;
                        if (!bf || bf === "none") return false;
                        if (cs.display === "none") return false;
                        if (cs.visibility === "hidden") return false;
                        if (parseFloat(cs.opacity) === 0) return false;
                        const b = el.getBoundingClientRect();
                        return (
                            b.width > 0 &&
                            b.height > 0 &&
                            b.bottom > 0 &&
                            b.top < innerHeight &&
                            b.right > 0 &&
                            b.left < innerWidth
                        );
                    })
                    .map((el) => {
                        const b = el.getBoundingClientRect();
                        return {
                            nome: String(el.className).split(" ")[0] || "?",
                            area: Math.round(b.width * b.height),
                        };
                    });

                return { z, vidro, janela: innerWidth * innerHeight };
            });

            const rotulo = `${rota} @ ${largura}px`;

            if (r.z === null || Number(r.z) >= 0)
                falha(
                    `${rotulo} — .ambient com z-index "${r.z}"; precisa ser negativo`,
                );
            else ok(`${rotulo} · atmosfera atrás de tudo (z-index ${r.z})`);

            const areaTotal = r.vidro.reduce((s, v) => s + v.area, 0);
            const maior = r.vidro.reduce((m, v) => Math.max(m, v.area), 0);
            if (r.vidro.length > TETO_VIDRO)
                falha(
                    `${rotulo} — ${r.vidro.length} elementos com backdrop-filter pintando (teto ${TETO_VIDRO}): ` +
                        r.vidro.map((v) => v.nome).join(", "),
                );
            else if (areaTotal > r.janela)
                falha(
                    `${rotulo} — área desfocada ${(areaTotal / r.janela).toFixed(2)}× a janela`,
                );
            else if (maior > r.janela * 0.25 && r.vidro.length > 1)
                falha(
                    `${rotulo} — mais de um desfoque e um deles ocupa ${Math.round((maior / r.janela) * 100)}% da janela`,
                );
            else
                ok(
                    `${rotulo} · ${r.vidro.length} desfoque(s), ${(areaTotal / r.janela).toFixed(2)}× a janela`,
                );

            await ctx.close();
        }
    }

    /* ── 3: cobertura de partículas ao longo da rolagem ──────────── */
    for (const rota of Object.values(ROUTES)) {
        const { ctx, page } = await newContext(browser, {
            baseUrl: preview.url,
            theme: "dark",
            /* Sem movimento reduzido: é justamente a atmosfera animada
               que se quer medir, e o `newContext` a desliga por padrão. */
            reducedMotion: "no-preference",
            viewport: { width: 1280, height: 900 },
        });
        await visit(page, preview.url, rota);
        await page.waitForTimeout(1500); /* o campo precisa estar povoado */

        const contar = () =>
            page.evaluate(
                () =>
                    [...document.querySelectorAll(".ambient__particle")].filter(
                        (el) => {
                            if (
                                parseFloat(getComputedStyle(el).opacity) <= 0.04
                            )
                                return false;
                            const b = el.getBoundingClientRect();
                            const cx = b.left + b.width / 2;
                            const cy = b.top + b.height / 2;
                            return (
                                cx > 0 &&
                                cx < innerWidth &&
                                cy > 0 &&
                                cy < innerHeight
                            );
                        },
                    ).length,
            );

        const alcance = await page.evaluate(
            () => document.body.scrollHeight - innerHeight,
        );
        const inicial = await contar();
        const piso = Math.max(1, Math.round(inicial * COBERTURA_MINIMA));
        let pior = inicial;
        let piorEm = 0;

        for (const f of POSICOES) {
            await page.evaluate(
                (y) => window.scrollTo({ top: y, behavior: "instant" }),
                Math.round(alcance * f),
            );
            await page.waitForTimeout(450);
            const n = await contar();
            if (n < pior) {
                pior = n;
                piorEm = Math.round(f * 100);
            }
        }

        const rotulo = `${rota} · cobertura`;
        if (inicial < POVOAMENTO_MINIMO)
            falha(
                `${rotulo} — só ${inicial} partícula(s) na tela; o campo não está povoado`,
            );
        else if (alcance < 200)
            ok(`${rotulo} · rota curta, sem rolagem a medir`);
        else if (pior < piso)
            falha(
                `${rotulo} — caiu de ${inicial} para ${pior} partículas a ${piorEm}% da página (piso ${piso})`,
            );
        else ok(`${rotulo} · ${inicial} no topo, nunca menos que ${pior}`);

        await ctx.close();
    }
} finally {
    await browser.close();
    await preview.stop();
}

console.log(
    falhas.length
        ? `\n${falhas.length} invariante(s) violado(s)`
        : "\ntodos os invariantes de camada respeitados",
);
process.exit(falhas.length ? 1 : 0);
