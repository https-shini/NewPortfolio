import type { Localized } from "@/shared/lib/localized";

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
 * formatRecommendationDate — alias de `formatFullDate`.
 * A formatação virou utilitário compartilhado quando as Release Notes
 * passaram a precisar da mesma data por extenso.
 */
export { formatFullDate as formatRecommendationDate } from "@/shared/lib/dateUtils";

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
