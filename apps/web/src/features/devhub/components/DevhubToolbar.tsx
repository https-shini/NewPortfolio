import React, { useId, useState } from "react";
import {
    SORT_OPTIONS,
    type ProjectFilters,
    type SortOption,
} from "@/features/devhub/types";
import { hasActiveFilters } from "@/features/devhub/selectors";
import { useLang } from "@/shared/hooks/useLang";
import { IconChevronDown, IconFilter, IconSearch } from "@/shared/ui/Icons";
import type { TranslationKey } from "@/shared/lib/translations";

/* ─────────────────────────────────────────────────────────
   DevhubToolbar — busca, ordenação e filtros da galeria
   ─────────────────────────────────────────────────────────
   Dois níveis: busca e ordenação ficam sempre à vista; linguagem,
   forks e arquivados são recortes de quem já sabe o que procura,
   e ficam atrás de um botão.

   Ordenação em `aria-pressed`: alterna um estado da página; um
   grupo de rádio obrigaria navegar por setas sem ganho aqui.
───────────────────────────────────────────────────────── */

const SORT_LABELS: Record<SortOption, TranslationKey> = {
    updated: "devhub.sort.updated",
    stars: "devhub.sort.stars",
    created: "devhub.sort.created",
    name: "devhub.sort.name",
};

const TOGGLES = [
    { key: "showForks", label: "devhub.filters.forks" },
    { key: "showArchived", label: "devhub.filters.archived" },
] as const satisfies readonly {
    key: keyof ProjectFilters;
    label: TranslationKey;
}[];

interface Props {
    filters: ProjectFilters;
    searchInput: string;
    onSearchChange: (value: string) => void;
    onChange: <K extends keyof ProjectFilters>(
        key: K,
        value: ProjectFilters[K],
    ) => void;
    onReset: () => void;
    languages: string[];
}

export const DevhubToolbar: React.FC<Props> = ({
    filters,
    searchInput,
    onSearchChange,
    onChange,
    onReset,
    languages,
}) => {
    const { t } = useLang();
    const [aberto, setAberto] = useState(false);
    const painelId = useId();
    const buscaId = useId();
    const temRecorte = Boolean(
        filters.language || filters.showForks || filters.showArchived,
    );

    return (
        <div className="devhub-toolbar">
            <div className="devhub-toolbar__row">
                <div className="devhub-search">
                    <label htmlFor={buscaId} className="sr-only">
                        {t("devhub.search.label")}
                    </label>
                    <IconSearch
                        className="devhub-search__icon"
                        width={16}
                        height={16}
                        aria-hidden
                    />
                    <input
                        id={buscaId}
                        className="devhub-search__input"
                        type="search"
                        value={searchInput}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={t("devhub.search.placeholder")}
                        autoComplete="off"
                        spellCheck={false}
                    />
                </div>

                <div
                    className="devhub-sort"
                    role="group"
                    aria-label={t("devhub.sort.label")}
                >
                    {SORT_OPTIONS.map((option) => (
                        <button
                            key={option}
                            type="button"
                            className="devhub-pill"
                            aria-pressed={filters.sort === option}
                            onClick={() => onChange("sort", option)}
                        >
                            {t(SORT_LABELS[option])}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    className="devhub-pill devhub-pill--more"
                    aria-expanded={aberto}
                    aria-controls={painelId}
                    data-marked={temRecorte || undefined}
                    onClick={() => setAberto((v) => !v)}
                >
                    <IconFilter width={14} height={14} aria-hidden />
                    {t("devhub.filters.more")}
                    <IconChevronDown
                        className="devhub-pill__chevron"
                        width={14}
                        height={14}
                        aria-hidden
                    />
                </button>

                {hasActiveFilters(filters) && (
                    <button
                        type="button"
                        className="devhub-toolbar__reset"
                        onClick={onReset}
                    >
                        {t("devhub.filters.reset")}
                    </button>
                )}
            </div>

            {/* Sempre no DOM, escondido por atributo: o `aria-controls`
                aponta para algo que existe. */}
            <div className="devhub-panel" id={painelId} hidden={!aberto}>
                {languages.length > 0 && (
                    <div className="devhub-panel__row">
                        <span
                            className="devhub-panel__label"
                            id={`${painelId}-lang`}
                        >
                            {t("devhub.filters.language")}
                        </span>
                        <div
                            className="devhub-panel__options"
                            role="group"
                            aria-labelledby={`${painelId}-lang`}
                        >
                            <button
                                type="button"
                                className="devhub-pill"
                                aria-pressed={!filters.language}
                                onClick={() => onChange("language", "")}
                            >
                                {t("devhub.filters.all")}
                            </button>
                            {languages.map((name) => (
                                <button
                                    key={name}
                                    type="button"
                                    className="devhub-pill"
                                    aria-pressed={filters.language === name}
                                    onClick={() => onChange("language", name)}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="devhub-panel__row">
                    <span
                        className="devhub-panel__label"
                        id={`${painelId}-incl`}
                    >
                        {t("devhub.filters.include")}
                    </span>
                    <div
                        className="devhub-panel__options"
                        role="group"
                        aria-labelledby={`${painelId}-incl`}
                    >
                        {TOGGLES.map(({ key, label }) => (
                            <label key={key} className="devhub-check">
                                <input
                                    type="checkbox"
                                    checked={filters[key]}
                                    onChange={(e) =>
                                        onChange(key, e.target.checked)
                                    }
                                />
                                <span>{t(label)}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
