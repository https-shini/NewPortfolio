/**
 * Ícones do site, a partir de uma fonte só.
 *
 *   node scripts/icones.mjs            gera tudo em apps/web/public
 *   node scripts/icones.mjs --check    falha se o commitado estiver velho
 *
 * ── Por que um script, e não arquivos soltos no repositório ──────────
 *
 * A mesma marca precisa sair em quatro formatos: um .ico com três
 * resoluções para a aba, dois PNG para instalar como app e o
 * apple-touch-icon do iOS. Mantidos à mão, divergem no dia em que
 * alguém ajusta um e esquece os outros — e ninguém percebe, porque cada
 * um só aparece num lugar.
 *
 * A fonte é `scripts/marca/icon.svg`, e o resto é derivado. O `--check`
 * roda no CI e reprova uma marca editada sem regenerar.
 *
 * Este script já gerou também os ícones do aplicativo desktop (.ico de
 * sete resoluções, BMP do instalador NSIS, fundo do .dmg). Essa parte
 * saiu junto com o app; o histórico guarda, se um dia voltar.
 *
 * ── Por que o Chromium desenha ───────────────────────────────────────
 *
 * O projeto não tem — e não vai ter — uma biblioteca de rasterização. O
 * Chromium já está aqui para as auditorias, e é o mesmo motor que
 * desenha o site: o ícone sai idêntico ao que o navegador mostraria.
 */

import {
    readFileSync,
    writeFileSync,
    mkdirSync,
    existsSync,
    readdirSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MARCA = resolve(raiz, "scripts/marca");
const PUBLICO = resolve(raiz, "apps/web/public");
const FONTE = join(MARCA, "icon.svg");

const conferir = process.argv.includes("--check");

/* As três que um favicon.ico precisa cobrir: a aba, a barra de
   favoritos e o atalho de área de trabalho. */
const TAMANHOS_FAVICON = [16, 32, 48];

function acharChromium() {
    if (process.env.PW_CHROMIUM_PATH) return process.env.PW_CHROMIUM_PATH;
    const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
    if (base && existsSync(base)) {
        const achados = readdirSync(base)
            .filter((d) => d.startsWith("chromium-"))
            .sort()
            .reverse()
            .map((d) => join(base, d, "chrome-linux", "chrome"))
            .filter(existsSync);
        if (achados.length) return achados[0];
    }
    return undefined;
}

/**
 * Monta um .ico a partir dos PNGs já renderizados.
 *
 * O formato é um cabeçalho de 6 bytes, uma entrada de 16 por imagem e
 * os arquivos em seguida. As entradas guardam PNG mesmo nos tamanhos
 * pequenos, que é o que o Windows lê desde o Vista.
 */
function montarIco(pngs) {
    const cabecalho = Buffer.alloc(6);
    cabecalho.writeUInt16LE(0, 0); /* reservado */
    cabecalho.writeUInt16LE(1, 2); /* 1 = ícone */
    cabecalho.writeUInt16LE(pngs.length, 4);

    const entradas = Buffer.alloc(16 * pngs.length);
    let deslocamento = 6 + entradas.length;

    pngs.forEach(({ tamanho, dados }, i) => {
        const e = i * 16;
        /* 0 significa 256: o campo tem um byte só. */
        entradas.writeUInt8(tamanho >= 256 ? 0 : tamanho, e);
        entradas.writeUInt8(tamanho >= 256 ? 0 : tamanho, e + 1);
        entradas.writeUInt8(0, e + 2); /* sem paleta */
        entradas.writeUInt8(0, e + 3); /* reservado */
        entradas.writeUInt16LE(1, e + 4); /* planos */
        entradas.writeUInt16LE(32, e + 6); /* bits por pixel */
        entradas.writeUInt32LE(dados.length, e + 8);
        entradas.writeUInt32LE(deslocamento, e + 12);
        deslocamento += dados.length;
    });

    return Buffer.concat([cabecalho, entradas, ...pngs.map((p) => p.dados)]);
}

const svg = readFileSync(FONTE, "utf8");

/* ── Variante mínima para os tamanhos de aba ─────────────────────────
   A 16px o <gc/> inteiro são cinco glifos em três pixels cada: vira
   ruído. A análise da marca já previa a degradação — abaixo de um
   limiar, ficam só as duas letras, no peso 700, ocupando o quadro. O
   crimson dos colchetes volta a partir de 48px, onde há pixel para ele.
   O limiar de 32 foi decidido olhando o render, não por palpite. */
const LIMIAR_COMPACTO = 32;
const svgMinimo = svg.replace(
    /<text[\s\S]*?<\/text>/,
    `<text x="512" y="512" text-anchor="middle" dominant-baseline="central"
        font-family="'JetBrains Mono', monospace" font-weight="700"
        font-size="520" letter-spacing="-30"><tspan fill="#f8fafc">gc</tspan></text>`,
);

/** O desenho certo para um dado tamanho de saída. */
const svgPara = (tamanho) => (tamanho <= LIMIAR_COMPACTO ? svgMinimo : svg);

/* A marca é texto em JetBrains Mono 700, e a máquina que renderiza não
   tem a fonte instalada — sem isto o Chromium cairia num monospace de
   sistema e o ícone commitado dependeria de onde foi gerado. O woff2
   mora em build/ como ASSET (22 KB, sem entrada em package.json) e
   entra na página como data URI. */
const FONTE_MONO = join(MARCA, "JetBrainsMono-700.woff2");
const ESTILO_FONTE =
    `@font-face{font-family:'JetBrains Mono';font-weight:700;` +
    `src:url(data:font/woff2;base64,${readFileSync(FONTE_MONO).toString("base64")}) format('woff2')}`;

/** Renderiza o SVG num quadro de tamanho dado e devolve o PNG. */
async function png(pagina, largura, altura, conteudo = svg, escala = 1) {
    await pagina.setViewportSize({ width: largura, height: altura });
    await pagina.setContent(
        /* `body > svg` e não `svg`: quando o conteúdo embrulha a marca
           num contêiner (a variante maskable, a lateral do instalador), é
           o contêiner que manda no tamanho, e uma regra solta forçaria o
           SVG de volta ao quadro inteiro. */
        `<style>${ESTILO_FONTE}html,body{margin:0;background:transparent}` +
            `body>svg{display:block;width:${largura * escala}px;height:${altura * escala}px}` +
            `div svg{display:block;width:100%;height:100%}</style>` +
            conteudo,
    );
    /* Sem esta espera a captura corre contra o parse do woff2 e o texto
       sai na fonte reserva — exatamente o que o embed evita. */
    await pagina.evaluate(() => document.fonts.ready);
    return pagina.screenshot({ omitBackground: true });
}

const digestSvg = createHash("sha256")
    .update(svg)
    .update(readFileSync(FONTE_MONO))
    .digest("hex");
const ASSINATURA = join(MARCA, "icones.lock");

/* ── Conferência ─────────────────────────────────────────────────────
   NÃO renderiza. Dois Chromium de versões diferentes produzem bytes
   diferentes para os mesmos pixels, então comparar arquivo por arquivo
   reprovaria por causa do runner, não do desenho — um gate que falha
   sozinho é pior que gate nenhum.

   O que se confere é o que interessa: a assinatura do SVG gravada na
   última geração ainda bate com o SVG de hoje, e todos os derivados
   estão no lugar. Editar a fonte sem regenerar é exatamente o que
   escapa da revisão, e é isto que pega. */
if (conferir) {
    const esperados = [
        "apple-touch-icon.png",
        "icon-192.png",
        "icon-512.png",
        "favicon.ico",
    ];

    let problemas = 0;
    const gravado = existsSync(ASSINATURA)
        ? readFileSync(ASSINATURA, "utf8").trim()
        : null;

    if (gravado !== digestSvg) {
        problemas++;
        console.error(
            gravado
                ? `  DIVERGE  icon.svg mudou desde a última geração\n` +
                      `           gravado ${gravado.slice(0, 12)} · atual ${digestSvg.slice(0, 12)}`
                : "  AUSENTE  icones.lock — nunca foi gerado",
        );
    } else {
        console.log(`  ok       icon.svg  ${digestSvg.slice(0, 12)}`);
    }

    for (const nome of esperados) {
        const caminho = caminhoDe(nome);
        if (!existsSync(caminho)) {
            problemas++;
            console.error(`  AUSENTE  ${nome}`);
        } else {
            console.log(`  ok       ${nome}`);
        }
    }

    if (problemas) {
        console.error(
            `\n${problemas} problema(s). Rode 'npm run icones' e commite o resultado.`,
        );
        process.exit(1);
    }
    console.log("\nícones em dia com scripts/marca/icon.svg");
    process.exit(0);
}

const navegador = await chromium.launch({ executablePath: acharChromium() });
const pagina = await navegador.newPage();

const saidas = new Map();

try {
    /* ── iOS e instalação como app ──────────────────────────────────── */
    saidas.set("apple-touch-icon.png", await png(pagina, 180, 180));
    saidas.set("icon-192.png", await png(pagina, 192, 192));

    /* O manifest declara o de 512 como `purpose: "any maskable"`, e o
       Android recorta ícone maskable num círculo. Com a arte cheia até a
       borda, as pontas do desenho seriam cortadas. A zona segura do
       formato é o círculo central de 80%, então a marca entra a 66% do
       quadro sobre o fundo sólido do tema. */
    saidas.set(
        "icon-512.png",
        await png(
            pagina,
            512,
            512,
            `<div style="width:512px;height:512px;background:#070d19;
                        display:flex;align-items:center;justify-content:center">
               <div style="width:338px;height:338px">${svg}</div>
             </div>`,
        ),
    );

    /* ── favicon.ico, com as três resoluções da aba ─────────────────── */
    const faviconPngs = [];
    for (const t of TAMANHOS_FAVICON) {
        faviconPngs.push({
            tamanho: t,
            dados: await png(pagina, t, t, svgPara(t)),
        });
    }
    saidas.set("favicon.ico", montarIco(faviconPngs));
} finally {
    await navegador.close();
}

/* Declaração, e não `const`: o bloco do `--check` roda antes deste
   ponto do arquivo, e uma arrow em `const` não é içada. */
/** Tudo sai em apps/web/public. */
function caminhoDe(nome) {
    return join(PUBLICO, nome);
}

{
    mkdirSync(PUBLICO, { recursive: true });
    for (const [nome, dados] of saidas) {
        writeFileSync(caminhoDe(nome), dados);
        console.log(`  ${String(dados.length).padStart(8)} B  ${nome}`);
    }
    /* A assinatura da fonte, para o --check saber se alguém editou o
       SVG e esqueceu de regenerar. */
    writeFileSync(ASSINATURA, `${digestSvg}\n`);
    console.log(`\n${saidas.size} arquivos gerados de icon.svg`);
}
