import React from "react";
import { useLang } from "@/shared/hooks/useLang";
import {
    CHANGE_TYPES,
    type ChangeType,
    type ReleaseEntry,
} from "@/shared/config/releaseNotes";
import { CATEGORY_LABELS } from "../ReleaseNotes.types";

interface ChangeListProps {
    changes: ReleaseEntry["changes"];
    /**
     * Nível dos rótulos de categoria. Acompanha o título que vem acima
     * — ver a nota sobre `headingLevel` em ReleaseNotes.tsx.
     */
    headingLevel?: number;
    /**
     * `grade` — colunas lado a lado, para o cartão em destaque do índice.
     * `editorial` — empilhado, com filete colorido à esquerda, para a
     * página da versão, onde a lista é o conteúdo principal e não um
     * resumo.
     */
    variant?: "grade" | "editorial";
}

/**
 * ChangeList — a camada estruturada de uma versão. Cada categoria vira
 * um grupo com cor, glifo e rótulo próprios: a cor separa à distância,
 * o glifo separa sem depender de cor, e o rótulo diz o que é.
 */
export const ChangeList: React.FC<ChangeListProps> = ({
    changes,
    headingLevel = 4,
    variant = "grade",
}) => {
    const { t, lang } = useLang();
    const Label = `h${headingLevel}` as "h3" | "h4";
    if (!changes) return null;

    /* Ordem canônica, pulando as categorias vazias. */
    const groups = CHANGE_TYPES.filter(
        (type) => (changes[type]?.length ?? 0) > 0,
    );
    if (groups.length === 0) return null;

    return (
        <div className={`release-changes release-changes--${variant}`}>
            {groups.map((type: ChangeType) => (
                <section
                    key={type}
                    className={`release-changes__group release-changes__group--${type}`}
                >
                    <Label className="release-changes__label">
                        {/* Decorativo: o rótulo ao lado já diz a categoria,
                            e soletrar "sinal de mais" não acrescenta nada
                            a quem ouve. */}
                        <span
                            className="release-changes__glyph"
                            aria-hidden="true"
                        >
                            {CATEGORY_LABELS[type].glyph}
                        </span>
                        {t(CATEGORY_LABELS[type].label)}
                    </Label>
                    <ul className="release-changes__list">
                        {changes[type]!.map((item, i) => (
                            <li key={i} className="release-changes__item">
                                {item[lang]}
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
};
