/**
 * Ícones do aplicativo desktop, a partir de uma fonte só.
 *
 *   node scripts/icones.mjs            gera tudo em apps/desktop/build
 *   node scripts/icones.mjs --check    falha se o commitado estiver velho
 *
 * ── Por que um script, e não arquivos soltos no repositório ──────────
 *
 * Cada plataforma quer o mesmo desenho num formato diferente: o Windows
 * quer um .ico com sete resoluções dentro, o macOS quer um .icns, o
 * Linux quer PNGs, e o instalador do Windows ainda quer um BMP para a
 * lateral do assistente. Mantidos à mão, os sete divergem no dia em que
 * alguém ajusta um e esquece os outros — e ninguém percebe, porque cada
 * um só aparece num lugar.
 *
 * Aqui a fonte é `apps/desktop/build/icon.svg`, e todo o resto é
 * derivado. O `--check` roda no CI e reprova um SVG editado sem
 * regenerar.
 *
 * ── Por que o Chromium desenha ───────────────────────────────────────
 *
 * O projeto não tem — e não vai ter — uma biblioteca de rasterização. O
 * Chromium já está aqui para as auditorias, e é o mesmo motor que
 * desenha o site: o ícone sai idêntico ao que o navegador mostraria.
 * Os pixels crus saem por canvas, que é o que permite escrever o BMP
 * sem precisar decodificar PNG.
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
const BUILD = resolve(raiz, "apps/desktop/build");
const PUBLICO = resolve(raiz, "apps/web/public");
const FONTE = join(BUILD, "icon.svg");

const conferir = process.argv.includes("--check");

/* As sete que o Windows lê de dentro de um .ico. Abaixo de 16 nada é
   exibido; acima de 256 o Explorer usa o de 256 e escala. */
const TAMANHOS_ICO = [16, 24, 32, 48, 64, 128, 256];

/* 1024 é o que o electron-builder pede para derivar o .icns do macOS
   sozinho — de lá ele tira as dez variantes que o formato exige. */
const TAMANHO_MESTRE = 1024;

/** Lateral do assistente do NSIS: BMP, 164x314, medida fixa do NSIS. */
const SIDEBAR = { largura: 164, altura: 314 };

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
 * pequenos — é o que o próprio electron-builder faz, e o que o Windows
 * lê desde o Vista.
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

/**
 * BMP de 24 bits a partir de pixels RGBA.
 *
 * O NSIS não lê PNG na lateral do assistente. E BMP não tem canal alfa
 * aqui, então a transparência é achatada contra o fundo escuro do tema
 * — que é justamente o fundo que a arte já usa.
 */
function montarBmp(rgba, largura, altura) {
    /* Cada linha é alinhada em múltiplo de 4 bytes. */
    const passo = Math.ceil((largura * 3) / 4) * 4;
    const pixels = Buffer.alloc(passo * altura, 0);

    for (let y = 0; y < altura; y++) {
        /* BMP guarda as linhas de baixo para cima. */
        const destino = (altura - 1 - y) * passo;
        for (let x = 0; x < largura; x++) {
            const o = (y * largura + x) * 4;
            const a = rgba[o + 3] / 255;
            const sobre = (c) => Math.round(c * a + 7 * (1 - a)); /* #070d19 */
            const d = destino + x * 3;
            pixels[d] = sobre(rgba[o + 2]); /* B */
            pixels[d + 1] = sobre(rgba[o + 1]); /* G */
            pixels[d + 2] = sobre(rgba[o]); /* R */
        }
    }

    const cabecalho = Buffer.alloc(54);
    cabecalho.write("BM", 0);
    cabecalho.writeUInt32LE(54 + pixels.length, 2);
    cabecalho.writeUInt32LE(54, 10); /* onde os pixels começam */
    cabecalho.writeUInt32LE(40, 14); /* tamanho do BITMAPINFOHEADER */
    cabecalho.writeInt32LE(largura, 18);
    cabecalho.writeInt32LE(altura, 22);
    cabecalho.writeUInt16LE(1, 26); /* planos */
    cabecalho.writeUInt16LE(24, 28); /* bits por pixel */
    cabecalho.writeUInt32LE(pixels.length, 34);
    return Buffer.concat([cabecalho, pixels]);
}

const svg = readFileSync(FONTE, "utf8");

/** Renderiza o SVG num quadro de tamanho dado e devolve o PNG. */
async function png(pagina, largura, altura, conteudo = svg, escala = 1) {
    await pagina.setViewportSize({ width: largura, height: altura });
    await pagina.setContent(
        /* `body > svg` e não `svg`: quando o conteúdo embrulha a marca
           num contêiner (a variante maskable, a lateral do instalador), é
           o contêiner que manda no tamanho, e uma regra solta forçaria o
           SVG de volta ao quadro inteiro. */
        `<style>html,body{margin:0;background:transparent}` +
            `body>svg{display:block;width:${largura * escala}px;height:${altura * escala}px}` +
            `div svg{display:block;width:100%;height:100%}</style>` +
            conteudo,
    );
    return pagina.screenshot({ omitBackground: true });
}

const digestSvg = createHash("sha256").update(svg).digest("hex");
const ASSINATURA = join(BUILD, "icones.lock");

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
        "icon.png",
        "icon.ico",
        "installerSidebar.bmp",
        "dmg-background.png",
        "web:apple-touch-icon.png",
        "web:icon-192.png",
        "web:icon-512.png",
        "web:favicon.ico",
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
    console.log("\nícones em dia com apps/desktop/build/icon.svg");
    process.exit(0);
}

const navegador = await chromium.launch({ executablePath: acharChromium() });
const pagina = await navegador.newPage();

const saidas = new Map();

try {
    /* ── PNG mestre: o que o electron-builder usa para Linux e macOS ── */
    saidas.set("icon.png", await png(pagina, TAMANHO_MESTRE, TAMANHO_MESTRE));

    /* ── .ico do Windows: executável, instalador e desinstalador ────── */
    const variantes = [];
    for (const t of TAMANHOS_ICO) {
        variantes.push({ tamanho: t, dados: await png(pagina, t, t) });
    }
    saidas.set("icon.ico", montarIco(variantes));

    /* ── Lateral do assistente do NSIS ──────────────────────────────
       A arte não é o ícone esticado: numa faixa vertical o quadrado
       ficaria deformado. É o fundo do tema com a marca centralizada em
       cima, que é como o assistente se parece com o resto do produto. */
    const lateral = `
      <div style="width:${SIDEBAR.largura}px;height:${SIDEBAR.altura}px;
                  background:linear-gradient(160deg,#131c30 0%,#0a1120 55%,#070d19 100%);
                  display:flex;align-items:center;justify-content:center">
        <div style="width:96px;height:96px">${svg}</div>
      </div>`;
    await pagina.setViewportSize({
        width: SIDEBAR.largura,
        height: SIDEBAR.altura,
    });
    await pagina.setContent(
        `<style>html,body{margin:0}svg{width:96px;height:96px;display:block}</style>${lateral}`,
    );
    const cru = await pagina.evaluate(
        async ([w, h]) => {
            /* Pixels crus por canvas: escrever o BMP direto evita ter de
           decodificar PNG em Node sem biblioteca. */
            const svgTexto = new XMLSerializer().serializeToString(
                document.querySelector("svg"),
            );
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            const grad = ctx.createLinearGradient(0, 0, w * 0.5, h);
            grad.addColorStop(0, "#131c30");
            grad.addColorStop(0.55, "#0a1120");
            grad.addColorStop(1, "#070d19");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            const img = new Image();
            img.src =
                "data:image/svg+xml;base64," +
                btoa(unescape(encodeURIComponent(svgTexto)));
            await img.decode();
            const lado = 96;
            ctx.drawImage(img, (w - lado) / 2, (h - lado) / 2 - 20, lado, lado);
            return Array.from(ctx.getImageData(0, 0, w, h).data);
        },
        [SIDEBAR.largura, SIDEBAR.altura],
    );
    saidas.set(
        "installerSidebar.bmp",
        montarBmp(Uint8Array.from(cru), SIDEBAR.largura, SIDEBAR.altura),
    );

    /* ── Fundo da janela do .dmg ────────────────────────────────────
       Equivalente macOS da lateral do NSIS. Só o gradiente da marca e
       o nome: a arte não posiciona nada, porque quem posiciona o ícone
       do app e o atalho de Aplicações é o electron-builder, e artwork
       com marcações fixas desalinha assim que essas posições mudam. */
    const DMG = { largura: 540, altura: 380 };
    saidas.set(
        "dmg-background.png",
        await png(
            pagina,
            DMG.largura,
            DMG.altura,
            `<div style="width:${DMG.largura}px;height:${DMG.altura}px;
                        background:linear-gradient(150deg,#131c30 0%,#0a1120 60%,#070d19 100%);
                        font-family:system-ui,sans-serif">
               <div style="position:absolute;left:24px;bottom:18px;
                           color:#64748b;font-size:12px;letter-spacing:.08em;
                           text-transform:uppercase">GCruz.dev</div>
             </div>`,
        ),
    );
    /* ── Ícones do site ─────────────────────────────────────────────
       O portfólio usava o avatar pessoal como ícone de PWA e de aba no
       iOS. A marca do produto passa a valer nos dois lugares, saindo do
       mesmo SVG — uma fonte, e não um arquivo por destino. */
    saidas.set("web:apple-touch-icon.png", await png(pagina, 180, 180));
    saidas.set("web:icon-192.png", await png(pagina, 192, 192));

    /* O manifest declara o de 512 como `purpose: "any maskable"`, e o
       Android recorta ícone maskable num círculo. Com a arte cheia até a
       borda, as pontas do "G" seriam cortadas. A zona segura do formato
       é o círculo central de 80%, então a marca entra a 66% do quadro
       sobre o fundo sólido do tema — nada essencial encosta na aresta. */
    saidas.set(
        "web:icon-512.png",
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

    const faviconPngs = [];
    for (const t of [16, 32, 48]) {
        faviconPngs.push({ tamanho: t, dados: await png(pagina, t, t) });
    }
    saidas.set("web:favicon.ico", montarIco(faviconPngs));
} finally {
    await navegador.close();
}

/* `web:` sai em apps/web/public; o resto, nos recursos de build do app. */
function caminhoDe(nome) {
    return nome.startsWith("web:")
        ? join(PUBLICO, nome.slice(4))
        : join(BUILD, nome);
}

{
    mkdirSync(BUILD, { recursive: true });
    for (const [nome, dados] of saidas) {
        writeFileSync(caminhoDe(nome), dados);
        console.log(`  ${String(dados.length).padStart(8)} B  ${nome}`);
    }
    /* A assinatura da fonte, para o --check saber se alguém editou o
       SVG e esqueceu de regenerar. */
    writeFileSync(ASSINATURA, `${digestSvg}\n`);
    console.log(`\n${saidas.size} arquivos gerados de icon.svg`);
}
