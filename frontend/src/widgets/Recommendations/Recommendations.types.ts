import React from 'react';

export interface RecommendationItem {
    /** Unique identifier */
    id:           string;
    /** Full name of the person giving the recommendation */
    authorName:   string;
    /** Title or relation to the user, e.g. "Tech Lead · Wise System" */
    authorRole:   string;
    /** Optional profile photo URL */
    authorPhoto?: string;
    /** Full recommendation text (supports \n\n for paragraphs) */
    text:         string;
    /** Optional contextual tags (e.g. ["Análise", "Resolução de problemas"]) */
    tags?:        string[];
    /** Data da recomendação em formato ISO 'YYYY-MM-DD' */
    date:         string;
    /**
     * Relação autor ⇄ Guilherme na época da recomendação.
     * Texto curto bilíngue (pt / en) — ex. "Supervisionava diretamente".
     */
    relationship: { pt: string; en: string };
}

/**
 * formatRecommendationDate — formata uma data ISO no formato long (pt/en).
 * Ex.: '2026-04-06' + 'pt' → "6 de abril de 2026"
 *      '2026-04-06' + 'en' → "April 6, 2026"
 */
export function formatRecommendationDate(iso: string, lang: 'pt' | 'en'): string {
    // Constrói a data no fuso local para evitar shift de timezone
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(y, (m ?? 1) - 1, d ?? 1);
    const locale = lang === 'pt' ? 'pt-BR' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
        day:   'numeric',
        month: 'long',
        year:  'numeric',
    }).format(date);
}

/**
 * summarize — corta `text` em até `maxChars` preservando a palavra inteira.
 * Usado para gerar o resumo exibido no card.
 */
export function summarize(text: string, maxChars = 800): string {
    const clean = text.replace(/\s+/g, ' ').trim();
    if (clean.length <= maxChars) return clean;

    const sliced = clean.slice(0, maxChars);
    const lastSpace = sliced.lastIndexOf(' ');
    const cut = lastSpace > maxChars * 0.6 ? sliced.slice(0, lastSpace) : sliced;
    return cut.replace(/[.,;:!?–—]+$/, '').trim() + '…';
}

/**
 * DEFAULT_HIGHLIGHT_KEYWORDS
 * Lista curada de palavras/frases que representam pontos relevantes
 * em recomendações profissionais. São destacadas automaticamente em <strong>.
 * A busca é case-insensitive e acentos-tolerante.
 */
export const DEFAULT_HIGHLIGHT_KEYWORDS: readonly string[] = [
    // Qualidades profissionais
    'profissional confiável', 'confiável', 'comprometido', 'proativo',
    'excelência', 'dedicação', 'dedicação constante', 'rigor analítico',
    'segurança e qualidade', 'alto nível', 'diferencial', 'diferencial significativo',

    // Competências técnicas / analíticas
    'capacidade de análise', 'resolução de problemas', 'análise',
    'perfil analítico', 'detalhista', 'investigativa', 'causa raiz',
    'regras de negócio', 'processos financeiros', 'notas fiscais',
    'competência técnica', 'homologador',

    // Soft skills
    'evolução constante', 'evolução', 'aprendizados', 'colaboração',
    'visão diferente', 'somar', 'contribui', 'posiciona no time',

    // Impacto
    'faz diferença', 'transmite segurança', 'eleva o nível',
    'entregas', 'impacto', 'resultado do trabalho',
];

/**
 * Normaliza string (remove acentos + lowercase) — usado para busca.
 */
function normalize(s: string): string {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/**
 * highlightKeywords — transforma texto em um array de React nodes,
 * envolvendo ocorrências de `keywords` em <strong>. Case-insensitive,
 * acentos-tolerante, não sobrepõe matches (prioriza frases mais longas).
 */
export function highlightKeywords(
    text: string,
    keywords: readonly string[] = DEFAULT_HIGHLIGHT_KEYWORDS,
    keyPrefix = 'kw',
): React.ReactNode[] {
    if (!keywords.length || !text) return [text];

    // Ordena por comprimento desc (frases longas primeiro)
    const sorted = [...keywords].sort((a, b) => b.length - a.length);
    const normalizedText = normalize(text);

    // Coleta todos os matches [start, end)
    type Match = { start: number; end: number };
    const matches: Match[] = [];
    const taken = new Array<boolean>(text.length).fill(false);

    for (const kw of sorted) {
        const nk = normalize(kw);
        if (!nk) continue;
        let from = 0;
        while (from <= normalizedText.length - nk.length) {
            const idx = normalizedText.indexOf(nk, from);
            if (idx < 0) break;
            // Respeita limites de palavra
            const before = text[idx - 1];
            const after  = text[idx + nk.length];
            const isBoundary = (c: string | undefined) => !c || /[^\p{L}\p{N}]/u.test(c);
            if (isBoundary(before) && isBoundary(after)) {
                // Verifica sobreposição
                let overlaps = false;
                for (let i = idx; i < idx + nk.length; i++) {
                    if (taken[i]) { overlaps = true; break; }
                }
                if (!overlaps) {
                    for (let i = idx; i < idx + nk.length; i++) taken[i] = true;
                    matches.push({ start: idx, end: idx + nk.length });
                }
            }
            from = idx + nk.length;
        }
    }

    if (!matches.length) return [text];

    matches.sort((a, b) => a.start - b.start);

    const nodes: React.ReactNode[] = [];
    let cursor = 0;
    matches.forEach((m, i) => {
        if (m.start > cursor) nodes.push(text.slice(cursor, m.start));
        nodes.push(
            React.createElement(
                'strong',
                { key: `${keyPrefix}-${i}`, className: 'rec-hl' },
                text.slice(m.start, m.end),
            ),
        );
        cursor = m.end;
    });
    if (cursor < text.length) nodes.push(text.slice(cursor));
    return nodes;
}
