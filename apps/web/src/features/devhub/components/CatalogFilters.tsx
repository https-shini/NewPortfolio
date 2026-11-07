import React, { useId, useState } from "react";
import type {
    ActivityWindow,
    CatalogState,
    FacetOption,
    Facets,
    FeatureFlag,
    PopularityFlag,
    StatusFilter,
} from "@/features/devhub/catalog";
import { useLang } from "@/shared/hooks/useLang";
import type { TranslationKey } from "@/shared/lib/translations";

/* ─────────────────────────────────────────────────────────
   CatalogFilters — o painel de filtros facetados
   ─────────────────────────────────────────────────────────
   O mesmo componente vive na barra lateral (desktop) e dentro da
   gaveta (mobile). Cada grupo é um `<fieldset>` com `<legend>`: o
   leitor de tela anuncia "Linguagem, grupo" antes das opções.

   Multisseleção usa checkbox; escolha única (janela de atividade,
   status) usa rádio — o controle nativo diz ao visitante, antes do
   clique, se a escolha soma ou substitui.

   Toda opção mostra o contador de resultados que teria; opção que
   zera no recorte atual fica esmaecida, mas clicável (desmarcar a
   outra faceta pode reabri-la).
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

const STATUS_LABEL: Record<StatusFilter, TranslationKey> = {
    active: "catalog.f.status.active",
    archived: "catalog.f.status.archived",
    all: "catalog.f.status.all",
};

const WINDOW_LABEL: Record<ActivityWindow, TranslationKey> = {
    30: "catalog.f.updated30",
    90: "catalog.f.updated90",
    365: "catalog.f.updated365",
};

/** Quantas opções um grupo longo mostra antes do "mostrar mais". */
const VISIVEIS = 6;

interface Props {
    state: CatalogState;
    facets: Facets;
    update: (mudanca: Partial<CatalogState>) => void;
}

function alternar<T>(lista: T[], valor: T): T[] {
    return lista.includes(valor)
        ? lista.filter((v) => v !== valor)
        : [...lista, valor];
}

const Contador: React.FC<{ n: number }> = ({ n }) => (
    <span className="catalog-filter__count" aria-hidden="true">
        {n}
    </span>
);

/** Grupo de checkboxes com "mostrar mais" para listas longas. */
function GrupoMarcar<V extends string | number>({
    titulo,
    opcoes,
    rotulo,
    aoAlternar,
}: {
    titulo: string;
    opcoes: FacetOption<V>[];
    rotulo: (v: V) => string;
    aoAlternar: (v: V) => void;
}) {
    const { t } = useLang();
    const [aberto, setAberto] = useState(false);
    const listaId = useId();
    if (opcoes.length === 0) return null;
    /* Opção marcada nunca fica escondida atrás do "mostrar mais". */
    const visiveis = aberto
        ? opcoes
        : opcoes.filter((o, i) => i < VISIVEIS || o.active);
    const restantes = opcoes.length - visiveis.length;

    return (
        <fieldset className="catalog-filter">
            <legend className="catalog-filter__title">{titulo}</legend>
            <ul className="catalog-filter__list" id={listaId}>
                {visiveis.map((o) => (
                    <li key={String(o.value)}>
                        <label
                            className="catalog-filter__option"
                            data-empty={
                                o.count === 0 && !o.active ? "" : undefined
                            }
                        >
                            <input
                                type="checkbox"
                                checked={o.active}
                                onChange={() => aoAlternar(o.value)}
                            />
                            <span className="catalog-filter__label">
                                {rotulo(o.value)}
                            </span>
                            <Contador n={o.count} />
                            <span className="sr-only"> ({o.count})</span>
                        </label>
                    </li>
                ))}
            </ul>
            {(restantes > 0 || aberto) && opcoes.length > VISIVEIS && (
                <button
                    type="button"
                    className="catalog-filter__more"
                    aria-expanded={aberto}
                    aria-controls={listaId}
                    onClick={() => setAberto((v) => !v)}
                >
                    {aberto
                        ? t("catalog.f.showLess")
                        : t("catalog.f.showMore").replace(
                              "{n}",
                              String(restantes),
                          )}
                </button>
            )}
        </fieldset>
    );
}

export const CatalogFilters: React.FC<Props> = ({ state, facets, update }) => {
    const { t } = useLang();
    const nome = useId();

    return (
        <div className="catalog-filters">
            <GrupoMarcar
                titulo={t("catalog.f.languages")}
                opcoes={facets.languages}
                rotulo={(v) => v}
                aoAlternar={(v) =>
                    update({ languages: alternar(state.languages, v) })
                }
            />

            <GrupoMarcar
                titulo={t("catalog.f.topics")}
                opcoes={facets.topics}
                rotulo={(v) => `#${v}`}
                aoAlternar={(v) =>
                    update({ topics: alternar(state.topics, v) })
                }
            />

            <fieldset className="catalog-filter">
                <legend className="catalog-filter__title">
                    {t("catalog.f.updated")}
                </legend>
                <ul className="catalog-filter__list">
                    <li>
                        <label className="catalog-filter__option">
                            <input
                                type="radio"
                                name={`${nome}-janela`}
                                checked={state.updatedWithin === null}
                                onChange={() => update({ updatedWithin: null })}
                            />
                            <span className="catalog-filter__label">
                                {t("catalog.f.updatedAny")}
                            </span>
                        </label>
                    </li>
                    {facets.updatedWithin.map((o) => (
                        <li key={o.value}>
                            <label
                                className="catalog-filter__option"
                                data-empty={
                                    o.count === 0 && !o.active ? "" : undefined
                                }
                            >
                                <input
                                    type="radio"
                                    name={`${nome}-janela`}
                                    checked={o.active}
                                    onChange={() =>
                                        update({ updatedWithin: o.value })
                                    }
                                />
                                <span className="catalog-filter__label">
                                    {t(WINDOW_LABEL[o.value])}
                                </span>
                                <Contador n={o.count} />
                                <span className="sr-only"> ({o.count})</span>
                            </label>
                        </li>
                    ))}
                </ul>
            </fieldset>

            <GrupoMarcar
                titulo={t("catalog.f.created")}
                opcoes={facets.createdYears}
                rotulo={(v) => String(v)}
                aoAlternar={(v) =>
                    update({ createdYears: alternar(state.createdYears, v) })
                }
            />

            <GrupoMarcar
                titulo={t("catalog.f.popularity")}
                opcoes={facets.popularity}
                rotulo={(v) => t(POP_LABEL[v])}
                aoAlternar={(v) =>
                    update({ popularity: alternar(state.popularity, v) })
                }
            />

            <GrupoMarcar
                titulo={t("catalog.f.features")}
                opcoes={facets.features}
                rotulo={(v) => t(FEATURE_LABEL[v])}
                aoAlternar={(v) =>
                    update({ features: alternar(state.features, v) })
                }
            />

            <fieldset className="catalog-filter">
                <legend className="catalog-filter__title">
                    {t("catalog.f.status")}
                </legend>
                <ul className="catalog-filter__list">
                    {facets.status.map((o) => (
                        <li key={o.value}>
                            <label className="catalog-filter__option">
                                <input
                                    type="radio"
                                    name={`${nome}-status`}
                                    checked={o.active}
                                    onChange={() => update({ status: o.value })}
                                />
                                <span className="catalog-filter__label">
                                    {t(STATUS_LABEL[o.value])}
                                </span>
                                <Contador n={o.count} />
                                <span className="sr-only"> ({o.count})</span>
                            </label>
                        </li>
                    ))}
                </ul>
                {facets.forks.available && (
                    <label className="catalog-filter__option catalog-filter__option--toggle">
                        <input
                            type="checkbox"
                            checked={state.includeForks}
                            onChange={(e) =>
                                update({ includeForks: e.target.checked })
                            }
                        />
                        <span className="catalog-filter__label">
                            {t("catalog.f.forks")}
                        </span>
                        <Contador n={facets.forks.count} />
                        <span className="sr-only"> ({facets.forks.count})</span>
                    </label>
                )}
            </fieldset>
        </div>
    );
};
