/**
 * Para onde vai um pedido que chega pelo protocolo `app://`.
 *
 * Mora fora do main.js porque é a única lógica do processo principal com
 * casos de borda de verdade — e porque testá-la exige apenas um caminho e
 * uma pergunta ao disco, não subir o Electron.
 *
 * São três destinos possíveis:
 *
 *   · `api`     — atravessa para as funções serverless, que continuam no
 *                 site; o app empacota a interface, não o backend;
 *   · `arquivo` — um arquivo que existe dentro do dist;
 *   · `indice`  — qualquer outra coisa, que é rota de SPA e vai para o
 *                 index.html, exatamente como as reescritas da Vercel.
 */

const path = require("node:path");
const fs = require("node:fs");

/**
 * @param {string} pathname  caminho pedido, já sem o esquema
 * @param {string} raizWeb   pasta do dist do site
 * @param {(caminho: string) => boolean} existeArquivo
 *        injetável só para teste; o padrão pergunta ao disco
 * @returns {{ tipo: "api" } | { tipo: "arquivo" | "indice", caminho: string }}
 */
function resolver(pathname, raizWeb, existeArquivo = arquivoExiste) {
    if (pathname.startsWith("/api/")) return { tipo: "api" };

    const relativo = decodeURIComponent(pathname).replace(/^\/+/, "");

    /* `path.resolve` normaliza `..` — sem isto, `app://local/../../etc`
       sairia da pasta do site e leria qualquer arquivo do disco. */
    const alvo = path.resolve(raizWeb, relativo);
    const dentro = alvo === raizWeb || alvo.startsWith(raizWeb + path.sep);

    /* A pergunta é "existe em disco?", e não "parece ter extensão?".
       `path.extname("/release-notes/v2.1.0")` devolve ".0": a rota de uma
       versão era classificada como pedido de arquivo, o arquivo não
       existia, e a página não carregava — só no app, e só ao recarregar
       estando nela. Perguntar ao disco não tem esse ponto cego. */
    if (dentro && existeArquivo(alvo))
        return { tipo: "arquivo", caminho: alvo };

    return { tipo: "indice", caminho: path.join(raizWeb, "index.html") };
}

function arquivoExiste(caminho) {
    try {
        return fs.statSync(caminho).isFile();
    } catch {
        return false;
    }
}

module.exports = { resolver };
