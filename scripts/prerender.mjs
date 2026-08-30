/**
 * Pré-renderização da home — o HTML sai pronto do build.
 *
 *   node scripts/prerender.mjs        # roda no fim de `npm run build`
 *
 * O `index.html` publicado trazia `<div id="root"></div>` e mais nada: a
 * primeira pintura esperava ~94 KB gzip de JavaScript baixarem e
 * executarem. Medido em produção pelo PageSpeed: 0,7s de FCP num link
 * rápido, 2,9s num aparelho modesto com 4G lento — com TBT de 20ms e CLS
 * zero, ou seja, o problema era só QUANDO o primeiro pixel aparecia.
 *
 * Aqui a mesma árvore de componentes é renderizada em Node e injetada no
 * `#root`. O cliente hidrata em vez de montar (ver src/main.tsx).
 *
 * Duas etapas, e a primeira é o motivo de isto ser um script e não um
 * plugin em closeBundle: para rodar os componentes em Node é preciso um
 * build de SSR, e disparar `vite build` de dentro de um plugin do próprio
 * `vite build` reentra na configuração. Separado, cada build é um build.
 */

import { execFileSync } from "node:child_process";
import { readFile, writeFile, rm } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const web = resolve(raiz, "apps/web");
const saidaSSR = resolve(web, ".prerender");
const indexHtml = resolve(web, "dist/index.html");

/* O marcador precisa ser exatamente o que o build emite. Se o index.html
   mudar e este alvo não existir mais, é melhor falhar alto do que publicar
   um HTML vazio achando que deu certo. */
const ALVO = '<div id="root"></div>';

console.log("Pré-renderização · build de SSR");
execFileSync(
    "npx",
    [
        "vite",
        "build",
        "--ssr",
        "src/entry-server.tsx",
        "--outDir",
        ".prerender",
        "--logLevel",
        "warn",
    ],
    { cwd: web, stdio: "inherit" },
);

/* O renderizador de servidor do React 18 não conhece `fetchPriority` e
   avisa, com pilha inteira, a cada build. O atributo está certo para o
   cliente (é assim que o React 18.3 o tipa e o emite) e o HTML gerado só
   deixa de trazê-lo — o navegador o recebe na hidratação. Silenciado por
   igualdade exata: qualquer outro aviso continua aparecendo. */
const erroOriginal = console.error;
console.error = (...args) => {
    /* O React formata o aviso com `%s`, então a checagem é em duas partes:
       o molde da mensagem e o nome da prop entre os argumentos. */
    const molde = typeof args[0] === "string" ? args[0] : "";
    if (
        molde.includes("does not recognize the") &&
        args.some((a) => a === "fetchPriority")
    ) {
        return;
    }
    erroOriginal(...args);
};

try {
    const modulo = await import(
        pathToFileURL(resolve(saidaSSR, "entry-server.js")).href
    );

    const html = await readFile(indexHtml, "utf8");
    if (!html.includes(ALVO)) {
        throw new Error(
            `index.html não contém ${ALVO} — o alvo da injeção mudou.`,
        );
    }

    /* A casca sem pré-renderização, para as outras rotas.

       O HTML gerado é o da HOME. Numa aplicação de página única toda rota
       cai no mesmo index.html, e sem isto quem abrisse /links receberia a
       home pintada e veria o React trocá-la — conteúdo errado na tela por
       alguns instantes, justamente em quem chega de um link na bio.

       Com este arquivo, /links e /release-notes voltam a receber a casca
       vazia de sempre (ver as reescritas em vercel.json).

       Vale em produção, onde a Vercel aplica as reescritas. Um servidor
       estático de arranjo (`serve -s`, que o CI usa) manda tudo para o
       index.html e ignora isso — ali as outras rotas recebem o HTML da
       home, e a conferência em src/main.tsx as faz montar do zero. Correto,
       porém mais lento do que o que é publicado: as medições locais de FCP
       de /links e /release-notes são pessimistas por esse motivo. */
    await writeFile(resolve(web, "dist/app.html"), html, "utf8");

    const corpo = modulo.render();
    if (!corpo || corpo.length < 500) {
        throw new Error(
            `render() devolveu ${corpo?.length ?? 0} caracteres; ` +
                `esperado o conteúdo da home.`,
        );
    }

    /* `data-prerendered` diz de qual rota é este HTML. O cliente confere
       antes de hidratar (ver src/main.tsx): se um servidor entregar este
       arquivo em outra rota, ele monta do zero em vez de tentar casar duas
       páginas diferentes. É a rede de segurança para quando a reescrita
       não estiver no lugar — num host novo, num preview, num `serve -s`. */
    await writeFile(
        indexHtml,
        html.replace(
            ALVO,
            `<div id="root" data-prerendered="/" data-lang="pt">${corpo}</div>`,
        ),
        "utf8",
    );

    const kb = (corpo.length / 1024).toFixed(1);
    console.log(`Pré-renderização · ${kb} KB de HTML injetados no #root`);
} finally {
    console.error = erroOriginal;
    /* A saída de SSR é intermediária: não vai para dist/ e não é publicada. */
    await rm(saidaSSR, { recursive: true, force: true });
}
