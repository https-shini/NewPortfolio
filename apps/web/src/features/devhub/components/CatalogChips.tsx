import React from "react";
import {
    DEFAULT_CATALOG,
    type CatalogState,
    type FeatureFlag,
    type PopularityFlag,
} from "@/features/devhub/catalog";
import { useLang } from "@/shared/hooks/useLang";
import type { TranslationKey } from "@/shared/lib/translations";

/* ─────────────────────────────────────────────────────────
   CatalogChips — os filtros ativos, removíveis um a um
   ─────────────────────────────────────────────────────────
   Cada chip é um botão "Remover filtro: X". A busca também vira
   chip: num catálogo, "por que só vejo 3?" quase sempre é a busca
   esquecida no campo.
───────────────────────────────────────────────────────── */

const FEATURE_LABEL: Record<FeatureFlag, TranslationKey> = {
    readme: "catalog.f.feat.readme",
    docs: "catalog.f.feat.docs",
    license: "catalog.f.feat.license",
    demo: "catalog.f.feat.demo",
    pages: "catalog.f.feat.pages",
};

const POP_LABEL: Record<PopularityFlag, TranslationKey> = {
    stars: "catalog.f.pop.stars",
    forks: "catalog.f.pop.forks",
    watchers: "catalog.f.pop.watchers",
};

interface Chip {
    key: string;
    label: string;
    remover: Partial<CatalogState>;
}

interface Props {
    state: CatalogState;
    update: (mudanca: Partial<CatalogState>) => void;
    onClearAll: () => void;
}

export const CatalogChips: React.FC<Props> = ({
    state,
    update,
    onClearAll,
}) => {
    const { t } = useLang();
    const tituloId = React.useId();
    const sem = <T,>(lista: T[], v: T) => lista.filter((x) => x !== v);

    const chips: Chip[] = [
        ...(state.query.trim()
            ? [
                  {
                      key: "q",
                      label: t("catalog.searchChip").replace(
                          "{q}",
                          state.query.trim(),
                      ),
                      remover: { query: "" },
                  },
              ]
            : []),
        ...state.languages.map((l) => ({
            key: `l-${l}`,
            label: l,
            remover: { languages: sem(state.languages, l) },
        })),
        ...state.topics.map((tp) => ({
            key: `t-${tp}`,
            label: `#${tp}`,
            remover: { topics: sem(state.topics, tp) },
        })),
        ...(state.updatedWithin !== null
            ? [
                  {
                      key: "u",
                      label: `${t("catalog.f.updated")}: ${t(
                          `catalog.f.updated${state.updatedWithin}` as TranslationKey,
                      )}`,
                      remover: { updatedWithin: null },
                  },
              ]
            : []),
        ...state.createdYears.map((y) => ({
            key: `y-${y}`,
            label: `${t("catalog.f.created")}: ${y}`,
            remover: { createdYears: sem(state.createdYears, y) },
        })),
        ...state.popularity.map((p) => ({
            key: `p-${p}`,
            label: t(POP_LABEL[p]),
            remover: { popularity: sem(state.popularity, p) },
        })),
        ...state.features.map((f) => ({
            key: `f-${f}`,
            label: t(FEATURE_LABEL[f]),
            remover: { features: sem(state.features, f) },
        })),
        ...(state.status !== DEFAULT_CATALOG.status
            ? [
                  {
                      key: "s",
                      label: `${t("catalog.f.status")}: ${t(
                          `catalog.f.status.${state.status}` as TranslationKey,
                      )}`,
                      remover: { status: DEFAULT_CATALOG.status },
                  },
              ]
            : []),
        ...(state.includeForks
            ? [
                  {
                      key: "k",
                      label: t("catalog.f.forks"),
                      remover: { includeForks: false },
                  },
              ]
            : []),
        ...(state.pinnedOnly
            ? [
                  {
                      key: "p",
                      label: t("catalog.quick.pinned"),
                      remover: { pinnedOnly: false },
                  },
              ]
            : []),
    ];

    if (chips.length === 0) return null;

    return (
        <div className="catalog-chips" role="group" aria-labelledby={tituloId}>
            <h3 id={tituloId} className="sr-only">
                {t("catalog.filters.active")}
            </h3>
            <ul className="catalog-chips__list">
                {chips.map((c) => (
                    <li key={c.key}>
                        <button
                            type="button"
                            className="catalog-chip"
                            onClick={() => update(c.remover)}
                            aria-label={t("catalog.filters.remove").replace(
                                "{f}",
                                c.label,
                            )}
                        >
                            <span>{c.label}</span>
                            <span
                                className="catalog-chip__x"
                                aria-hidden="true"
                            >
                                ×
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
            <button
                type="button"
                className="catalog-chips__clear"
                onClick={onClearAll}
            >
                {t("catalog.filters.clearAll")}
            </button>
        </div>
    );
};
