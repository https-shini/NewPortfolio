import React, { useCallback, useMemo, useState } from "react";
import "@/features/devhub/devhub.css";
import { Header } from "@/widgets/Header/Header";
import { Footer } from "@/widgets/Footer/Footer";
import { ScrollUtils } from "@/shared/ui/ScrollUtils";
import { ProjectCard } from "@/features/devhub/components/ProjectCard";
import { DevhubToolbar } from "@/features/devhub/components/DevhubToolbar";
import { ProjectMetrics } from "@/features/devhub/components/ProjectMetrics";
import { useDevhubIndex } from "@/features/devhub/useDevhub";
import {
    GALLERY_PAGE_SIZE,
    availableLanguages,
    filterAndSort,
    recentRepos,
    repoStats,
} from "@/features/devhub/selectors";
import { formatNumber } from "@/features/devhub/format";
import { DEFAULT_FILTERS, type ProjectFilters } from "@/features/devhub/types";
import { useLang } from "@/shared/hooks/useLang";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useDocumentMeta } from "@/shared/hooks/useDocumentMeta";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import { scrollToSection } from "@/shared/lib/smoothScroll";
import { ROUTES } from "@/shared/config/routes";
import { GITHUB_URL } from "@/shared/config/constants";
import { PROFILE } from "@/shared/config/profile";
import { IconArrowRight, IconGitHub, IconWarning } from "@/shared/ui/Icons";

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

    const [filters, setFilters] = useState<ProjectFilters>(DEFAULT_FILTERS);
    const [searchInput, setSearchInput] = useState("");
    const [limite, setLimite] = useState(GALLERY_PAGE_SIZE);
    const search = useDebouncedValue(searchInput, 250);

    const repositories = useMemo(
        () => data?.repositories ?? [],
        [data?.repositories],
    );

    /* A busca entra aqui, e não no estado: o campo responde a cada tecla
       enquanto o recálculo espera a pausa. */
    const applied = useMemo<ProjectFilters>(
        () => ({ ...filters, search }),
        [filters, search],
    );

    const visible = useMemo(
        () => filterAndSort(repositories, applied),
        [repositories, applied],
    );
    const recentes = useMemo(() => recentRepos(repositories), [repositories]);
    const stats = useMemo(
        () => (data ? repoStats(repositories, data.followers) : null),
        [data, repositories],
    );
    const languages = useMemo(
        () => availableLanguages(repositories),
        [repositories],
    );

    /* Mudar um filtro volta a galeria para a primeira "página": revelar
       24 resultados de uma busca nova, porque a anterior tinha sido
       expandida, esconderia que o recorte mudou. */
    const setFilter = useCallback(
        <K extends keyof ProjectFilters>(key: K, value: ProjectFilters[K]) => {
            setFilters((prev) => ({ ...prev, [key]: value }));
            setLimite(GALLERY_PAGE_SIZE);
        },
        [],
    );

    const onSearchChange = useCallback((value: string) => {
        setSearchInput(value);
        setLimite(GALLERY_PAGE_SIZE);
    }, []);

    const reset = useCallback(() => {
        setFilters(DEFAULT_FILTERS);
        setSearchInput("");
        setLimite(GALLERY_PAGE_SIZE);
    }, []);

    const mostrados = visible.slice(0, limite);
    const restam = visible.length - mostrados.length;
    const contagem = t("devhub.showing")
        .replace("{shown}", formatNumber(mostrados.length, lang))
        .replace("{total}", formatNumber(visible.length, lang));

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
                            className="devhub-section"
                            id={ID_TODOS}
                            aria-labelledby="devhub-all"
                        >
                            <div className="devhub-section__head">
                                <h2
                                    className="devhub-section__title"
                                    id="devhub-all"
                                >
                                    {t("devhub.all.title")}
                                </h2>
                            </div>

                            <DevhubToolbar
                                filters={applied}
                                searchInput={searchInput}
                                onSearchChange={onSearchChange}
                                onChange={setFilter}
                                onReset={reset}
                                languages={languages}
                            />

                            <p className="devhub-count" aria-live="polite">
                                {contagem}
                            </p>

                            {visible.length === 0 ? (
                                <div className="devhub-state" role="status">
                                    <h3 className="devhub-state__title">
                                        {t("devhub.empty.title")}
                                    </h3>
                                    <p className="devhub-state__desc">
                                        {t("devhub.empty.desc")}
                                    </p>
                                    <button
                                        type="button"
                                        className="btn btn--outline"
                                        onClick={reset}
                                    >
                                        {t("devhub.filters.reset")}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <ul className="devhub-grid">
                                        {mostrados.map((repo, i) => (
                                            <li key={repo.id}>
                                                <ProjectCard
                                                    repo={repo}
                                                    index={
                                                        i % GALLERY_PAGE_SIZE
                                                    }
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                    {restam > 0 && (
                                        <div className="devhub-more">
                                            <button
                                                type="button"
                                                className="btn btn--outline"
                                                onClick={() =>
                                                    setLimite(
                                                        (n) =>
                                                            n +
                                                            GALLERY_PAGE_SIZE,
                                                    )
                                                }
                                            >
                                                {t("devhub.loadMore")} (
                                                {formatNumber(restam, lang)})
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
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
