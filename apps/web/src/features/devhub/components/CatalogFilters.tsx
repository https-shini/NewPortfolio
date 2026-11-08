import React, { useId, useState } from "react";
import {
    DEFAULT_CATALOG,
    normalize,
    type ActivityWindow,
    type CatalogState,
    type FacetOption,
    type Facets,
    type FeatureFlag,
    type PopularityFlag,
    type StatusFilter,
} from "@/features/devhub/catalog";
import { IconChevronDown, IconSearch } from "@/shared/ui/Icons";
import { useLang } from "@/shared/hooks/useLang";
import type { TranslationKey } from "@/shared/lib/translations";

/* ─────────────────────────────────────────────────────────
   CatalogFilters — o painel de filtros facetados
   ─────────────────────────────────────────────────────────
   O mesmo componente vive na barra lateral (desktop) e dentro da
   gaveta (mobile). Cada grupo é um `<fieldset>` com `<legend>`: o
   leitor de tela anuncia "Linguagem, grupo" antes das opções.

   Grupos recolhíveis: os principais (linguagem, tecnologia, último
   push) abrem por padrão; os demais começam recolhidos, salvo se
   houver seleção. Listas longas ganham um campo de busca interno.

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
/** A partir de quantas opções o grupo ganha um campo de busca interno. */
const COM_BUSCA = 8;

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

/**
 * Grupo recolhível. O título é um botão dentro da `<legend>`: o leitor
 * de tela anuncia o grupo e o estado (expandido/recolhido). Grupo com
 * seleção ativa abre sozinho e mostra quantas opções estão marcadas,
 * mesmo recolhido — o filtro aplicado nunca fica escondido.
 */
function Grupo({
    titulo,
    ativos,
    abertoPadrao,
    children,
}: {
    titulo: string;
    ativos: number;
    abertoPadrao: boolean;
    children: React.ReactNode;
}) {
    const { t } = useLang();
    const [aberto, setAberto] = useState(abertoPadrao || ativos > 0);
    const corpoId = useId();
    return (
        <fieldset
            className="catalog-filter"
            data-open={aberto ? "" : undefined}
        >
            <legend className="catalog-filter__legend">
                <button
                    type="button"
                    className="catalog-filter__toggle"
                    aria-expanded={aberto}
                    aria-controls={corpoId}
                    onClick={() => setAberto((v) => !v)}
                >
                    <span className="catalog-filter__title">{titulo}</span>
                    {ativos > 0 && (
                        <span className="catalog-filter__active">
                            {t("catalog.f.selected").replace(
                                "{n}",
                                String(ativos),
                            )}
                        </span>
                    )}
                    <IconChevronDown
                        className="catalog-filter__chevron"
                        width={16}
                        height={16}
                        aria-hidden
                    />
                </button>
            </legend>
            <div className="catalog-filter__body" id={corpoId} hidden={!aberto}>
                {children}
            </div>
        </fieldset>
    );
}

/** Lista de checkboxes com busca interna e "mostrar mais" para listas longas. */
function GrupoMarcar<V extends string | number>({
    titulo,
    opcoes,
    rotulo,
    aoAlternar,
    abertoPadrao = true,
}: {
    titulo: string;
    opcoes: FacetOption<V>[];
    rotulo: (v: V) => string;
    aoAlternar: (v: V) => void;
    abertoPadrao?: boolean;
}) {
    const { t } = useLang();
    const [expandido, setExpandido] = useState(false);
    const [termo, setTermo] = useState("");
    const listaId = useId();
    if (opcoes.length === 0) return null;
    const ativos = opcoes.filter((o) => o.active).length;
    const busca = normalize(termo.trim());
    const filtradas = busca
        ? opcoes.filter((o) => normalize(rotulo(o.value)).includes(busca))
        : opcoes;
    /* Com busca, mostra tudo o que casa; sem busca, as 6 primeiras e as
       marcadas (opção marcada nunca fica atrás do "mostrar mais"). */
    const visiveis =
        expandido || busca
            ? filtradas
            : filtradas.filter((o, i) => i < VISIVEIS || o.active);
    const restantes = filtradas.length - visiveis.length;

    return (
        <Grupo titulo={titulo} ativos={ativos} abertoPadrao={abertoPadrao}>
            {opcoes.length >= COM_BUSCA && (
                <div className="catalog-filter__search">
                    <IconSearch width={14} height={14} aria-hidden />
                    <input
                        type="search"
                        value={termo}
                        onChange={(e) => setTermo(e.target.value)}
                        aria-label={t("catalog.f.searchIn").replace(
                            "{g}",
                            titulo,
                        )}
                        placeholder={t("catalog.f.searchPh")}
                        aria-controls={listaId}
                        autoComplete="off"
                        spellCheck={false}
                    />
                </div>
            )}
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
            {busca && filtradas.length === 0 && (
                <p className="catalog-filter__empty" role="status">
                    {t("catalog.f.noMatch")}
                </p>
            )}
            {!busca &&
                (restantes > 0 || expandido) &&
                opcoes.length > VISIVEIS && (
                    <button
                        type="button"
                        className="catalog-filter__more"
                        aria-expanded={expandido}
                        aria-controls={listaId}
                        onClick={() => setExpandido((v) => !v)}
                    >
                        {expandido
                            ? t("catalog.f.showLess")
                            : t("catalog.f.showMore").replace(
                                  "{n}",
                                  String(restantes),
                              )}
                    </button>
                )}
        </Grupo>
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

            <Grupo
                titulo={t("catalog.f.updated")}
                ativos={state.updatedWithin === null ? 0 : 1}
                abertoPadrao
            >
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
            </Grupo>

            <GrupoMarcar
                abertoPadrao={false}
                titulo={t("catalog.f.created")}
                opcoes={facets.createdYears}
                rotulo={(v) => String(v)}
                aoAlternar={(v) =>
                    update({ createdYears: alternar(state.createdYears, v) })
                }
            />

            <GrupoMarcar
                abertoPadrao={false}
                titulo={t("catalog.f.popularity")}
                opcoes={facets.popularity}
                rotulo={(v) => t(POP_LABEL[v])}
                aoAlternar={(v) =>
                    update({ popularity: alternar(state.popularity, v) })
                }
            />

            <GrupoMarcar
                abertoPadrao={false}
                titulo={t("catalog.f.features")}
                opcoes={facets.features}
                rotulo={(v) => t(FEATURE_LABEL[v])}
                aoAlternar={(v) =>
                    update({ features: alternar(state.features, v) })
                }
            />

            <Grupo
                titulo={t("catalog.f.status")}
                ativos={
                    (state.status === DEFAULT_CATALOG.status ? 0 : 1) +
                    (state.includeForks ? 1 : 0)
                }
                abertoPadrao={false}
            >
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
            </Grupo>
        </div>
    );
};
