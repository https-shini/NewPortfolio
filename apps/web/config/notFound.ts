import { NOT_FOUND_COPY } from "../src/shared/config/notFound.ts";
import { ROUTES } from "../src/shared/config/routes.ts";

/** Reaproveita os assets com hash do build, mas sem indexar o HTML de erro
 * como se fosse a home. A Vercel serve este arquivo com status 404 quando
 * nenhum arquivo ou rewrite corresponde ao endereço pedido. */
export function renderNotFoundHtml(html: string): string {
    const copy = NOT_FOUND_COPY.pt;
    const escape = (value: string) =>
        value
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    let result = html
        .replace(
            /<title>[\s\S]*?<\/title>/i,
            `<title>404 — ${copy.title}</title>`,
        )
        .replace(/<link\b[^>]*rel="canonical"[^>]*>/gi, "")
        .replace(/<meta\b[^>]*property="og:url"[^>]*>/gi, "")
        .replace(
            /<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi,
            "",
        );

    for (const [key, value] of Object.entries({
        robots: "noindex, follow",
        description: copy.description,
        "og:title": `404 — ${copy.title}`,
        "og:description": copy.description,
        "twitter:title": `404 — ${copy.title}`,
        "twitter:description": copy.description,
    })) {
        const tag = new RegExp(
            `<meta\\b[^>]*(?:name|property)="${key}"[^>]*>`,
            "gi",
        );
        result = result.replace(
            tag,
            `<meta ${key.startsWith("og:") ? "property" : "name"}="${key}" content="${escape(value)}" />`,
        );
    }

    // Sem JS ainda há uma explicação e um caminho de recuperação. O React
    // substitui este conteúdo pela página completa quando inicializa.
    return result.replace(
        '<div id="root"></div>',
        `<div id="root"><main class="container section"><p>404</p><h1>${copy.title}</h1><p>${copy.description}</p><p><a class="btn btn--primary" href="${ROUTES.HOME}">${copy.home}</a></p></main></div>`,
    );
}
