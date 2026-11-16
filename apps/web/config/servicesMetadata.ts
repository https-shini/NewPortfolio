import { SERVICE_META, serviceSchema } from "../src/shared/config/services.ts";

import { QUOTE_META } from "../src/shared/config/quote.ts";
export function renderServicesHtml(
    html: string,
    siteUrl: string,
    quote = false,
): string {
    const { title, description } = (quote ? QUOTE_META : SERVICE_META).pt;
    const escape = (s: string) =>
        s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
    const url = `${siteUrl}/${quote ? "orcamento" : "servicos"}`;
    let result = html
        .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(title)}</title>`)
        .replace(
            /<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g,
            "",
        )
        .replace(/<link\b[^>]*hreflang=[^>]*>/g, "")
        .replace(
            /<link\b[^>]*rel="canonical"[^>]*>/g,
            `<link rel="canonical" href="${escape(url)}" />`,
        );
    const metas: Record<string, string> = {
        description,
        "og:title": title,
        "og:description": description,
        "og:url": url,
        "og:image": `${siteUrl}/api/og?page=services`,
        "og:image:alt": title,
        "twitter:title": title,
        "twitter:description": description,
        "twitter:image": `${siteUrl}/api/og?page=services`,
    };
    for (const [key, value] of Object.entries(metas))
        result = result.replace(
            new RegExp(`<meta\\b[^>]*(?:name|property)="${key}"[^>]*>`, "g"),
            `<meta ${key.startsWith("og:") ? "property" : "name"}="${key}" content="${escape(value)}" />`,
        );
    if (quote)
        result = result
            .replace(/<meta\b[^>]*name="robots"[^>]*>/g, "")
            .replace(
                "</head>",
                '<meta name="robots" content="noindex, follow"/></head>',
            );
    return result.replace(
        "</head>",
        `<link rel="alternate" hreflang="pt-BR" href="${url}"/><link rel="alternate" hreflang="en" href="${url}?lang=en"/><link rel="alternate" hreflang="x-default" href="${url}"/><script type="application/ld+json">${JSON.stringify(quote ? { "@context": "https://schema.org", "@type": "WebPage", name: title, url } : serviceSchema(siteUrl, "pt")).replace(/</g, "\\u003c")}</script></head>`,
    );
}
