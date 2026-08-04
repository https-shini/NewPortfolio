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
}

/**
 * ChangeList — a camada estruturada de uma versão, no padrão
 * Keep a Changelog. Cada categoria vira um grupo com sua cor
 * própria (verde, indigo, âmbar, crimson), definida no CSS.
 */
export const ChangeList: React.FC<ChangeListProps> = ({ changes }) => {
    const { t, lang } = useLang();
    if (!changes) return null;

    /* Ordem canônica, pulando as categorias vazias. */
    const groups = CHANGE_TYPES.filter(
        (type) => (changes[type]?.length ?? 0) > 0,
    );
    if (groups.length === 0) return null;

    return (
        <div className="release-changes">
            {groups.map((type: ChangeType) => (
                <section
                    key={type}
                    className={`release-changes__group release-changes__group--${type}`}
                >
                    <h4 className="release-changes__label">
                        <span
                            className="release-changes__dot"
                            aria-hidden="true"
                        />
                        {t(CATEGORY_LABELS[type])}
                    </h4>
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
