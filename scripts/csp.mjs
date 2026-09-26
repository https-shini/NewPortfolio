/**
 * Hash dos scripts inline, para a CSP do vercel.json.
 *
 *   node scripts/csp.mjs           imprime o hash de cada documento do dist/
 *   node scripts/csp.mjs --check   falha se o vercel.json estiver velho
 *
 * ── Por que existe ───────────────────────────────────────────────────
 *
 * A CSP libera o script inline de bootstrap de tema por hash SHA-256, e
 * não por 'unsafe-inline'. Hash é preciso — libera aquele script e nenhum
 * outro —, e é também frágil: um espaço a mais no `index.html` muda o
 * hash, o navegador bloqueia o script, e o site abre no tema errado.
 *
 * O `--check` no CI é o que impede isso de acontecer em silêncio. Mesmo
 * arranjo de `icones.mjs` e `imagens.mjs`: o valor é derivado, fica
 * gravado, e uma porta confere que não envelheceu.
 *
 * ── Por que o valor mora no vercel.json, e não é gerado ──────────────
 *
 * A Vercel lê o `vercel.json` da RAIZ do repositório, não do `dist/`.
 * Gerar o arquivo no build não serviria: o que a Vercel aplica é o que
 * está commitado. Então o hash é escrito lá e conferido aqui.
 *
 * ── O que NÃO precisa de hash ────────────────────────────────────────
 *
 * Cada documento tem dois scripts inline. O `type="application/ld+json"`
 * carrega o JSON-LD do schema.org e não executa — `script-src` não se
 * aplica a tipo não executável, e dar hash a ele seria ruído. Só o
 * bootstrap de tema entra.
 */

import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";

const DIST = new URL("../apps/web/dist/", import.meta.url);
const VERCEL = new URL("../vercel.json", import.meta.url);

const conferir = process.argv.includes("--check");

/** Tipos que o navegador executa — os outros são dados. */
const EXECUTA = new Set([
    "",
    "module",
    "text/javascript",
    "application/javascript",
]);

/** Hash na forma que a CSP espera, do conteúdo entre as tags. */
function hashDe(corpo) {
    return `sha256-${createHash("sha256").update(corpo, "utf8").digest("base64")}`;
}

/** Os scripts inline executáveis de um documento. */
function scriptsInline(html) {
    const achados = [];
    const re = /<script(?![^>]*\ssrc=)([^>]*)>([\s\S]*?)<\/script>/g;
    for (const [, attrs, corpo] of html.matchAll(re)) {
        const tipo = /type=["']([^"']+)["']/.exec(attrs)?.[1] ?? "";
        if (EXECUTA.has(tipo)) achados.push(hashDe(corpo));
    }
    return achados;
}

const documentos = readdirSync(DIST).filter((f) => f.endsWith(".html"));
if (!documentos.length) {
    console.error(
        "Nenhum documento em apps/web/dist/. Rode `npm run build` antes.",
    );
    process.exit(1);
}

const porDocumento = documentos.map((f) => ({
    documento: f,
    hashes: scriptsInline(readFileSync(new URL(f, DIST), "utf8")),
}));

/* Todos os documentos nascem do mesmo modelo — o bootstrap de tema é
   idêntico nos três. Se algum dia divergirem, a CSP precisa do conjunto
   inteiro, e este aviso é o que faz alguém perceber. */
const todos = [...new Set(porDocumento.flatMap((d) => d.hashes))].sort();

if (!conferir) {
    for (const { documento, hashes } of porDocumento) {
        console.log(
            `${documento.padEnd(22)} ${hashes.join(" ") || "(nenhum)"}`,
        );
    }
    console.log(`\n${todos.length} hash(es) distinto(s) para a CSP:`);
    todos.forEach((h) => console.log(`  '${h}'`));
    process.exit(0);
}

/* ── --check ──────────────────────────────────────────────────────── */

const vercel = readFileSync(VERCEL, "utf8");
const faltando = todos.filter((h) => !vercel.includes(h));

/* Hash escrito no vercel.json que nenhum documento produz mais: sobra de
   uma edição anterior. Não quebra o site, mas é lixo que confunde a
   próxima pessoa a ler a política. */
const sobrando = [...vercel.matchAll(/'(sha256-[A-Za-z0-9+/=]+)'/g)]
    .map((m) => m[1])
    .filter((h) => !todos.includes(h));

for (const { documento, hashes } of porDocumento) {
    const ok = hashes.every((h) => vercel.includes(h));
    console.log(`  ${ok ? "ok  " : "FALHA"}  ${documento}`);
}

if (faltando.length || sobrando.length) {
    console.error("\nA CSP do vercel.json não corresponde ao dist/.\n");
    faltando.forEach((h) => console.error(`  FALTA no vercel.json:   '${h}'`));
    sobrando.forEach((h) => console.error(`  SOBRA no vercel.json:   '${h}'`));
    console.error(
        "\nO script inline de bootstrap de tema mudou. Sem o hash certo, o\n" +
            "navegador o bloqueia e o site abre no tema errado.\n\n" +
            "Rode `node scripts/csp.mjs` e copie o hash para a diretiva\n" +
            "script-src do vercel.json.",
    );
    process.exit(1);
}

console.log(
    `\nCSP em dia com os scripts inline — ${todos.length} hash(es) conferido(s).`,
);
