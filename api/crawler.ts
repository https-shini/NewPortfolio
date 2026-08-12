import { RELEASE_NOTES } from "../apps/web/src/shared/config/releaseNotes.js";
import { fetchGithubReleases } from "./_releases.js";
import { mergeReleaseNotes } from "../apps/web/src/shared/lib/mergeReleaseNotes.js";

/* ─────────────────────────────────────────────────────────
   /api/crawler — HTML com as meta tags certas por rota
   ─────────────────────────────────────────────────────────
   O site é uma SPA servida a partir de um index.html único. Os
   rastreadores que montam o cartão de compartilhamento — o do
   LinkedIn, o do WhatsApp, o do Slack — não executam
   JavaScript: leem o HTML como veio e param por aí.

   O efeito é que /release-notes/v2.0.0 e /links compartilham
   hoje exatamente o mesmo título, a mesma descrição e a mesma
   imagem da home. Gerar uma imagem por versão não resolveria
   nada sozinho: sem uma resposta diferente por rota, o cartão
   continua sendo o mesmo.

   Quem chega aqui é só o rastreador, roteado pelo user-agent
   no vercel.json. Pessoas continuam recebendo o index.html e a
   aplicação de sempre — o que este arquivo devolve não tem CSS
   nem script, e serviria mal a um navegador.
───────────────────────────────────────────────────────── */

interface VercelRequest {
    query: Record<string, string | string[]>;
    headers: Record<string, string | string[] | undefined>;
    url?: string;
}
interface VercelResponse {
    setHeader(name: string, value: string): void;
    status(code: number): VercelResponse;
    send(body: string): void;
}

const SITE_URL = process.env.VITE_SITE_URL || "https://gcruz.dev.br";
const AUTHOR = "Guilherme Cruz";
const OG_PADRAO = `${SITE_URL}/og-preview.jpg`;

function esc(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

/** Tira a ênfase do corpo editorial: meta tag é texto puro. */
function textoSimples(value: string, limite = 200): string {
    const limpo = value
        .replace(/\*\*/g, "")
        .replace(/`/g, "")
        .replace(/\s+/g, " ")
        .trim();
    return limpo.length > limite ? `${limpo.slice(0, limite - 1)}…` : limpo;
}

interface Meta {
    titulo: string;
    descricao: string;
    url: string;
    imagem: string;
    tipo: "website" | "article";
    publicado?: string;
}

const PADRAO: Meta = {
    titulo: `${AUTHOR} — Desenvolvedor Full Stack`,
    descricao:
        "Portfólio de Guilherme Cruz — Desenvolvedor Full Stack especializado em React, TypeScript, Node.js e Python. Projetos reais, experiência e formação.",
    url: `${SITE_URL}/`,
    imagem: OG_PADRAO,
    tipo: "website",
};

async function resolverMeta(pathname: string): Promise<Meta> {
    if (pathname === "/links" || pathname === "/links/") {
        return {
            ...PADRAO,
            titulo: `Links — ${AUTHOR}`,
            descricao:
                "Todos os canais num lugar só: portfólio, GitHub, LinkedIn, currículo e contato.",
            url: `${SITE_URL}/links`,
        };
    }

    if (/^\/release-notes\/?$/.test(pathname)) {
        return {
            ...PADRAO,
            titulo: `Notas de versão — ${AUTHOR}`,
            descricao:
                "O que mudou no portfólio, versão a versão: o que entrou, o que mudou e o que foi corrigido.",
            url: `${SITE_URL}/release-notes`,
        };
    }

    const versao = /^\/release-notes\/v([^/?#]+)/.exec(pathname)?.[1];
    if (versao) {
        /* A lista funde as duas fontes, então uma versão publicada só no
           GitHub também ganha cartão próprio. */
        const releases = mergeReleaseNotes(
            RELEASE_NOTES,
            await fetchGithubReleases(),
        );
        const entrada = releases.find((r) => r.version === versao);
        if (entrada) {
            const corpo =
                entrada.summary?.pt ??
                entrada.body?.pt ??
                `Notas da versão ${versao}.`;
            return {
                titulo: `v${versao} — ${textoSimples(entrada.title.pt, 60)}`,
                descricao: textoSimples(corpo),
                url: `${SITE_URL}/release-notes/v${versao}`,
                imagem: `${SITE_URL}/api/og?v=${encodeURIComponent(versao)}`,
                tipo: "article",
                publicado: entrada.date,
            };
        }
    }

    return PADRAO;
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
): Promise<void> {
    /* A rota chega pelo `path` que a reescrita monta. Se por algum motivo
       ela não vier — regra alterada, chamada direta em teste manual — o
       próprio `req.url` serve de reserva, e é melhor responder o cartão
       padrão do que estourar. */
    const daQuery = Array.isArray(req.query.path)
        ? req.query.path[0]
        : req.query.path;
    const daUrl = req.url ? new URL(req.url, "http://localhost").pathname : "";
    const pathname = (daQuery || daUrl || "/").split("?")[0] || "/";

    const m = await resolverMeta(pathname);

    const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<title>${esc(m.titulo)}</title>
<meta name="description" content="${esc(m.descricao)}"/>
<meta name="author" content="${esc(AUTHOR)}"/>
<link rel="canonical" href="${esc(m.url)}"/>
<meta property="og:type" content="${m.tipo}"/>
<meta property="og:site_name" content="${esc(AUTHOR)} — Portfolio"/>
<meta property="og:locale" content="pt_BR"/>
<meta property="og:locale:alternate" content="en_US"/>
<meta property="og:url" content="${esc(m.url)}"/>
<meta property="og:title" content="${esc(m.titulo)}"/>
<meta property="og:description" content="${esc(m.descricao)}"/>
<meta property="og:image" content="${esc(m.imagem)}"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:alt" content="${esc(m.titulo)}"/>
${m.publicado ? `<meta property="article:published_time" content="${esc(m.publicado)}"/>\n` : ""}<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${esc(m.titulo)}"/>
<meta name="twitter:description" content="${esc(m.descricao)}"/>
<meta name="twitter:image" content="${esc(m.imagem)}"/>
</head>
<body>
<h1>${esc(m.titulo)}</h1>
<p>${esc(m.descricao)}</p>
<p><a href="${esc(m.url)}">Abrir no site</a></p>
</body>
</html>
`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader(
        "Cache-Control",
        "s-maxage=3600, stale-while-revalidate=86400",
    );
    res.status(200).send(html);
}
