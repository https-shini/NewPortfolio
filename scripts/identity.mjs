/**
 * Identidade visual — a trava que transforma "não mexa nisso" em asserção.
 *
 *   node scripts/identity.mjs             confere contra a base
 *   node scripts/identity.mjs --baseline  regrava a base
 *
 * Nasceu de uma restrição explícita: os componentes podiam ganhar
 * tratamento de vidro, mas **cor e formato tinham de ficar exatamente como
 * estavam**. Promessa disso não vale nada seis commits depois, então ela
 * virou verificação.
 *
 * O arranjo lê os valores COMPUTADOS de cada superfície — não o CSS
 * escrito — e falha se qualquer um divergir da base. Ler o computado é o
 * que importa: o defeito que se quer pegar é o de cascata, onde ninguém
 * editou a regra do cartão e mesmo assim a cor dele mudou.
 *
 * `box-shadow` é a única propriedade fora da comparação. É exatamente o
 * que temos permissão para somar, e é a razão de o arranjo existir: com
 * ela de fora, a base prova que TUDO o mais ficou parado.
 */

import { readFileSync, writeFileSync } from "node:fs";
import {
    launchBrowser,
    newContext,
    startPreview,
    visit,
    ROUTES,
} from "./lib/browser.mjs";

const BASE = new URL("../docs/identity-baseline.json", import.meta.url);

/**
 * Tudo o que define cor e formato. A ausência de `boxShadow` aqui é a
 * definição do que se pode mudar.
 */
const PROPRIEDADES = [
    "backgroundColor",
    "backgroundImage",
    "backdropFilter",
    "opacity",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "borderTopStyle",
    "borderTopColor",
    "borderRightColor",
    "borderBottomColor",
    "borderLeftColor",
    "borderTopLeftRadius",
    "borderTopRightRadius",
    "borderBottomRightRadius",
    "borderBottomLeftRadius",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "color",
    "fontSize",
    "fontWeight",
];

/* Um representante de cada família de superfície. Não é a lista de tudo —
   é a lista do que, se mudar sem querer, denuncia a mudança. */
const ALVOS = {
    [ROUTES.home]: [
        ".hero",
        ".about",
        ".career",
        ".formations",
        ".featured",
        ".work",
        ".rec",
        ".contact",
        ".spec-card",
        ".spec-card__icon",
        ".stat-card",
        ".about__objective",
        ".work-card",
        ".work-card__emoji",
        ".rec-card",
        ".career-aside__card",
        ".career-aside__tag",
        ".formation-card",
        ".arch-card",
        ".contact__cta-card",
        ".featured__gallery",
        ".featured__arrow",
        ".btn--primary",
        ".btn--outline",
        ".badge",
        ".header",
        ".header__ctrl",
        ".footer",
    ],
    /* `.linktree__ctrl` eram os controles fixos de idioma e tema, que
       saíram quando a página passou a montar a casca do site. Header e
       Footer entram no lugar: são novos nesta rota, e é justamente numa
       rota nova que um deles pode divergir sem ninguém notar. */
    [ROUTES.links]: [".linktree", ".link-card", ".header", ".footer"],
    [ROUTES.releaseNotes]: [".release-page", ".release-card"],
};

const TEMAS = ["dark", "light"];

const gravar = process.argv.includes("--baseline");

const preview = await startPreview();
const browser = await launchBrowser();
const atual = {};

try {
    for (const [rota, seletores] of Object.entries(ALVOS)) {
        for (const theme of TEMAS) {
            const { ctx, page } = await newContext(browser, {
                baseUrl: preview.url,
                theme,
                viewport: { width: 1280, height: 900 },
            });
            await visit(page, preview.url, rota);

            /* Cada superfície é trazida para a tela ANTES de ser lida.
               As seções abaixo da dobra usam `content-visibility: auto`
               (ver globals.css), e o navegador não computa o estilo de uma
               subárvore que está pulando — `getComputedStyle` ali devolve
               valor herdado de antes da cascata do tema, e a leitura sai
               errada. Foi assim que este arranjo passou aqui e reprovou no
               CI com `.arch-card` e `.featured__gallery` respondendo a cor
               do tema escuro na página clara.

               Rolar antes de medir não afrouxa nada: a pergunta é como a
               superfície APARECE, e uma superfície não renderizada não tem
               aparência. Vale com ou sem `content-visibility`. */
            const lido = await page.evaluate(
                async ([sels, props]) => {
                    const out = {};
                    const doisQuadros = () =>
                        new Promise((r) =>
                            requestAnimationFrame(() =>
                                requestAnimationFrame(r),
                            ),
                        );

                    for (const s of sels) {
                        /* Sempre do topo: o cabeçalho muda de aparência
                           quando a página rola (fundo, desfoque, borda), e
                           medi-lo depois de uma rolagem daria o estado
                           errado. Cada superfície começa do zero. */
                        window.scrollTo(0, 0);
                        await doisQuadros();

                        const el = document.querySelector(s);
                        if (!el) {
                            out[s] = "AUSENTE";
                            continue;
                        }

                        /* Rola só o que não está na tela. */
                        const r = el.getBoundingClientRect();
                        if (r.bottom < 0 || r.top > window.innerHeight) {
                            el.scrollIntoView({ block: "center" });
                            await doisQuadros();
                        }

                        const cs = getComputedStyle(el);
                        out[s] = props.map((p) => cs[p]).join(" | ");
                    }

                    window.scrollTo(0, 0);
                    return out;
                },
                [seletores, PROPRIEDADES],
            );

            atual[`${rota} · ${theme}`] = lido;
            await ctx.close();
        }
    }
} finally {
    await browser.close();
    await preview.stop();
}

if (gravar) {
    writeFileSync(BASE, JSON.stringify(atual, null, 2) + "\n");
    const total = Object.values(atual).reduce(
        (s, o) => s + Object.keys(o).length,
        0,
    );
    console.log(
        `base regravada — ${total} superfícies em ${Object.keys(atual).length} combinações`,
    );
    process.exit(0);
}

let base;
try {
    base = JSON.parse(readFileSync(BASE, "utf8"));
} catch {
    console.error(
        "Não há base gravada. Rode 'node scripts/identity.mjs --baseline' " +
            "ANTES de qualquer alteração — depois dela, a base já nasce contaminada.",
    );
    process.exit(1);
}

const diferencas = [];
let conferidas = 0;

for (const [cena, superficies] of Object.entries(atual)) {
    for (const [seletor, valor] of Object.entries(superficies)) {
        conferidas++;
        const antes = base[cena]?.[seletor];
        if (antes === undefined) {
            diferencas.push(`${cena} · ${seletor} — não existia na base`);
        } else if (antes !== valor) {
            /* Nomeia a propriedade exata: "mudou alguma coisa" não ajuda
               ninguém a decidir se foi intencional. */
            const a = antes.split(" | ");
            const b = valor.split(" | ");
            PROPRIEDADES.forEach((p, i) => {
                if (a[i] !== b[i])
                    diferencas.push(
                        `${cena} · ${seletor} · ${p}\n      antes: ${a[i]}\n      agora: ${b[i]}`,
                    );
            });
        }
    }
}

if (diferencas.length) {
    console.log("Identidade visual alterada:\n");
    diferencas.forEach((d) => console.log(`  ${d}`));
    console.log(
        `\n${diferencas.length} diferença(s) em ${conferidas} superfícies conferidas.`,
    );
    console.log(
        "Se a mudança for intencional, regrave a base com --baseline e explique no commit.",
    );
    process.exit(1);
}

console.log(
    `${conferidas} superfícies conferidas — cor, borda, raio, espaçamento e tipo intactos`,
);
