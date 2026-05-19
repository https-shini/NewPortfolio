/* ─────────────────────────────────────────────────────────
   text.ts — utilitários compartilhados para manipulação
   de strings (iniciais de nome, truncamento etc.)
───────────────────────────────────────────────────────── */

/**
 * getInitials — extrai iniciais de um nome próprio.
 *
 *   "Guilherme"               → "G"
 *   "Guilherme Cruz"          → "GC"
 *   "Guilherme Henrique Cruz" → "GC"   (primeiro + último)
 *
 * Espaços múltiplos e excedentes são normalizados.
 */
export function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0][0]!.toUpperCase();
    return (parts[0][0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/**
 * clampText — trunca `text` em até `limit` caracteres, cortando
 * na última palavra inteira para não quebrar no meio. Adiciona
 * reticências (…) quando ocorre truncamento.
 *
 *   clampText("Hello world", 5)  → "Hello…"
 *   clampText("Hi", 5)           → "Hi"
 *   clampText("Lorem ipsum", 8)  → "Lorem…"
 *
 * Diferente de `summarize` (que normaliza whitespace e remove
 * pontuação final), este helper preserva o texto original.
 */
export function clampText(text: string, limit: number): string {
    if (text.length <= limit) return text;
    const slice = text.slice(0, limit);
    const lastSpace = slice.lastIndexOf(' ');
    return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trimEnd() + '…';
}
