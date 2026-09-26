/**
 * Auditoria de acessibilidade — axe-core nas quatro rotas.
 *
 *   node scripts/a11y.mjs              4 rotas x 2 temas x 2 idiomas
 *   node scripts/a11y.mjs --json       saída legível por máquina
 *   node scripts/a11y.mjs --baseline   grava a contagem em docs/reference/a11y-baseline.json
 *
 * Duas portas, e elas pegam coisas diferentes.
 *
 * ABSOLUTA — sai com código 1 se houver violação `serious` ou `critical`, ou
 * se o idioma declarado divergir do renderizado. As `moderate` viram aviso:
 * valem correção, não valem barrar uma entrega.
 *
 * CONTRA A LINHA DE BASE — sai com código 1 se a leitura de hoje for pior que
 * a gravada em `docs/reference/a11y-baseline.json`. Existe porque a porta
 * absoluta tem um ponto cego: se uma rota sair do arranjo, este script mede 12
 * combinações em vez de 16 e PASSA, porque zero violação em 12 também é zero.
 * A contagem de combinações é justamente o que a base guarda.
 *
 * Melhora não barra — é reportada, com o pedido de regravar a base. Base
 * ausente barra, com a instrução de gravá-la ANTES de qualquer alteração:
 * depois dela, a base já nasce contaminada.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import {
    launchBrowser,
    newContext,
    startPreview,
    visit,
    ROUTES,
} from "./lib/browser.mjs";

const require = createRequire(import.meta.url);
const AXE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

/** A linha de base: gravada com --baseline, conferida em toda execução. */
const BASE = new URL("../docs/reference/a11y-baseline.json", import.meta.url);

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const BLOQUEIA = new Set(["serious", "critical"]);

const asJson = process.argv.includes("--json");
const gravarBase = process.argv.includes("--baseline");
const log = (...a) => !asJson && console.log(...a);

const preview = await startPreview();
const browser = await launchBrowser();
const resultados = [];

/* ── Os estados, e por que cada um está aqui ──────────────────────────
   O axe não abre nada por conta própria, e foi nos estados fechados que
   se esconderam os quatro defeitos do Header — o X que não fechava, o
   menu invisível sob prefers-reduced-motion, o foco que não voltava, o
   logotipo sobre o primeiro item. Abrir o modal à mão revelou outras duas
   violações reais que a auditoria não via.

   `abrir` recebe a página já visitada e deixa o estado montado. Devolver
   `false` significa "este estado não existe aqui" e a combinação é
   pulada, em vez de falhar: é o que permite o modal medir só a home.

   O menu vai nas quatro rotas porque o Header tem DUAS formas — com
   `isHome` verdadeiro ele observa a seção ativa e rola; falso, ele
   navega. Medir só a home cobriria metade do componente. */
/* O estado que NÃO está aqui, e não é esquecimento: "formulário de contato
   em erro". O ContactForm começa com `if (!FORM_ENDPOINT) return null`, e
   FORM_ENDPOINT vem de VITE_FORM_ENDPOINT em tempo de build.

   Essa variável não está configurada no projeto da Vercel — ele declara uma
   só, GITHUB_TOKEN. Então o formulário não existe em produção, e auditar o
   estado de erro dele seria medir uma tela que visitante nenhum alcança.

   Ele entra quando a #45 publicar `api/contact.ts` e a variável: aí o estado
   passa a existir, e este array ganha uma entrada. */
const ESTADOS = [
    {
        nome: "fechado",
        viewport: { width: 1280, height: 900 },
        abrir: null,
    },
    {
        /* 390x844 é um telefone real, e está abaixo dos 901px em que o
           `.header__hamburger` deixa de ser display:none (Header.css). Numa
           largura de desktop o gatilho não existe e não haveria o que
           abrir. */
        nome: "menu-aberto",
        viewport: { width: 390, height: 844 },
        async abrir(page) {
            await page.locator("#site-hamburger").click();
            await page.waitForSelector("#mobile-nav.is-open", {
                timeout: 8000,
            });
            /* O painel entra por transform; sob reducedMotion ele assenta
               na hora, mas o inert do fundo é aplicado num efeito. */
            await page.waitForTimeout(150);
            return true;
        },
    },
    {
        /* O cartão de recomendação É o botão (`<button class="rec-card">`),
           e o `tabIndex` controla quais estão alcançáveis — daí filtrar por
           tabindex="0" em vez de pegar qualquer um. Só a home monta o
           widget. */
        nome: "modal-aberto",
        viewport: { width: 1280, height: 900 },
        async abrir(page) {
            const gatilho = page.locator('.rec-card[tabindex="0"]').first();
            if (!(await gatilho.count())) return false;
            /* As seções abaixo da dobra usam content-visibility: auto e só
               existem depois de entrarem na tela. */
            await gatilho.scrollIntoViewIfNeeded();
            await gatilho.click();
            await page.waitForSelector(".modal-dialog", { timeout: 8000 });
            await page.waitForTimeout(150);
            return true;
        },
    },
];

try {
    for (const [nome, route] of Object.entries(ROUTES)) {
        for (const estado of ESTADOS) {
            for (const theme of ["dark", "light"]) {
                for (const lang of ["pt", "en"]) {
                    const { ctx, page } = await newContext(browser, {
                        baseUrl: preview.url,
                        theme,
                        lang,
                        viewport: estado.viewport,
                    });

                    await visit(page, preview.url, route);

                    if (estado.abrir && !(await estado.abrir(page))) {
                        await ctx.close();
                        continue;
                    }

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

                    /* O idioma declarado precisa bater com o renderizado — é
                       o critério 3.1.1, e o axe não pega quando o atributo
                       existe mas está errado. */
                    const langDeclarado = await page.evaluate(
                        () => document.documentElement.lang,
                    );

                    resultados.push({
                        rota: nome,
                        route,
                        estado: estado.nome,
                        theme,
                        lang,
                        langDeclarado,
                        violacoes,
                    });
                    await ctx.close();
                }
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
    const rotulo = `${r.route} · ${r.estado} · ${r.theme} · ${r.lang}`;
    const graves = r.violacoes.filter((v) => BLOQUEIA.has(v.impact));
    const leves = r.violacoes.filter((v) => !BLOQUEIA.has(v.impact));

    if (graves.length) bloqueantes.push({ rotulo, violacoes: graves });
    if (leves.length) avisos.push({ rotulo, violacoes: leves });

    /* pt renderizado deve declarar pt-*, en deve declarar en-* */
    const esperado = r.lang === "pt" ? "pt" : "en";
    if (!r.langDeclarado?.toLowerCase().startsWith(esperado)) {
        langErrado.push(
            `${rotulo} → documento declara "${r.langDeclarado || "vazio"}"`,
        );
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

log(
    `${limpos}/${resultados.length} combinações sem violação · ${totalViolacoes} violações no total`,
);
if (avisos.length)
    log(
        `${avisos.length} combinação(ões) com violação moderada — aviso, não barra`,
    );

if (asJson) console.log(JSON.stringify(resultados, null, 2));

/* ── Porta contra a linha de base ────────────────────────────────────────
   Só regressão barra. Expansão legítima — uma rota nova muda a contagem de
   combinações para cima — é reportada, não reprovada, com o pedido de
   regravar. Ver o cabeçalho para o ponto cego que isto cobre. */
const regressoes = [];
const desatualizada = [];

if (!gravarBase) {
    let base;
    try {
        base = JSON.parse(readFileSync(BASE, "utf8"));
    } catch {
        console.error(
            "\nFALHA  não há linha de base em docs/reference/a11y-baseline.json.\n" +
                "       Rode 'node scripts/a11y.mjs --baseline' ANTES de qualquer\n" +
                "       alteração — depois dela, a base já nasce contaminada.",
        );
        process.exit(1);
    }

    const compara = (rotulo, hoje, gravado, piorQuando) => {
        if (hoje === gravado) return;
        const frase = `${rotulo}: base ${gravado}, hoje ${hoje}`;
        (piorQuando(hoje, gravado) ? regressoes : desatualizada).push(frase);
    };

    compara(
        "combinações medidas",
        resultados.length,
        base.combinacoes,
        (h, g) => h < g,
    );
    compara(
        "violações no total",
        totalViolacoes,
        base.totalViolacoes,
        (h, g) => h > g,
    );
    compara(
        "combinações sem violação",
        limpos,
        base.semViolacao,
        (h, g) => h < g,
    );
    compara(
        "idioma divergente",
        langErrado.length,
        base.idiomaDivergente,
        (h, g) => h > g,
    );

    if (regressoes.length) {
        log("");
        log(
            "FALHA  pior que a linha de base gravada em " +
                base.gravadoEm +
                ":",
        );
        regressoes.forEach((r) => log(`         ${r}`));
    }
    if (desatualizada.length) {
        log("");
        log(
            `aviso  melhor que a base de ${base.gravadoEm} — regrave com --baseline:`,
        );
        desatualizada.forEach((r) => log(`         ${r}`));
    }
    if (!regressoes.length && !desatualizada.length) {
        log(`base de ${base.gravadoEm} conferida — nenhuma diferença`);
    }
}

if (gravarBase) {
    const base = {
        gravadoEm: new Date().toISOString().slice(0, 10),
        combinacoes: resultados.length,
        semViolacao: limpos,
        totalViolacoes,
        porRegra: Object.entries(
            resultados
                .flatMap((r) => r.violacoes)
                .reduce(
                    (acc, v) => ({ ...acc, [v.id]: (acc[v.id] ?? 0) + 1 }),
                    {},
                ),
        )
            .sort((a, b) => b[1] - a[1])
            .map(([id, n]) => ({ id, ocorrencias: n })),
        idiomaDivergente: langErrado.length,
    };
    writeFileSync(BASE, JSON.stringify(base, null, 2) + "\n");
    log(`\nlinha de base gravada em docs/reference/a11y-baseline.json`);
}

process.exit(
    bloqueantes.length || langErrado.length || regressoes.length ? 1 : 0,
);
