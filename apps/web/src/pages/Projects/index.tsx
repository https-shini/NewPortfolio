import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import "@/features/devhub/devhub.css";
import { Header } from "@/widgets/Header/Header";
import { Footer } from "@/widgets/Footer/Footer";
import { ScrollUtils } from "@/shared/ui/ScrollUtils";
import { ProjectCard } from "@/features/devhub/components/ProjectCard";
import { CatalogFilters } from "@/features/devhub/components/CatalogFilters";
import { CatalogChips } from "@/features/devhub/components/CatalogChips";
import { CatalogPagination } from "@/features/devhub/components/CatalogPagination";
import { useCatalogState } from "@/features/devhub/useCatalogState";
import {
    DEFAULT_CATALOG,
    SORTS,
    activeFilterCount,
    buildFacets,
    runCatalog,
    type CatalogSort,
} from "@/features/devhub/catalog";
import { Modal } from "@/shared/ui/Modal/Modal";
import { GithubPanorama } from "@/features/devhub/components/panorama/GithubPanorama";
import { useDevhubIndex, useDevhubPinned } from "@/features/devhub/useDevhub";
import { formatDate, formatNumber } from "@/features/devhub/format";
import { useLang } from "@/shared/hooks/useLang";
import { useDocumentMeta } from "@/shared/hooks/useDocumentMeta";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import { useLinkProps } from "@/shared/hooks/useLinkProps";
import { ROUTES } from "@/shared/config/routes";
import { GITHUB_URL } from "@/shared/config/constants";
import { PROFILE } from "@/shared/config/profile";
import {
    IconArrowRight,
    IconFilter,
    IconGitHub,
    IconSearch,
    IconWarning,
} from "@/shared/ui/Icons";
import type { TranslationKey } from "@/shared/lib/translations";

/* ─────────────────────────────────────────────────────────
   /projetos — o DevHub integrado ao portfólio
   ─────────────────────────────────────────────────────────
   Página DO SITE: mesmo Header, mesmo Footer, mesmos tokens.

     hero       → rótulo, título e introdução · painel lateral
     acervo     → busca + ordenação, atalhos (Todos/Fixados/Demo),
                  filtros na lateral (gaveta no mobile), chips,
                  cartões (o mesmo ProjectCard da home) e paginação
     panorama   → métricas do perfil no GitHub (as únicas da página)
     contato    → chamada para conversar

   A antiga seção "Projetos recentes" saiu: o catálogo já abre
   ordenado pelos mais recentes, e ela repetia os mesmos cartões.

   Números e catálogo vêm de UMA coleta (`op=index`) — nunca
   discordam. Os fixados vêm de `op=pinned` (o mesmo cache da home).
───────────────────────────────────────────────────────── */

const ID_TODOS = "todos-os-projetos";

export const ProjectsPage: React.FC = () => {
    const { lang, t } = useLang();
    useReducedMotion();

    useDocumentMeta({
        title: `${t("devhub.title")} — ${PROFILE.name}`,
        description: t("devhub.meta.description"),
        path: ROUTES.PROJECTS,
    });

    const { data, loading, error } = useDevhubIndex();
    const fixadosRemotos = useDevhubPinned();
    const contato = useLinkProps(ROUTES.CONTACT);

    /* Nomes fixados no perfil. Se a API caiu no recorte "recentes"
       (perfil sem fixados), não há fixados de verdade: conjunto vazio. */
    const fixados = useMemo(
        () =>
            new Set(
                fixadosRemotos.data?.source === "pinned"
                    ? fixadosRemotos.data.repositories.map((r) => r.name)
                    : [],
            ),
        [fixadosRemotos.data],
    );

    const { state, update, reset } = useCatalogState();
    const [busca, setBusca] = useState(state.query);
    const [gaveta, setGaveta] = useState(false);
    const temporizador = useRef(0);
    const resultadosRef = useRef<HTMLParagraphElement>(null);

    const repositories = useMemo(
        () => data?.repositories ?? [],
        [data?.repositories],
    );

    /* Debounce da busca: o campo responde a cada tecla; o catálogo
       recalcula na pausa (250 ms). */
    const aoBuscar = (valor: string) => {
        setBusca(valor);
        window.clearTimeout(temporizador.current);
        temporizador.current = window.setTimeout(
            () => update({ query: valor }),
            250,
        );
    };
    useEffect(() => () => window.clearTimeout(temporizador.current), []);

    const resultado = useMemo(
        () => runCatalog(repositories, state, undefined, fixados),
        [repositories, state, fixados],
    );
    const facets = useMemo(
        () => buildFacets(repositories, state, undefined, fixados),
        [repositories, state, fixados],
    );
    /* Atalhos (Todos · Fixados · Com demonstração): recortes rápidos
       sobre a visão padrão, com a contagem de cada um. */
    const base = useMemo(
        () => runCatalog(repositories, DEFAULT_CATALOG, undefined, fixados),
        [repositories, fixados],
    );
    const semDemo = state.features.filter((f) => f !== "demo");
    const atalhos = [
        {
            id: "all",
            label: "catalog.quick.all" as TranslationKey,
            count: base.total,
            ativo: !state.pinnedOnly && !state.features.includes("demo"),
            aplicar: () => update({ pinnedOnly: false, features: semDemo }),
        },
        ...(fixados.size > 0
            ? [
                  {
                      id: "pinned",
                      label: "catalog.quick.pinned" as TranslationKey,
                      count: runCatalog(
                          repositories,
                          { ...DEFAULT_CATALOG, pinnedOnly: true },
                          undefined,
                          fixados,
                      ).total,
                      ativo: state.pinnedOnly,
                      aplicar: () =>
                          update({ pinnedOnly: true, features: semDemo }),
                  },
              ]
            : []),
        {
            id: "demo",
            label: "catalog.quick.demo" as TranslationKey,
            count: runCatalog(
                repositories,
                { ...DEFAULT_CATALOG, features: ["demo"] },
                undefined,
                fixados,
            ).total,
            ativo: state.features.includes("demo") && !state.pinnedOnly,
            aplicar: () =>
                update({ pinnedOnly: false, features: [...semDemo, "demo"] }),
        },
    ];
    const qtdFiltros = activeFilterCount(state);

    const limparTudo = useCallback(() => {
        window.clearTimeout(temporizador.current);
        setBusca("");
        reset();
    }, [reset]);

    /* Trocar de página leva o foco ao topo dos resultados: quem navega
       por teclado ou leitor de tela não fica preso lá embaixo. */
    const irParaPagina = (pagina: number) => {
        update({ page: pagina }, { keepPage: true });
        const alvo = resultadosRef.current;
        if (alvo) {
            alvo.scrollIntoView?.({ block: "start", behavior: "smooth" });
            alvo.focus({ preventScroll: true });
        }
    };

    const rotuloTotal =
        resultado.total === 1
            ? t("catalog.results.one")
            : t("catalog.results").replace(
                  "{n}",
                  formatNumber(resultado.total, lang),
              );
    const rotuloIntervalo = t("catalog.range")
        .replace("{from}", formatNumber(resultado.from, lang))
        .replace("{to}", formatNumber(resultado.to, lang))
        .replace("{total}", formatNumber(resultado.total, lang));

    return (
        <>
            <a href="#main-content" className="skip-link">
                {t("a11y.skipToContent")}
            </a>
            <ScrollUtils label={t("a11y.backToTop")} />
            <Header />

            <main id="main-content" className="devhub pp">
                <header className="pp-hero">
                    <div className="container pp-hero__grid">
                        <div className="pp-hero__main">
                            <p className="section-eyebrow">{t("pp.eyebrow")}</p>
                            <h1 className="pp-hero__title">
                                {t("devhub.title")}
                            </h1>
                            <p className="pp-hero__sub">
                                {t("devhub.subtitle")}
                            </p>
                        </div>
                        <aside
                            className="pp-hero__aside"
                            aria-label={t("pp.aside.eyebrow")}
                        >
                            <p className="pp-hero__aside-eyebrow">
                                {t("pp.aside.eyebrow")}
                            </p>
                            <p className="pp-hero__aside-quote">
                                <span>{t("pp.aside.l1")}</span>
                                <strong>{t("pp.aside.l2")}</strong>
                            </p>
                            <p className="pp-hero__aside-note">
                                <span aria-hidden="true" />
                                {t("pp.aside.note")}
                            </p>
                        </aside>
                    </div>
                </header>

                <div className="container">
                    {error && (
                        <div
                            className="devhub-state devhub-state--error"
                            role="alert"
                        >
                            <IconWarning width={28} height={28} aria-hidden />
                            <h2 className="devhub-state__title">
                                {t("devhub.error.title")}
                            </h2>
                            <p className="devhub-state__desc">
                                {t("devhub.error.desc")}
                            </p>
                            <div className="devhub-state__actions">
                                <button
                                    type="button"
                                    className="btn btn--outline"
                                    onClick={() => window.location.reload()}
                                >
                                    {t("devhub.error.retry")}
                                </button>
                                <a
                                    className="btn btn--outline"
                                    href={GITHUB_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <IconGitHub
                                        width={16}
                                        height={16}
                                        aria-hidden
                                    />
                                    {t("devhub.error.github")}
                                </a>
                            </div>
                        </div>
                    )}

                    {!error && (
                        <section
                            className="catalog"
                            id={ID_TODOS}
                            aria-labelledby="devhub-all"
                        >
                            <div className="pp-explore">
                                <div>
                                    <p className="section-eyebrow">
                                        {t("pp.explore.eyebrow")}
                                    </p>
                                    <h2
                                        className="pp-explore__title"
                                        id="devhub-all"
                                    >
                                        {t("pp.explore.title")}
                                    </h2>
                                </div>
                                {data?.fetchedAt && (
                                    <p className="pp-explore__captured">
                                        {t("pp.explore.captured").replace(
                                            "{date}",
                                            formatDate(data.fetchedAt, lang),
                                        )}
                                    </p>
                                )}
                            </div>

                            <div className="pp-toolbar">
                                <div className="catalog__search" role="search">
                                    <label
                                        htmlFor="catalog-busca"
                                        className="sr-only"
                                    >
                                        {t("devhub.search.label")}
                                    </label>
                                    <IconSearch
                                        className="catalog__search-icon"
                                        width={18}
                                        height={18}
                                        aria-hidden
                                    />
                                    <input
                                        id="catalog-busca"
                                        className="catalog__search-input"
                                        type="search"
                                        value={busca}
                                        onChange={(e) =>
                                            aoBuscar(e.target.value)
                                        }
                                        placeholder={t(
                                            "catalog.search.placeholder",
                                        )}
                                        autoComplete="off"
                                        spellCheck={false}
                                        maxLength={100}
                                    />
                                </div>
                                <label className="catalog__sort">
                                    <span>{t("catalog.sort.label")}</span>
                                    <select
                                        value={state.sort}
                                        onChange={(e) =>
                                            update({
                                                sort: e.target
                                                    .value as CatalogSort,
                                            })
                                        }
                                    >
                                        {SORTS.map((o) => (
                                            <option key={o} value={o}>
                                                {t(
                                                    `catalog.sort.${o}` as TranslationKey,
                                                )}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div
                                className="pp-quick"
                                role="group"
                                aria-label={t("catalog.quick.label")}
                            >
                                {atalhos.map((a) => (
                                    <button
                                        key={a.id}
                                        type="button"
                                        className="pp-quick__pill"
                                        aria-pressed={a.ativo}
                                        onClick={a.aplicar}
                                        disabled={loading}
                                    >
                                        {a.id === "pinned" && (
                                            <span aria-hidden="true">⌖</span>
                                        )}
                                        {t(a.label)}
                                        <span className="pp-quick__count">
                                            {loading
                                                ? "·"
                                                : formatNumber(a.count, lang)}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="catalog__layout">
                                <aside
                                    className="catalog__sidebar"
                                    aria-labelledby="catalog-filtros"
                                >
                                    <div className="catalog__sidebar-head">
                                        <h3
                                            className="catalog__sidebar-title"
                                            id="catalog-filtros"
                                        >
                                            {t("pp.filters.title")}
                                        </h3>
                                        <button
                                            type="button"
                                            className="catalog__sidebar-clear"
                                            onClick={limparTudo}
                                            disabled={
                                                qtdFiltros === 0 && !state.query
                                            }
                                        >
                                            {t("pp.filters.clear")}
                                        </button>
                                    </div>
                                    <CatalogFilters
                                        state={state}
                                        facets={facets}
                                        update={update}
                                    />
                                </aside>

                                <div className="catalog__main">
                                    <div className="catalog__bar">
                                        <p
                                            className="catalog__count"
                                            ref={resultadosRef}
                                            tabIndex={-1}
                                            aria-live="polite"
                                        >
                                            <strong>{rotuloTotal}</strong>
                                            {resultado.total > 0 && (
                                                <span>{rotuloIntervalo}</span>
                                            )}
                                        </p>
                                        <button
                                            type="button"
                                            className="catalog__filters-btn"
                                            aria-haspopup="dialog"
                                            onClick={() => setGaveta(true)}
                                        >
                                            <IconFilter
                                                width={16}
                                                height={16}
                                                aria-hidden
                                            />
                                            {t("catalog.filters")}
                                            {qtdFiltros > 0 && (
                                                <span className="catalog__filters-badge">
                                                    {qtdFiltros}
                                                </span>
                                            )}
                                        </button>
                                        <p
                                            className="catalog__tag"
                                            aria-hidden="true"
                                        >
                                            {t("pp.results.tag")}
                                        </p>
                                    </div>

                                    <CatalogChips
                                        state={state}
                                        update={(m) => {
                                            if ("query" in m) setBusca("");
                                            update(m);
                                        }}
                                        onClearAll={limparTudo}
                                    />

                                    {loading ? (
                                        <Esqueleto
                                            quantidade={6}
                                            rotulo={t("devhub.loading")}
                                        />
                                    ) : resultado.total === 0 ? (
                                        <div
                                            className="devhub-state"
                                            role="status"
                                        >
                                            <h3 className="devhub-state__title">
                                                {t("devhub.empty.title")}
                                            </h3>
                                            <p className="devhub-state__desc">
                                                {t("devhub.empty.desc")}
                                            </p>
                                            <button
                                                type="button"
                                                className="btn btn--outline"
                                                onClick={limparTudo}
                                            >
                                                {t("catalog.filters.clearAll")}
                                            </button>
                                        </div>
                                    ) : (
                                        <ul className="catalog__grid">
                                            {resultado.items.map((repo, i) => (
                                                <li key={repo.id}>
                                                    <ProjectCard
                                                        repo={repo}
                                                        index={i}
                                                        pinned={fixados.has(
                                                            repo.name,
                                                        )}
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Fora de .catalog__main: assim a barra de
                                    filtros termina junto com a última linha
                                    de cartões, e a paginação fica abaixo. */}
                                {!loading && (
                                    <div className="catalog__pager">
                                        <CatalogPagination
                                            page={resultado.page}
                                            pageCount={resultado.pageCount}
                                            onChange={irParaPagina}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Mobile: os mesmos filtros numa gaveta (Modal do
                                projeto: foco preso, Esc fecha, fundo inerte). */}
                            <Modal
                                isOpen={gaveta}
                                onClose={() => setGaveta(false)}
                                labelledBy="catalog-gaveta-titulo"
                                className="catalog-drawer"
                            >
                                <div className="catalog-drawer__head">
                                    <h3 id="catalog-gaveta-titulo">
                                        {t("pp.filters.title")}
                                    </h3>
                                    <button
                                        type="button"
                                        className="catalog-drawer__close"
                                        onClick={() => setGaveta(false)}
                                        aria-label={t("catalog.filters.close")}
                                    >
                                        ×
                                    </button>
                                </div>
                                <div className="catalog-drawer__body">
                                    <CatalogFilters
                                        state={state}
                                        facets={facets}
                                        update={update}
                                    />
                                </div>
                                <div className="catalog-drawer__foot">
                                    <button
                                        type="button"
                                        className="btn btn--outline"
                                        onClick={limparTudo}
                                        disabled={
                                            qtdFiltros === 0 && !state.query
                                        }
                                    >
                                        {t("catalog.filters.clearAll")}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn--primary"
                                        onClick={() => setGaveta(false)}
                                    >
                                        {t("catalog.filters.apply").replace(
                                            "{n}",
                                            formatNumber(resultado.total, lang),
                                        )}
                                    </button>
                                </div>
                            </Modal>
                        </section>
                    )}

                    <GithubPanorama />

                    <section className="pp-cta" aria-labelledby="pp-cta-title">
                        <div>
                            <p className="section-eyebrow">
                                {t("pp.cta.eyebrow")}
                            </p>
                            <h2 className="pp-cta__title" id="pp-cta-title">
                                {t("pp.cta.title")}
                            </h2>
                            <p className="pp-cta__desc">{t("pp.cta.desc")}</p>
                        </div>
                        <a
                            className="btn btn--primary pp-cta__btn"
                            {...contato.anchorProps}
                        >
                            {t("pp.cta.button")}
                            <IconArrowRight
                                width={16}
                                height={16}
                                aria-hidden
                            />
                        </a>
                    </section>
                </div>
            </main>

            <Footer />

            <div
                id="aria-live-region"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            />
        </>
    );
};

/** Grade de cartões-fantasma enquanto o GitHub responde. */
const Esqueleto: React.FC<{ quantidade: number; rotulo: string }> = ({
    quantidade,
    rotulo,
}) => (
    <ul className="devhub-grid" aria-busy="true" aria-label={rotulo}>
        {Array.from({ length: quantidade }, (_, i) => (
            <li key={i} className="devhub-skeleton">
                <span className="devhub-skeleton__thumb" />
                <span className="devhub-skeleton__line" />
                <span className="devhub-skeleton__line devhub-skeleton__line--short" />
            </li>
        ))}
    </ul>
);
