import translations from "../src/shared/lib/translations.json" with { type: "json" };
import { ROUTES } from "../src/shared/config/routes.ts";
import { SERVICE_META, serviceSchema } from "../src/shared/config/services.ts";
import { QUOTE_META } from "../src/shared/config/quote.ts";

/* ─────────────────────────────────────────────────────────
   Um documento HTML por rota estática
   ─────────────────────────────────────────────────────────
   O build gera um único index.html, preenchido com os metadados da
   home. Servido para /projetos, /contato, /links e /release-notes, ele
   chegava com o título da home e `canonical` apontando para "/": o
   `useDocumentMeta` corrigia, mas só depois do JavaScript. Quem lê o HTML
   cru — buscador antes de renderizar, prévia de link nas redes — via
   uma cópia da home.

   Aqui cada rota ganha uma cópia do index.html com título, descrição,
   canonical e Open Graph próprios, nos mesmos textos que a página usa
   (traduções em PT, idioma padrão do site). Os assets com hash e o
   script de tema são os mesmos, então a CSP por hash continua valendo.
   O vercel.json reescreve cada rota para o arquivo dela.
───────────────────────────────────────────────────────── */

const PT = translations.pt as Record<string, string>;
const AUTOR = "Guilherme Cruz";

export interface RouteMeta {
    /** Caminho público, ex.: "/projetos". */
    path: string;
    /** Arquivo gerado em dist/, ex.: "rotas/projetos.html". */
    file: string;
    title: string;
    description: string;
    /** Diretiva de robôs própria (ex.: "noindex, follow"). */
    robots?: string;
    /** Imagem de compartilhamento própria, em caminho absoluto do site. */
    image?: string;
    /** Dados estruturados que substituem o `Person` da home. */
    jsonLd?: (siteUrl: string) => object;
    /** Emite `hreflang` pt-BR / en / x-default para a rota. */
    alternates?: boolean;
}

const rota = (
    path: string,
    nome: string,
    titulo: string,
    descricao: string,
): RouteMeta => ({
    path,
    file: `rotas/${nome}.html`,
    title: `${PT[titulo]} — ${AUTOR}`,
    description: PT[descricao],
});

/** Rota cujo texto não mora em translations.json, e sim num módulo próprio
    (as páginas comerciais, que têm conteúdo e regras de negócio tipados). */
const rotaPropria = (
    path: string,
    nome: string,
    meta: { title: string; description: string },
    extra: Omit<RouteMeta, "path" | "file" | "title" | "description">,
): RouteMeta => ({
    path,
    file: `rotas/${nome}.html`,
    title: meta.title,
    description: meta.description,
    ...extra,
});

/** Rotas estáticas com documento próprio — mesmos textos do `useDocumentMeta`. */
export const ROUTE_DOCUMENTS: RouteMeta[] = [
    rota(
        ROUTES.PROJECTS,
        "projetos",
        "devhub.title",
        "devhub.meta.description",
    ),
    rota(
        ROUTES.CONTACT,
        "contato",
        "contact.title",
        "contact.meta.description",
    ),
    rota(ROUTES.LINKS, "links", "links.pageTitle", "links.meta.description"),
    rota(
        ROUTES.RELEASE_NOTES,
        "release-notes",
        "releaseNotes.title",
        "releaseNotes.meta.description",
    ),
    rotaPropria(ROUTES.SERVICES, "servicos", SERVICE_META.pt, {
        image: "/api/og?page=services",
        jsonLd: (site) => serviceSchema(site, "pt"),
        alternates: true,
    }),
    /* Indexável não: cada combinação de query seria uma URL a mais no
       índice. O canonical aponta para /orcamento limpo e o sitemap não a
       lista. */
    rotaPropria(ROUTES.QUOTE, "orcamento", QUOTE_META.pt, {
        robots: "noindex, follow",
        image: "/api/og?page=services",
        jsonLd: (site) => ({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: QUOTE_META.pt.title,
            url: `${site}${ROUTES.QUOTE}`,
        }),
        alternates: true,
    }),
];

const escape = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

/** Troca título, descrição, canonical e Open Graph do index.html pelos da rota. */
export function renderRouteHtml(
    html: string,
    meta: RouteMeta,
    siteUrl: string,
): string {
    const url = `${siteUrl}${meta.path}`;
    for (const valor of [meta.title, meta.description]) {
        if (!valor) throw new Error(`Metadado vazio para ${meta.path}`);
    }

    let result = html
        .replace(
            /<title>[\s\S]*?<\/title>/i,
            `<title>${escape(meta.title)}</title>`,
        )
        .replace(
            /<link\b[^>]*rel="canonical"[^>]*>/i,
            `<link rel="canonical" href="${escape(url)}" />`,
        );

    for (const [key, value] of Object.entries({
        description: meta.description,
        "og:url": url,
        "og:title": meta.title,
        "og:description": meta.description,
        "twitter:title": meta.title,
        "twitter:description": meta.description,
    })) {
        const tag = new RegExp(
            `<meta\\b[^>]*(?:name|property)="${key}"[^>]*>`,
            "i",
        );
        if (!tag.test(result))
            throw new Error(`index.html sem a meta "${key}"`);
        result = result.replace(
            tag,
            `<meta ${key.startsWith("og:") ? "property" : "name"}="${key}" content="${escape(value)}" />`,
        );
    }

    if (meta.robots) {
        const robots = /<meta\b[^>]*name="robots"[^>]*>/i;
        if (!robots.test(result))
            throw new Error('index.html sem a meta "robots"');
        result = result.replace(
            robots,
            `<meta name="robots" content="${escape(meta.robots)}" />`,
        );
    }

    if (meta.image) {
        const imagem = `${siteUrl}${meta.image}`;
        for (const key of ["og:image", "twitter:image"]) {
            const tag = new RegExp(
                `<meta\\b[^>]*(?:name|property)="${key}"[^>]*>`,
                "i",
            );
            if (!tag.test(result))
                throw new Error(`index.html sem a meta "${key}"`);
            result = result.replace(
                tag,
                `<meta ${key.startsWith("og:") ? "property" : "name"}="${key}" content="${escape(imagem)}" />`,
            );
        }
    }

    if (meta.jsonLd) {
        const bloco =
            /<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/i;
        if (!bloco.test(result))
            throw new Error("index.html sem o bloco JSON-LD");
        /* `<` escapado: o JSON vai dentro de <script>, e um `</script>` num
           texto encerraria o bloco antes da hora. */
        const json = JSON.stringify(meta.jsonLd(siteUrl)).replace(
            /</g,
            "\\u003c",
        );
        result = result.replace(
            bloco,
            `<script type="application/ld+json">${json}</script>`,
        );
    }

    if (meta.alternates) {
        const links = [
            ["pt-BR", url],
            ["en", `${url}?lang=en`],
            ["x-default", url],
        ]
            .map(
                ([lang, href]) =>
                    `<link rel="alternate" hreflang="${lang}" href="${escape(href)}" />`,
            )
            .join("");
        result = result.replace(/<\/head>/i, `${links}</head>`);
    }

    return result;
}
