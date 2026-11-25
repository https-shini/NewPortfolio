import { QUOTE_META } from "@/shared/config/quote";
import { useEffect } from "react";
import { PROFILE } from "@/shared/config/profile";
import { SERVICE_META, serviceSchema } from "@/shared/config/services";

/** Complementa o hook compartilhado sem deixar o Person da home nesta rota. */
export function useCommercialMeta(lang: "pt" | "en", quote = false) {
    const path = quote ? "/orcamento" : "/servicos";
    useEffect(() => {
        const previous = Array.from(
            document.head.querySelectorAll(
                'script[type="application/ld+json"], link[hreflang], meta[property="og:image"], meta[name="twitter:image"], meta[property="og:image:alt"], meta[property="og:locale"]',
            ),
        );
        // A entrada estática já contém Service. Ao sair dessa entrada, restaura
        // uma base do portfólio, não os metadados comerciais na próxima rota.
        const staticService = previous.some(
            (n) =>
                n.tagName === "SCRIPT" &&
                (n.textContent?.includes('"@type":"Service"') ||
                    n.textContent?.includes('"@type":"WebPage"')),
        );
        if (staticService) {
            for (const node of previous) {
                if (node instanceof HTMLScriptElement)
                    node.textContent = JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Person",
                        name: PROFILE.name,
                        url: PROFILE.siteUrl,
                        jobTitle: PROFILE.role[lang],
                    });
                if (node instanceof HTMLLinkElement)
                    node.href = `${PROFILE.siteUrl}/${node.hreflang === "en" ? "?lang=en" : ""}`;
                if (node instanceof HTMLMetaElement) {
                    const key = node.getAttribute("property") || node.name;
                    node.content = key.endsWith(":image")
                        ? `${PROFILE.siteUrl}/og-preview.jpg`
                        : key === "og:locale"
                          ? lang === "pt"
                              ? "pt_BR"
                              : "en_US"
                          : PROFILE.name;
                }
            }
        }
        previous.forEach((n) => n.remove());
        const nodes: HTMLElement[] = [];
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(
            quote
                ? {
                      "@context": "https://schema.org",
                      "@type": "WebPage",
                      name: QUOTE_META[lang].title,
                      url: `${PROFILE.siteUrl}${path}`,
                  }
                : serviceSchema(PROFILE.siteUrl, lang),
        );
        nodes.push(script);
        for (const [locale, suffix] of [
            ["pt-BR", ""],
            ["en", "?lang=en"],
            ["x-default", ""],
        ]) {
            const link = document.createElement("link");
            link.rel = "alternate";
            link.hreflang = locale;
            link.href = `${PROFILE.siteUrl}${path}${suffix}`;
            nodes.push(link);
        }
        for (const [key, value] of [
            ["og:image", `${PROFILE.siteUrl}/api/og?page=services`],
            ["twitter:image", `${PROFILE.siteUrl}/api/og?page=services`],
            ["og:image:alt", (quote ? QUOTE_META : SERVICE_META)[lang].title],
            ["og:locale", lang === "pt" ? "pt_BR" : "en_US"],
        ]) {
            const meta = document.createElement("meta");
            meta.setAttribute(key.startsWith("og:") ? "property" : "name", key);
            meta.content = value;
            nodes.push(meta);
        }
        nodes.forEach((n) => document.head.appendChild(n));
        return () => {
            nodes.forEach((n) => n.remove());
            previous.forEach((n) => document.head.appendChild(n));
        };
    }, [lang, quote, path]);
}
