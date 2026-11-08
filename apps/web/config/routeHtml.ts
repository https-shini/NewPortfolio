import translations from "../src/shared/lib/translations.json" with { type: "json" };
import { ROUTES } from "../src/shared/config/routes.ts";

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
    return result;
}
