import { fetchGithubReleases } from "./_releases.js";
import { RELEASE_NOTES } from "../apps/web/src/shared/config/releaseNotes.js";
import { mergeReleaseNotes } from "../apps/web/src/shared/lib/mergeReleaseNotes.js";

/* ─────────────────────────────────────────────────────────
   /api/feed — Atom das notas de versão
   ─────────────────────────────────────────────────────────
   Servido como função, e não gerado no build, porque a lista
   é a fusão de duas fontes: as releases do GitHub e a camada
   editorial deste repositório. Um feed estático congelaria no
   último deploy, e uma release publicada depois disso ficaria
   de fora — justamente o que o sistema existe para evitar.

   Atom em vez de RSS 2.0: a especificação é mais estrita, o
   conteúdo em HTML tem tipo declarado, e as datas seguem o
   RFC 3339 sem ambiguidade de fuso.

   O feed é monolíngue. Escolher por Accept-Language quebraria
   o cache da CDN por visitante e daria a leitores diferentes
   URLs com o mesmo id — português, que é o idioma padrão do
   site, e o link leva à página, que é bilíngue.
───────────────────────────────────────────────────────── */

interface VercelRequest {
    query: Record<string, string | string[]>;
}
interface VercelResponse {
    setHeader(name: string, value: string): void;
    status(code: number): VercelResponse;
    send(body: string): void;
}

const SITE_URL = process.env.VITE_SITE_URL || "https://gcruz.dev.br";
const AUTHOR = "Guilherme Cruz";

/** Escapa o que não pode entrar cru em texto XML. */
function esc(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

/** "2026-08-04" → "2026-08-04T00:00:00Z", como o Atom exige. */
function toRfc3339(date: string): string {
    if (/T/.test(date)) return new Date(date).toISOString();
    return `${date}T00:00:00Z`;
}

export default async function handler(
    _req: VercelRequest,
    res: VercelResponse,
): Promise<void> {
    const github = await fetchGithubReleases();
    const releases = mergeReleaseNotes(RELEASE_NOTES, github);

    const atualizado = releases.length
        ? toRfc3339(releases[0]!.date)
        : new Date().toISOString();

    const entradas = releases
        .map((r) => {
            const url = `${SITE_URL}/release-notes/v${r.version}`;
            const titulo = r.title.pt;
            const resumo = r.summary?.pt;

            /* O corpo local é texto com ênfase própria e mora bilíngue; o
               do GitHub já vem como HTML sanitizado. Nenhum dos dois é
               obrigatório — sem corpo, o resumo carrega a entrada. */
            const conteudo = r.body?.pt ?? r.html ?? resumo ?? titulo;

            return [
                "    <entry>",
                `        <title>${esc(titulo)}</title>`,
                `        <link rel="alternate" type="text/html" href="${esc(url)}"/>`,
                `        <id>${esc(url)}</id>`,
                `        <updated>${toRfc3339(r.date)}</updated>`,
                ...(resumo ? [`        <summary>${esc(resumo)}</summary>`] : []),
                `        <content type="html">${esc(conteudo)}</content>`,
                ...(r.url
                    ? [`        <link rel="related" href="${esc(r.url)}"/>`]
                    : []),
                "    </entry>",
            ].join("\n");
        })
        .join("\n");

    const xml = [
        '<?xml version="1.0" encoding="utf-8"?>',
        '<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="pt-BR">',
        `    <title>Notas de versão — ${esc(AUTHOR)}</title>`,
        "    <subtitle>O que mudou no portfólio, versão a versão.</subtitle>",
        `    <link rel="self" type="application/atom+xml" href="${SITE_URL}/feed.xml"/>`,
        `    <link rel="alternate" type="text/html" href="${SITE_URL}/release-notes"/>`,
        `    <id>${SITE_URL}/release-notes</id>`,
        `    <updated>${atualizado}</updated>`,
        `    <author><name>${esc(AUTHOR)}</name></author>`,
        entradas,
        "</feed>",
        "",
    ].join("\n");

    res.setHeader("Content-Type", "application/atom+xml; charset=utf-8");
    res.setHeader(
        "Cache-Control",
        "s-maxage=3600, stale-while-revalidate=86400",
    );
    res.status(200).send(xml);
}
