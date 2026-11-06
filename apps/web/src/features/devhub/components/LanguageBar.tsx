import React from "react";
import { NEUTRAL_LANGUAGE_COLOR } from "@/features/devhub/types";
import { languageShares } from "@/features/devhub/format";
import type { Language } from "@/features/devhub/types";
import type { Lang } from "@/shared/lib/translations";

/* ─────────────────────────────────────────────────────────
   LanguageBar — a divisão de linguagens de um repositório
   ─────────────────────────────────────────────────────────
   A barra é a mesma do GitHub, e por isso é lida de imediato por
   quem programa. Mas uma faixa de cores não diz nada a quem não
   enxerga: daí o `role="img"` com um rótulo que soletra a mesma
   informação — "TypeScript 62%, CSS 31%" — em vez de deixar a
   divisão existir só como pixel.

   `showLabels` separa os dois usos. No cartão da galeria a barra
   é um sinal periférico, de 4px e sem legenda; no detalhe ela é
   conteúdo, e vem acompanhada da lista.
───────────────────────────────────────────────────────── */

interface Props {
    languages: Language[];
    lang: Lang;
    /** Lista nomeada abaixo da barra. Só no detalhe. */
    showLabels?: boolean;
    /** Altura em px — 4 no cartão, 8 no detalhe. */
    height?: number;
}

export const LanguageBar: React.FC<Props> = ({
    languages,
    lang,
    showLabels = false,
    height = 4,
}) => {
    const shares = languageShares(languages);
    if (shares.length === 0) return null;

    const resumo = shares
        .map(
            (s) =>
                `${s.name} ${s.pct.toLocaleString(lang === "pt" ? "pt-BR" : "en")}%`,
        )
        .join(", ");

    return (
        <div className="devhub-langbar">
            <div
                className="devhub-langbar__track"
                style={{ height }}
                role="img"
                aria-label={resumo}
            >
                {shares.map((s) => (
                    <span
                        key={s.name}
                        className="devhub-langbar__seg"
                        style={{
                            width: `${s.pct}%`,
                            background: s.color ?? NEUTRAL_LANGUAGE_COLOR,
                        }}
                    />
                ))}
            </div>

            {showLabels && (
                <ul className="devhub-langbar__legend">
                    {shares.map((s) => (
                        <li key={s.name} className="devhub-langbar__item">
                            <span
                                className="devhub-langbar__dot"
                                style={{
                                    background:
                                        s.color ?? NEUTRAL_LANGUAGE_COLOR,
                                }}
                                aria-hidden="true"
                            />
                            <span>{s.name}</span>
                            <span className="devhub-langbar__pct">
                                {s.pct}%
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
