import React from "react";
import { useLang } from "@/shared/hooks/useLang";
import type { ReleaseTag } from "@/shared/config/releaseNotes";
import { TAG_LABELS, type ReleaseFilter } from "../ReleaseNotes.types";

interface TagFilterProps {
    tags: ReleaseTag[];
    active: ReleaseFilter;
    onChange: (next: ReleaseFilter) => void;
}

/**
 * TagFilter — chips que refinam o histórico.
 *
 * Botões com `aria-pressed`, não `role="tablist"`: não há painéis
 * alternados aqui, apenas uma lista que se refina. Anunciar abas sem
 * `aria-controls` e navegação por setas confundiria leitores de tela.
 */
export const TagFilter: React.FC<TagFilterProps> = ({
    tags,
    active,
    onChange,
}) => {
    const { t } = useLang();
    if (tags.length === 0) return null;

    const options: ReleaseFilter[] = ["all", ...tags];

    return (
        <div
            className="release-notes__filters"
            role="group"
            aria-label={t("releaseNotes.filterLabel")}
        >
            {options.map((option) => (
                <button
                    key={option}
                    type="button"
                    className={`release-notes__filter${active === option ? " is-active" : ""}`}
                    aria-pressed={active === option}
                    onClick={() => onChange(option)}
                >
                    {option === "all"
                        ? t("releaseNotes.filterAll")
                        : t(TAG_LABELS[option])}
                </button>
            ))}
        </div>
    );
};
