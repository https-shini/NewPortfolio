import type { Lang } from "@/shared/lib/translations";
import type { Language } from "@/features/devhub/types";

/* ─────────────────────────────────────────────────────────
   format.ts — números e datas do DevHub, nos dois idiomas
   ─────────────────────────────────────────────────────────
   A implementação anterior devolvia "today", "3d ago" e
   "1mo ago" em inglês fixo, e esses textos apareciam em todos
   os cartões da galeria e no painel de estatísticas do detalhe
   — inclusive com o site em português.

   Aqui o idioma é parâmetro, e quem formata é o `Intl` do
   próprio navegador: ele já sabe pluralizar e abreviar em
   pt-BR e em en, e não custa bytes de bundle.
───────────────────────────────────────────────────────── */

/** Etiquetas BCP 47 do `Intl`. Espelham HREFLANG em config/routes.ts. */
const LOCALE: Record<Lang, string> = { pt: "pt-BR", en: "en" };

const MS_POR_DIA = 86_400_000;

/**
 * Data relativa curta: "hoje", "há 3 dias", "3 days ago".
 *
 * `Intl.RelativeTimeFormat` com `numeric: "auto"` é o que produz
 * "ontem" em vez de "há 1 dia" — a forma que uma pessoa usaria.
 *
 * A unidade sobe de dia para mês e de mês para ano no mesmo ponto em
 * que a anterior deixa de informar: trinta "há 45 dias" na tela dizem
 * menos do que "há 2 meses".
 */
export function formatRelativeDate(iso: string | null, lang: Lang): string {
    if (!iso) return "—";

    const timestamp = new Date(iso).getTime();
    if (Number.isNaN(timestamp)) return "—";

    const rtf = new Intl.RelativeTimeFormat(LOCALE[lang], {
        numeric: "auto",
    });

    const dias = Math.floor((Date.now() - timestamp) / MS_POR_DIA);

    if (dias < 1) return rtf.format(0, "day");
    if (dias < 30) return rtf.format(-dias, "day");

    const meses = Math.floor(dias / 30);
    if (meses < 12) return rtf.format(-meses, "month");

    return rtf.format(-Math.floor(meses / 12), "year");
}

/** Data absoluta por extenso: "18 de fev. de 2026" / "Feb 18, 2026". */
export function formatDate(iso: string, lang: Lang): string {
    const timestamp = new Date(iso).getTime();
    if (Number.isNaN(timestamp)) return "—";

    return new Intl.DateTimeFormat(LOCALE[lang], {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(timestamp);
}

/** Contagem compacta: 1200 → "1,2 mil" / "1.2K". */
export function formatCount(value: number, lang: Lang): string {
    return new Intl.NumberFormat(LOCALE[lang], {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);
}

/** Número por extenso, com o separador de milhar do idioma. */
export function formatNumber(value: number, lang: Lang): string {
    return new Intl.NumberFormat(LOCALE[lang]).format(value);
}

/* ─────────────────────────────────────────────────────────
   Linguagens
───────────────────────────────────────────────────────── */

export interface LanguageShare extends Language {
    /** Participação em porcentagem, com uma casa decimal. */
    pct: number;
}

/**
 * Converte bytes por linguagem em participação percentual.
 *
 * Linguagens sem `size` ficam de fora: na listagem o GitHub só
 * informa a primária, e dividir por um total que não existe daria
 * uma barra cheia de uma cor só, sugerindo precisão que o dado
 * não tem.
 */
export function languageShares(languages: Language[]): LanguageShare[] {
    const comTamanho = languages.filter(
        (l): l is Language & { size: number } => typeof l.size === "number",
    );

    const total = comTamanho.reduce((soma, l) => soma + l.size, 0);
    if (!total) return [];

    return comTamanho.map((l) => ({
        ...l,
        pct: Math.round((l.size / total) * 1000) / 10,
    }));
}
