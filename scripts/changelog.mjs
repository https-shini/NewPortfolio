/**
 * Gera o CHANGELOG.md a partir de RELEASE_NOTES.
 *
 *   node scripts/changelog.mjs           # escreve
 *   node scripts/changelog.mjs --check   # só confere; sai 1 se divergir
 *
 * O arquivo é derivado, não uma segunda fonte de verdade. Um changelog
 * escrito à mão ao lado de uma lista estruturada vira duas versões da
 * mesma história, e a que envelhece é sempre a que ninguém lê ao editar.
 *
 * Por que existir, então, se a lista já está no site: é o primeiro lugar
 * onde se procura num repositório, e o formato Keep a Changelog é lido
 * sem navegador — no `git log`, num diff, numa release do GitHub.
 *
 * O idioma é o português, como no feed. A página de cada versão continua
 * bilíngue; o que se perde aqui é traduzido lá.
 *
 * Roda com --experimental-strip-types: os imports de tipo do módulo são
 * apagados, e o que sobra é um array literal que o Node lê direto.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DESTINO = resolve(raiz, "CHANGELOG.md");

const { RELEASE_NOTES, CHANGE_TYPES } = await import(
    resolve(raiz, "apps/web/src/shared/config/releaseNotes.ts")
);

const TITULO_CATEGORIA = {
    added: "Adicionado",
    changed: "Modificado",
    fixed: "Corrigido",
    removed: "Removido",
};

const REPO = "https://github.com/https-shini/NewPortfolio";
const SITE = "https://gcruz.dev.br";

/** Tira a ênfase do corpo editorial: aqui já é markdown de verdade. */
function limpar(texto) {
    return texto.replace(/\s+/g, " ").trim();
}

const linhas = [
    "# Changelog",
    "",
    "Todas as mudanças relevantes deste projeto.",
    "",
    "O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)",
    "e o versionamento segue [SemVer](https://semver.org/lang/pt-BR/).",
    "",
    "> Gerado de `apps/web/src/shared/config/releaseNotes.ts` por",
    "> `scripts/changelog.mjs`. Não editar à mão — as alterações se perdem",
    "> na próxima geração, e há teste conferindo a sincronia.",
    "",
];

for (const entrada of RELEASE_NOTES) {
    const v = entrada.version;
    linhas.push(`## [${v}](${SITE}/release-notes/v${v}) — ${entrada.date}`, "");

    if (entrada.title?.pt) {
        linhas.push(`**${limpar(entrada.title.pt)}**`, "");
    }
    if (entrada.summary?.pt) {
        linhas.push(limpar(entrada.summary.pt), "");
    }

    let temMudanca = false;
    for (const tipo of CHANGE_TYPES) {
        const itens = entrada.changes?.[tipo];
        if (!itens?.length) continue;
        temMudanca = true;
        linhas.push(`### ${TITULO_CATEGORIA[tipo]}`, "");
        for (const item of itens) {
            linhas.push(`- ${limpar(item.pt)}`);
        }
        linhas.push("");
    }

    if (!temMudanca && !entrada.summary?.pt) {
        linhas.push("_Sem mudanças registradas._", "");
    }
}

linhas.push(
    "---",
    "",
    `[Todas as versões](${SITE}/release-notes) · [Releases](${REPO}/releases)`,
    "",
);

const conteudo = linhas.join("\n");

if (process.argv.includes("--check")) {
    const atual = readFileSync(DESTINO, "utf8");
    if (atual !== conteudo) {
        console.error(
            "CHANGELOG.md está dessincronizado de RELEASE_NOTES.\n" +
                "Rode: npm run changelog",
        );
        process.exit(1);
    }
    console.log("CHANGELOG.md em dia com RELEASE_NOTES.");
} else {
    writeFileSync(DESTINO, conteudo, "utf8");
    console.log(
        `CHANGELOG.md gerado — ${RELEASE_NOTES.length} versões, ${conteudo.split("\n").length} linhas.`,
    );
}
