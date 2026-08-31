/**
 * Variantes responsivas das fotos, a partir de uma fonte só.
 *
 *   node scripts/imagens.mjs            gera tudo em apps/web/src/assets/gerado
 *   node scripts/imagens.mjs --check    falha se o commitado estiver velho
 *
 * ── Por que existe ───────────────────────────────────────────────────
 *
 * A mesma foto aparecia em três lugares com três tamanhos muito
 * diferentes, e sempre no arquivo grande. O caso pior estava em
 * `/links`: `hero.webp`, 960×960 e 87 KiB, desenhada num avatar de
 * 134px. O PageSpeed mediu 86 KiB desperdiçados numa imagem `eager`, no
 * caminho crítico daquela página — 98% do arquivo.
 *
 * Tamanhos medidos no navegador, do menor ao maior viewport:
 *
 *   .linktree__avatar-img   134 → 148px
 *   .hero__avatar           200 → 380px
 *   .about__photo           286 → 478px
 *
 * As larguras abaixo cobrem esses usos até 3× de densidade. Elas não são
 * uma escala redonda: são as que caem logo acima das combinações reais de
 * tamanho × densidade. O emulador do PageSpeed usa 2,625×, e um passo mal
 * escolhido faz o navegador subir para a variante seguinte e desperdiçar
 * quase tanto quanto antes — foi o que a primeira medição mostrou, com o
 * avatar de 200px puxando a variante de 760.
 *
 * ── Por que gerar e commitar, em vez de gerar no build ───────────────
 *
 * A Vercel roda `npm install` e o build; ela não tem o binário do
 * Chromium do Playwright, que é instalado à parte. Gerar durante o
 * build simplesmente não roda lá. Então o derivado é commitado, e o
 * `--check` no CI reprova quem editar a foto sem regenerar — o mesmo
 * arranjo de `scripts/icones.mjs`.
 *
 * ── Por que o Chromium desenha ───────────────────────────────────────
 *
 * O projeto não tem — e não vai ter — biblioteca de rasterização. Uma
 * tentativa anterior com `sharp` foi revertida: as variantes ficaram
 * abaixo do `assetsInlineLimit` do Vite, viraram base64 dentro do JS e
 * estouraram o orçamento sem economizar um byte. O Chromium já está
 * aqui para as auditorias e é o mesmo motor que decodifica a imagem no
 * navegador do visitante.
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
const ASSETS = resolve(raiz, "apps/web/src/assets");
const SAIDA = join(ASSETS, "gerado");
const ASSINATURA = join(SAIDA, "imagens.lock");

const conferir = process.argv.includes("--check");

/**
 * Qualidade do WebP.
 *
 * Comparadas 0,72 · 0,80 · 0,86 lado a lado no tamanho de exibição: as
 * três são indistinguíveis do original. 0,80 fica como meio-termo, com
 * margem para a foto mudar sem precisar reavaliar a escala.
 */
const QUALIDADE = 0.8;

/** Fonte → larguras. Ver os tamanhos medidos no cabeçalho. */
const RECEITA = [
    { fonte: "hero.webp", larguras: [300, 420, 600, 960] },
    { fonte: "avatar.webp", larguras: [480, 620, 760] },
];

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

const nomeDe = (fonte, largura) =>
    `${fonte.replace(/\.webp$/, "")}-${largura}.webp`;

const esperados = RECEITA.flatMap(({ fonte, larguras }) =>
    larguras.map((l) => nomeDe(fonte, l)),
);

/* A assinatura cobre as fontes e a receita: trocar a foto, acrescentar
   uma largura ou mexer na qualidade invalida o commitado. */
const digest = createHash("sha256");
for (const { fonte } of RECEITA)
    digest.update(readFileSync(join(ASSETS, fonte)));
digest.update(JSON.stringify({ RECEITA, QUALIDADE }));
const assinatura = digest.digest("hex");

/* ── Conferência ─────────────────────────────────────────────────────
   NÃO redesenha. Dois Chromium de versões diferentes produzem bytes
   diferentes para os mesmos pixels, então comparar arquivo por arquivo
   reprovaria por causa do runner, e não da imagem. Confere o que
   importa: a assinatura das fontes bate com a da última geração, e
   todos os derivados estão no lugar. */
if (conferir) {
    let problemas = 0;
    const gravado = existsSync(ASSINATURA)
        ? readFileSync(ASSINATURA, "utf8").trim()
        : null;

    if (gravado !== assinatura) {
        problemas++;
        console.error(
            gravado
                ? `  DIVERGE  as fotos ou a receita mudaram desde a última geração\n` +
                      `           gravado ${gravado.slice(0, 12)} · atual ${assinatura.slice(0, 12)}`
                : "  AUSENTE  imagens.lock — nunca foi gerado",
        );
    } else {
        console.log(`  ok       fontes  ${assinatura.slice(0, 12)}`);
    }

    for (const nome of esperados) {
        if (!existsSync(join(SAIDA, nome))) {
            problemas++;
            console.error(`  AUSENTE  ${nome}`);
        } else {
            console.log(`  ok       ${nome}`);
        }
    }

    if (problemas) {
        console.error(
            `\n${problemas} problema(s) — rode \`npm run imagens\` e commite o resultado`,
        );
        process.exit(1);
    }
    console.log("\nvariantes em dia com as fotos de origem");
    process.exit(0);
}

/* ── Geração ─────────────────────────────────────────────────────── */
const saidas = new Map();
const navegador = await chromium.launch({ executablePath: acharChromium() });

try {
    const pagina = await navegador.newPage();
    await pagina.goto("about:blank");

    for (const { fonte, larguras } of RECEITA) {
        const b64 = readFileSync(join(ASSETS, fonte)).toString("base64");

        for (const largura of larguras) {
            const dados = await pagina.evaluate(
                async ([b64, largura, q]) => {
                    const img = new Image();
                    img.src = "data:image/webp;base64," + b64;
                    await img.decode();

                    const canvas = document.createElement("canvas");
                    canvas.width = largura;
                    canvas.height = Math.round(
                        (img.naturalHeight / img.naturalWidth) * largura,
                    );

                    const cx = canvas.getContext("2d");
                    cx.imageSmoothingQuality = "high";
                    cx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    return canvas.toDataURL("image/webp", q).split(",")[1];
                },
                [b64, largura, QUALIDADE],
            );

            saidas.set(nomeDe(fonte, largura), Buffer.from(dados, "base64"));
        }
    }
} finally {
    await navegador.close();
}

{
    mkdirSync(SAIDA, { recursive: true });
    for (const [nome, dados] of saidas) {
        writeFileSync(join(SAIDA, nome), dados);
        console.log(
            `  ${String((dados.length / 1024).toFixed(1)).padStart(6)} KiB  ${nome}`,
        );
    }
    writeFileSync(ASSINATURA, `${assinatura}\n`);
    console.log(`\n${saidas.size} variantes geradas`);
}
