import type { Lang, Localized } from "@/shared/lib/localized";

export interface RecommendationItem {
    /** Unique identifier */
    id: string;
    /** Full name of the person giving the recommendation (proper noun) */
    authorName: string;
    /** Title / relation to the user (bilingual) */
    authorRole: Localized;
    /** Optional profile photo URL */
    authorPhoto?: string;
    /** Full recommendation text, bilingual (supports \n\n for paragraphs) */
    text: Localized;
    /** Optional contextual tags (bilingual) */
    tags?: Localized[];
    /** Recommendation date in ISO 'YYYY-MM-DD' */
    date: string;
    /** Author ⇄ Guilherme relationship at the time (bilingual) */
    relationship: Localized;
}

/**
 * formatRecommendationDate — formata uma data ISO no formato long (pt/en).
 * Ex.: '2026-04-06' + 'pt' → "6 de abril de 2026"
 *      '2026-04-06' + 'en' → "April 6, 2026"
 */
export function formatRecommendationDate(iso: string, lang: Lang): string {
    const [y, m, d] = iso.split("-").map(Number);
    const date = new Date(y!, (m ?? 1) - 1, d ?? 1);
    const locale = lang === "pt" ? "pt-BR" : "en-US";
    return new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

/**
 * summarize — corta `text` em até `maxChars` preservando a palavra inteira.
 * Usado para gerar o resumo exibido no card.
 */
export function summarize(text: string, maxChars = 800): string {
    const clean = text.replace(/\s+/g, " ").trim();
    if (clean.length <= maxChars) return clean;

    const sliced = clean.slice(0, maxChars);
    const lastSpace = sliced.lastIndexOf(" ");
    const cut =
        lastSpace > maxChars * 0.6 ? sliced.slice(0, lastSpace) : sliced;
    return cut.replace(/[.,;:!?–—]+$/, "").trim() + "…";
}
