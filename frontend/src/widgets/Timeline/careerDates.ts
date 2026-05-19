/* ─────────────────────────────────────────────────────────
   careerDates.ts
   ──────────────
   Helpers para derivar `period`, `duration` e `totalDuration`
   das posições / empresas a partir de ISO "YYYY-MM".

   Mantém a fonte de verdade em datas absolutas — o display
   se atualiza sozinho (ex.: "4 meses" → "5 meses" no mês seguinte)
   e respeita o idioma corrente.
───────────────────────────────────────────────────────── */
import { calculateDuration, formatMonthYear } from '@/shared/lib/dateUtils';
import type { CareerCompany, CareerPosition } from './Timeline.types';

type Lang = 'pt' | 'en';

/**
 * Constrói o display de período de uma posição.
 *
 *   buildPeriod('2026-01', undefined,   'pt', 'o momento') → "jan de 2026 — o momento"
 *   buildPeriod('2025-04', '2025-12',   'pt', 'o momento') → "abr de 2025 — dez de 2025"
 *   buildPeriod('2026-01', undefined,   'en', 'Present')   → "Jan 2026 — Present"
 */
export function buildPeriod(
    startDate: string,
    endDate:   string | undefined,
    lang:      Lang,
    presentLabel: string,
): string {
    const start = formatMonthYear(startDate, lang);
    const end   = endDate ? formatMonthYear(endDate, lang) : presentLabel;
    return `${start} — ${end}`;
}

/**
 * Calcula a duração display de uma posição.
 * Sempre retorna apenas a duração (sem prefixo "Em andamento ·"),
 * já que o status é exibido separadamente como pill no UI.
 */
export function buildDuration(
    startDate: string,
    endDate:   string | undefined,
    lang:      Lang,
): string {
    // calculateDuration adiciona "Em andamento · " quando endDate é undefined.
    // Aqui queremos apenas a duração — strip do prefixo se presente.
    const raw = calculateDuration(startDate, endDate, lang);
    const sep = ' · ';
    const idx = raw.indexOf(sep);
    return idx >= 0 ? raw.slice(idx + sep.length) : raw;
}

/**
 * Calcula a duração total na empresa: do startDate da posição mais antiga
 * até o endDate da mais recente (ou "agora" se houver posição ativa).
 *
 * Assume `positions` ordenado mais recente → mais antiga (ordem usada
 * em LinkedIn e no nosso `careerCompanies`).
 */
export function buildTotalDuration(
    positions: CareerPosition[],
    lang:      Lang,
): string {
    if (positions.length === 0) return '';

    // mais antiga = última do array (mais recente está no topo)
    const oldest = positions[positions.length - 1]!;
    const newest = positions[0]!;

    return buildDuration(oldest.startDate, newest.endDate, lang);
}

/**
 * Resolve `period` de uma posição: usa o valor explícito se presente,
 * senão deriva de `startDate`/`endDate`.
 */
export function resolvePeriod(
    pos:           CareerPosition,
    lang:          Lang,
    presentLabel:  string,
): string {
    return pos.period ?? buildPeriod(pos.startDate, pos.endDate, lang, presentLabel);
}

/**
 * Resolve `duration` de uma posição: usa o valor explícito se presente,
 * senão deriva de `startDate`/`endDate`.
 */
export function resolveDuration(pos: CareerPosition, lang: Lang): string {
    return pos.duration ?? buildDuration(pos.startDate, pos.endDate, lang);
}

/**
 * Resolve `totalDuration` de uma empresa: usa o valor explícito se presente,
 * senão deriva das posições.
 */
export function resolveTotalDuration(
    company: CareerCompany,
    lang:    Lang,
): string {
    return company.totalDuration ?? buildTotalDuration(company.positions, lang);
}
