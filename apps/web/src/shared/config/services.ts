import type { Localized } from "../lib/localized.ts";

export const SERVICE_META = {
    pt: {
        title: "GCRUZ | Desenvolvimento Web, Consultoria e Soluções de TI",
        description:
            "Criação de sites, desenvolvimento web, consultoria técnica, suporte remoto, automações e soluções de TI para pequenas empresas.",
    },
    en: {
        title: "GCRUZ | Web Development, Consulting & IT Solutions",
        description:
            "Websites, web development, technical consulting, remote support, automation and IT solutions for small businesses.",
    },
} satisfies Localized<{ title: string; description: string }>;
export { WEB_PLANS as SERVICE_PLANS } from "./serviceCatalog.ts";
export function serviceSchema(siteUrl: string, lang: "pt" | "en") {
    return {
        "@context": "https://schema.org",
        "@type": "Service",
        name: SERVICE_META[lang].title,
        description: SERVICE_META[lang].description,
        url: `${siteUrl}/servicos`,
        serviceType:
            lang === "pt"
                ? "Desenvolvimento web, consultoria e soluções de TI"
                : "Web development, consulting and IT solutions",
        provider: { "@type": "Person", name: "Guilherme Cruz", url: siteUrl },
    };
}
