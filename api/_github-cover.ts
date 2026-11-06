import { srcSeguro, type Origem } from "./_devhub-sanitize.js";

/* ─────────────────────────────────────────────────────────
   _github-cover.ts — a capa de um repositório, só de fonte real
   ─────────────────────────────────────────────────────────
   Ordem de preferência:

     1. `custom` — a "social preview" que o dono enviou ao GitHub
        (`usesCustomOpenGraphImage`). É a capa que ele escolheu.
     2. `readme` — a primeira imagem de verdade do README: banner,
        captura de tela, prévia. Recurso do próprio repositório.
     3. nada — o cliente desenha uma composição a partir da
        identidade do projeto (nome, linguagens, tópicos), sem
        fingir que é captura da aplicação.

   O card automático do GitHub (opengraph.githubassets.com sem
   imagem customizada) fica de fora de propósito: é o mesmo molde
   para todo repositório — exatamente a "imagem genérica repetida"
   que a vitrine não pode ter.
───────────────────────────────────────────────────────── */

export interface Cover {
    kind: "custom" | "readme";
    url: string;
}

/* Imagens que aparecem no topo de README mas não mostram o projeto:
   selos, contadores, cabeçalhos animados, ícones de stack. */
const HOSTS_DECORATIVOS = [
    "img.shields.io",
    "shields.io",
    "badgen.net",
    "badge.fury.io",
    "capsule-render.vercel.app",
    "readme-typing-svg",
    "github-readme-stats",
    "github-readme-streak-stats",
    "streak-stats.demolab.com",
    "github-profile-trophy",
    "komarev.com",
    "visitor-badge",
    "skillicons.dev",
    "techstack-generator",
    "forthebadge.com",
    "codecov.io",
    "travis-ci",
    "app.netlify.com",
];

/* A capa precisa carregar sempre: só hosts do próprio GitHub, que não
   expiram nem dependem de terceiro. */
const HOSTS_ACEITOS = new Set([
    "raw.githubusercontent.com",
    "user-images.githubusercontent.com",
    "repository-images.githubusercontent.com",
    "github.com",
]);

/* Nome de arquivo que sugere "isto é o projeto": preferido quando há
   mais de uma imagem nas primeiras posições. */
const NOME_DE_CAPA =
    /(banner|cover|capa|hero|preview|screenshot|screen|print|demo|mockup|home)/i;

/** Quantas imagens do começo do README entram na disputa. */
const JANELA = 6;

function candidatas(markdown: string): string[] {
    const achados: { pos: number; url: string }[] = [];
    const md = /!\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g;
    const html = /<img\b[^>]*?\bsrc\s*=\s*["']([^"']+)["']/gi;
    for (const m of markdown.matchAll(md)) {
        if (m[1]) achados.push({ pos: m.index ?? 0, url: m[1] });
    }
    for (const m of markdown.matchAll(html)) {
        if (m[1]) achados.push({ pos: m.index ?? 0, url: m[1] });
    }
    return achados.sort((a, b) => a.pos - b.pos).map((a) => a.url);
}

/* Nome de arquivo de peça de interface, não de tela do projeto. Caso
   real: o README do spotify-github-profile abre com `btn-spotify.png`. */
const NOME_DECORATIVO =
    /(^|[/_.-])(btn|button|logo|icon|favicon|avatar)([_.-]|$)/i;

function ehDecorativa(url: URL): boolean {
    const alvo = `${url.hostname}${url.pathname}`.toLowerCase();
    if (url.pathname.toLowerCase().endsWith(".svg")) return true;
    const arquivo = url.pathname.split("/").pop() ?? "";
    if (NOME_DECORATIVO.test(arquivo)) return true;
    if (alvo.includes("badge")) return true;
    return HOSTS_DECORATIVOS.some((h) => alvo.includes(h));
}

/** `github.com/o/r/blob/b/p?raw=true` → `raw.githubusercontent.com/o/r/b/p`. */
function paraArquivoCru(url: URL): URL {
    if (url.hostname !== "github.com") return url;
    const m = url.pathname.match(/^\/([^/]+)\/([^/]+)\/(?:blob|raw)\/(.+)$/);
    if (!m) return url;
    return new URL(`https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}`);
}

/**
 * A primeira imagem real do README, ou `null`.
 *
 * Passa pelo mesmo `srcSeguro` do sanitizador — esquema conferido e
 * caminho relativo reescrito para o arquivo cru do repositório.
 */
export function capaDoReadme(markdown: string, origem: Origem): string | null {
    const aceitas: string[] = [];
    for (const bruta of candidatas(markdown)) {
        if (aceitas.length >= JANELA) break;
        const segura = srcSeguro(bruta, origem);
        if (!segura) continue;
        let url: URL;
        try {
            url = paraArquivoCru(new URL(segura));
        } catch {
            continue;
        }
        if (url.protocol !== "https:") continue;
        if (!HOSTS_ACEITOS.has(url.hostname)) continue;
        /* github.com só serve imagem em /user-attachments/assets/… */
        if (
            url.hostname === "github.com" &&
            !url.pathname.startsWith("/user-attachments/assets/")
        )
            continue;
        if (ehDecorativa(url)) continue;
        aceitas.push(url.toString());
    }
    return aceitas.find((u) => NOME_DE_CAPA.test(u)) ?? aceitas[0] ?? null;
}

/** Decide a capa: a escolhida no GitHub, senão a do README, senão nenhuma. */
export function escolherCapa(
    entrada: {
        usesCustomOpenGraphImage?: boolean;
        openGraphImageUrl?: string | null;
        readme?: string | null;
    },
    origem: Origem,
): Cover | null {
    if (entrada.usesCustomOpenGraphImage && entrada.openGraphImageUrl) {
        try {
            const url = new URL(entrada.openGraphImageUrl);
            if (url.protocol === "https:") {
                return { kind: "custom", url: url.toString() };
            }
        } catch {
            /* URL inválida: cai para o README */
        }
    }
    if (entrada.readme) {
        const url = capaDoReadme(entrada.readme, origem);
        if (url) return { kind: "readme", url };
    }
    return null;
}
