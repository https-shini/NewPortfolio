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
    SORTS,
    activeFilterCount,
    buildFacets,
    runCatalog,
    type CatalogSort,
} from "@/features/devhub/catalog";
import { Modal } from "@/shared/ui/Modal/Modal";
import { ProjectMetrics } from "@/features/devhub/components/ProjectMetrics";
import { useDevhubIndex } from "@/features/devhub/useDevhub";
import { recentRepos, repoStats } from "@/features/devhub/selectors";
import { formatNumber } from "@/features/devhub/format";
import { useLang } from "@/shared/hooks/useLang";
import { useDocumentMeta } from "@/shared/hooks/useDocumentMeta";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import { scrollToSection } from "@/shared/lib/smoothScroll";
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
   Página DO SITE: mesmo Header, mesmo Footer, mesmos tokens. A
   ordem responde a três perguntas, da mais rápida à mais funda:

     1. Métricas — o tamanho do acervo, em números do GitHub.
     2. Projetos recentes — no que estou trabalhando agora.
     3. Todos os projetos — a galeria completa, com busca,
        filtros, ordenação e carregamento progressivo.

   Tudo vem de UMA coleta (`op=index`): as métricas e a contagem da
   galeria nunca discordam entre si.
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
        () => runCatalog(repositories, state),
        [repositories, state],
    );
    const facets = useMemo(
        () => buildFacets(repositories, state),
        [repositories, state],
    );
    const recentes = useMemo(() => recentRepos(repositories), [repositories]);
    const stats = useMemo(
        () => (data ? repoStats(repositories, data.followers) : null),
        [data, repositories],
    );
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

            <main id="main-content" className="devhub">
                <header className="devhub-hero">
                    <div className="container">
                        <p className="devhub-hero__eyebrow">
                            {t("devhub.eyebrow")}
                        </p>
                        <h1 className="devhub-hero__title">
                            {t("devhub.title")}
                        </h1>
                        <p className="devhub-hero__sub">
                            {t("devhub.subtitle")}
                        </p>
                        {!error && (
                            <ProjectMetrics
                                stats={stats}
                                fetchedAt={data?.fetchedAt ?? null}
                            />
                        )}
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
                            className="devhub-section"
                            aria-labelledby="devhub-recent"
                        >
                            <div className="devhub-section__head devhub-section__head--split">
                                <div>
                                    <h2
                                        className="devhub-section__title"
                                        id="devhub-recent"
                                    >
                                        {t("devhub.recent.title")}
                                    </h2>
                                    <p className="devhub-section__desc">
                                        {t("devhub.recent.desc")}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn--outline devhub-section__cta"
                                    onClick={() => scrollToSection(ID_TODOS)}
                                    disabled={loading}
                                >
                                    {t("work.viewAll")}
                                    <IconArrowRight
                                        width={16}
                                        height={16}
                                        aria-hidden
                                    />
                                </button>
                            </div>

                            {loading ? (
                                <Esqueleto
                                    quantidade={6}
                                    rotulo={t("devhub.loading")}
                                />
                            ) : (
                                <ul className="devhub-grid">
                                    {recentes.map((repo, i) => (
                                        <li key={repo.id}>
                                            <ProjectCard
                                                repo={repo}
                                                index={i}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    )}

                    {!error && !loading && (
                        <section
                            className="devhub-section catalog"
                            id={ID_TODOS}
                            aria-labelledby="devhub-all"
                        >
                            <div className="catalog__head">
                                <h2
                                    className="devhub-section__title"
                                    id="devhub-all"
                                >
                                    {t("devhub.all.title")}
                                </h2>
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
                            </div>

                            <div className="catalog__layout">
                                <aside
                                    className="catalog__sidebar"
                                    aria-labelledby="catalog-filtros"
                                >
                                    <h3
                                        className="catalog__sidebar-title"
                                        id="catalog-filtros"
                                    >
                                        {t("catalog.filters")}
                                    </h3>
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
                                        <div className="catalog__bar-actions">
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
                                            <label className="catalog__sort">
                                                <span>
                                                    {t("catalog.sort.label")}
                                                </span>
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
                                                        <option
                                                            key={o}
                                                            value={o}
                                                        >
                                                            {t(
                                                                `catalog.sort.${o}` as TranslationKey,
                                                            )}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
                                        </div>
                                    </div>

                                    <CatalogChips
                                        state={state}
                                        update={(m) => {
                                            if ("query" in m) setBusca("");
                                            update(m);
                                        }}
                                        onClearAll={limparTudo}
                                    />

                                    {resultado.total === 0 ? (
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
                                        <ul className="devhub-grid catalog__grid">
                                            {resultado.items.map((repo, i) => (
                                                <li key={repo.id}>
                                                    <ProjectCard
                                                        repo={repo}
                                                        index={i}
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    <CatalogPagination
                                        page={resultado.page}
                                        pageCount={resultado.pageCount}
                                        onChange={irParaPagina}
                                    />
                                </div>
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
                                        {t("catalog.filters")}
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
