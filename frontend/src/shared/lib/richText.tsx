import React from "react";

/* ─────────────────────────────────────────────────────────
   renderRich — converte ênfase `**negrito**` em <strong>.
   Permite manter destaques tipográficos em textos traduzidos
   (i18n-friendly: o tradutor controla onde a ênfase cai).

   Ex.: renderRich("Olá **mundo**") → ["Olá ", <strong>mundo</strong>]
───────────────────────────────────────────────────────── */
export function renderRich(text: string): React.ReactNode[] {
    return text
        .split(/(\*\*[^*]+\*\*)/g)
        .filter(Boolean)
        .map((part, i) =>
            part.startsWith("**") && part.endsWith("**") ? (
                <strong key={i}>{part.slice(2, -2)}</strong>
            ) : (
                <React.Fragment key={i}>{part}</React.Fragment>
            ),
        );
}

/**
 * renderRichParagraphs — divide por linhas em branco (\n\n) e renderiza
 * cada parágrafo via `renderRich`, aplicando `className` em cada <p>.
 */
export function renderRichParagraphs(
    text: string,
    className?: string,
): React.ReactNode[] {
    return text
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
            <p key={i} className={className}>
                {renderRich(p)}
            </p>
        ));
}
