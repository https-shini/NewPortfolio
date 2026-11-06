import React, { useMemo } from "react";
import "@/features/devhub/devhub.css";
import { Header } from "@/widgets/Header/Header";
import { Footer } from "@/widgets/Footer/Footer";
import { ScrollUtils } from "@/shared/ui/ScrollUtils";
import { LanguageBar } from "@/features/devhub/components/LanguageBar";
import { ProjectCard } from "@/features/devhub/components/ProjectCard";
import { ProjectStatsGrid } from "@/features/devhub/components/ProjectStatsGrid";
import { DetailTabs, type Tab } from "@/features/devhub/components/DetailTabs";
import { CommitActivity } from "@/features/devhub/components/CommitActivity";
import { RepoStructure } from "@/features/devhub/components/RepoStructure";
import { ReleaseList } from "@/features/devhub/components/ReleaseList";
import {
    useDevhubIndex,
    useDevhubProject,
    useDevhubStats,
} from "@/features/devhub/useDevhub";
import {
    formatDate,
    formatNumber,
    formatRelativeDate,
    languageShares,
} from "@/features/devhub/format";
import {
    ACTIVE_WINDOW_DAYS,
    lastActivity,
    relatedRepos,
    siblingsOf,
} from "@/features/devhub/selectors";
import {
    NEUTRAL_LANGUAGE_COLOR,
    type Repository,
} from "@/features/devhub/types";
import { useLang } from "@/shared/hooks/useLang";
import { useLinkProps } from "@/shared/hooks/useLinkProps";
import { useDocumentMeta } from "@/shared/hooks/useDocumentMeta";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import { ROUTES, projectPath } from "@/shared/config/routes";
import { PROFILE } from "@/shared/config/profile";
import {
    IconArrowLeft,
    IconArrowRight,
    IconExternalLink,
    IconGitHub,
    IconLayers,
    IconLink,
} from "@/shared/ui/Icons";
import type { TranslationKey } from "@/shared/lib/translations";

/* ─────────────────────────────────────────────────────────
   /projetos/:nome — um repositório em detalhe
   ─────────────────────────────────────────────────────────
   O README é o conteúdo principal, e chega do servidor já
   convertido e SANITIZADO (api/_devhub-markdown.ts +
   api/_devhub-sanitize.ts: allowlist de tags, atributos e URLs
   conferidos). Por isso o `dangerouslySetInnerHTML` abaixo não é
   o risco que o nome sugere — a string nunca passou por um
   caminho onde HTML de terceiro sobrevivesse sem reescrita.
───────────────────────────────────────────────────────── */

interface Props {
    name: string;
}

const MS_DIA = 86_400_000;

type Status = "active" | "idle" | "archived";

const STATUS_LABEL: Record<Status, TranslationKey> = {
    active: "devhub.detail.status.active",
    idle: "devhub.detail.status.idle",
    archived: "devhub.detail.status.archived",
};

function statusDe(repo: Repository): Status {
    if (repo.isArchived) return "archived";
    const dias = (Date.now() - lastActivity(repo)) / MS_DIA;
    return dias <= ACTIVE_WINDOW_DAYS ? "active" : "idle";
}

const SiblingLink: React.FC<{
    repo: Repository;
    direction: "previous" | "next";
}> = ({ repo, direction }) => {
    const { t } = useLang();
    const { anchorProps } = useLinkProps(projectPath(repo.name));
    const anterior = direction === "previous";

    return (
        <a
            className="devhub-sibling"
            data-direction={direction}
            {...anchorProps}
        >
            {anterior && <IconArrowLeft width={16} height={16} aria-hidden />}
            <span className="devhub-sibling__text">
                <span className="devhub-sibling__label">
                    {anterior
                        ? t("devhub.detail.previous")
                        : t("devhub.detail.next")}
                </span>
                <span className="devhub-sibling__name">{repo.name}</span>
            </span>
            {!anterior && <IconArrowRight width={16} height={16} aria-hidden />}
        </a>
    );
};

/** Endereço do GitHub Pages de um repositório do perfil. */
function pagesUrl(repo: Repository): string {
    const dono = PROFILE.githubUsername.toLowerCase();
    return repo.name.toLowerCase() === `${dono}.github.io`
        ? `https://${dono}.github.io/`
        : `https://${dono}.github.io/${repo.name}/`;
}

/** Conteúdo de uma aba que depende de `op=stats`. */
const ComStats: React.FC<{
    loading: boolean;
    ok: boolean;
    children: () => React.ReactNode;
}> = ({ loading, ok, children }) => {
    const { t } = useLang();
    if (loading) {
        return (
            <div className="devhub-detail__loading" aria-busy="true">
                <span className="devhub-skeleton__line" />
                <span className="devhub-skeleton__line devhub-skeleton__line--short" />
                <span className="sr-only">{t("devhub.stats.loading")}</span>
            </div>
        );
    }
    if (!ok) {
        return (
            <p className="devhub-empty">{t("devhub.stats.unavailableNote")}</p>
        );
    }
    return <>{children()}</>;
};

/** Moldura comum aos estados — mesmo Header e Footer em todos. */
const Moldura: React.FC<{ busy?: boolean; children: React.ReactNode }> = ({
    busy,
    children,
}) => {
    const { t } = useLang();
    return (
        <>
            <a href="#main-content" className="skip-link">
                {t("a11y.skipToContent")}
            </a>
            <ScrollUtils label={t("a11y.backToTop")} />
            <Header />
            <main
                id="main-content"
                className="devhub devhub-detail"
                aria-busy={busy || undefined}
            >
                {children}
            </main>
            <Footer />
        </>
    );
};

export const ProjectPage: React.FC<Props> = ({ name }) => {
    const { lang, t } = useLang();
    useReducedMotion();

    const { data: repo, loading, error } = useDevhubProject(name);
    const indice = useDevhubIndex();
    const estat = useDevhubStats(name);
    const voltar = useLinkProps(ROUTES.PROJECTS);

    const { previous, next } = useMemo(
        () =>
            indice.data
                ? siblingsOf(indice.data.repositories, name)
                : { previous: null, next: null },
        [indice.data, name],
    );

    const relacionados = useMemo(
        () =>
            indice.data && repo
                ? relatedRepos(indice.data.repositories, repo)
                : [],
        [indice.data, repo],
    );

    useDocumentMeta({
        title: repo
            ? `${repo.name} — ${t("devhub.title")} · ${PROFILE.name}`
            : `${t("devhub.title")} — ${PROFILE.name}`,
        description: repo?.description ?? t("devhub.meta.description"),
        path: projectPath(name),
        /* Projeto inexistente (ou erro) não entra no índice. `follow`
           porque os links daqui levam de volta à galeria. */
        robots: !loading && !repo ? "noindex, follow" : undefined,
    });

    if (loading) {
        return (
            <Moldura busy>
                <div className="container devhub-detail__loading">
                    <span className="devhub-skeleton__line devhub-skeleton__line--title" />
                    <span className="devhub-skeleton__line" />
                    <span className="devhub-skeleton__line devhub-skeleton__line--short" />
                    <span className="sr-only">{t("devhub.loading")}</span>
                </div>
            </Moldura>
        );
    }

    if (error || !repo) {
        return (
            <Moldura>
                <div className="container">
                    <div
                        className={`devhub-state${error ? " devhub-state--error" : ""}`}
                        role={error ? "alert" : "status"}
                    >
                        <h1 className="devhub-state__title">
                            {error
                                ? t("devhub.error.title")
                                : t("devhub.notFound.title")}
                        </h1>
                        <p className="devhub-state__desc">
                            {error ? (
                                t("devhub.error.desc")
                            ) : (
                                <>
                                    <code>{name}</code>{" "}
                                    {t("devhub.notFound.desc")}
                                </>
                            )}
                        </p>
                        <a className="btn btn--outline" {...voltar.anchorProps}>
                            {t("devhub.notFound.back")}
                        </a>
                    </div>
                </div>
            </Moldura>
        );
    }

    const linguagem = repo.primaryLanguage;
    const status = statusDe(repo);
    const atividade = new Date(lastActivity(repo)).toISOString();
    const temLinguagens = languageShares(repo.languages).length > 0;
    const temPagesNaDemo = /\.github\.io(\/|$)/i.test(repo.homepageUrl ?? "");
    const stats = estat.data;
    const okStats = Boolean(stats);

    const readme = repo.readmeHtml ? (
        /* Seguro por construção — ver o comentário do topo. */
        <div
            className="devhub-readme__body"
            dangerouslySetInnerHTML={{ __html: repo.readmeHtml }}
        />
    ) : (
        <div className="devhub-state" role="status">
            <h3 className="devhub-state__title">
                {t("devhub.detail.noReadme")}
            </h3>
            <p className="devhub-state__desc">
                {t("devhub.detail.noReadmeDesc")}
            </p>
            <a
                className="btn btn--outline"
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
            >
                {t("devhub.detail.viewOnGithub")}
            </a>
        </div>
    );

    const abas: Tab[] = [
        { id: "readme", label: t("devhub.tabs.readme"), content: readme },
        {
            id: "activity",
            label: t("devhub.tabs.activity"),
            content: (
                <ComStats loading={estat.loading} ok={okStats}>
                    {() => stats && <CommitActivity stats={stats} />}
                </ComStats>
            ),
        },
        {
            id: "structure",
            label: t("devhub.tabs.structure"),
            content: (
                <ComStats loading={estat.loading} ok={okStats}>
                    {() =>
                        stats && <RepoStructure repo={repo} tree={stats.tree} />
                    }
                </ComStats>
            ),
        },
        {
            id: "releases",
            label: t("devhub.tabs.releases"),
            badge: stats ? formatNumber(stats.releases.total, lang) : undefined,
            content: (
                <ComStats loading={estat.loading} ok={okStats}>
                    {() =>
                        stats && (
                            <ReleaseList
                                repo={repo}
                                releases={stats.releases}
                            />
                        )
                    }
                </ComStats>
            ),
        },
    ];

    const estatisticas: { label: string; value: React.ReactNode }[] = [
        {
            label: t("devhub.detail.status"),
            value: (
                <span className="devhub-status" data-status={status}>
                    {t(STATUS_LABEL[status])}
                </span>
            ),
        },
        {
            label: t("devhub.detail.lastPush"),
            value: (
                <time dateTime={atividade} title={formatDate(atividade, lang)}>
                    {formatRelativeDate(atividade, lang)}
                </time>
            ),
        },
        {
            label: t("devhub.detail.created"),
            value: (
                <time dateTime={repo.createdAt}>
                    {formatDate(repo.createdAt, lang)}
                </time>
            ),
        },
        ...(repo.defaultBranch
            ? [
                  {
                      label: t("devhub.detail.branch"),
                      value: <code>{repo.defaultBranch}</code>,
                  },
              ]
            : []),
        ...(repo.licenseName
            ? [{ label: t("devhub.detail.license"), value: repo.licenseName }]
            : []),
    ];

    return (
        <Moldura>
            <div className="devhub-detail__banner">
                {repo.cover && (
                    <span
                        className="devhub-detail__banner-media"
                        style={{
                            backgroundImage: `url(${JSON.stringify(repo.cover.url)})`,
                        }}
                        aria-hidden="true"
                    />
                )}
                <span className="devhub-detail__veil" aria-hidden="true" />

                <div className="container">
                    <nav
                        className="devhub-crumb"
                        aria-label={t("devhub.detail.breadcrumb")}
                    >
                        <a {...voltar.anchorProps}>{t("devhub.title")}</a>
                        <span aria-hidden="true">›</span>
                        <span aria-current="page">{repo.name}</span>
                    </nav>

                    <div className="devhub-detail__grid">
                        <div className="devhub-detail__head">
                            <div className="devhub-detail__flags">
                                {linguagem && (
                                    <span className="devhub-chip">
                                        <span
                                            className="devhub-card__lang-dot"
                                            style={{
                                                background:
                                                    linguagem.color ??
                                                    NEUTRAL_LANGUAGE_COLOR,
                                            }}
                                            aria-hidden="true"
                                        />
                                        {linguagem.name}
                                    </span>
                                )}
                                {repo.isArchived && (
                                    <span className="devhub-chip devhub-chip--warn">
                                        {t("devhub.card.archived")}
                                    </span>
                                )}
                                {repo.isFork && (
                                    <span className="devhub-chip">
                                        {t("devhub.card.fork")}
                                    </span>
                                )}
                            </div>

                            <h1 className="devhub-detail__title">
                                {repo.name}
                            </h1>

                            {repo.description && (
                                <p className="devhub-detail__desc">
                                    {repo.description}
                                </p>
                            )}

                            {repo.topics.length > 0 && (
                                <ul
                                    className="devhub-detail__topics"
                                    aria-label={t("devhub.detail.topics")}
                                >
                                    {repo.topics.map((topic) => (
                                        <li
                                            key={topic}
                                            className="devhub-chip devhub-chip--muted"
                                        >
                                            #{topic}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="devhub-detail__actions">
                                <a
                                    className="btn btn--outline"
                                    href={repo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <IconGitHub
                                        width={16}
                                        height={16}
                                        aria-hidden
                                    />
                                    {t("devhub.detail.viewOnGithub")}
                                </a>
                                {repo.hasDocs && (
                                    <a
                                        className="btn btn--outline"
                                        href={`${repo.url}/tree/${encodeURIComponent(repo.defaultBranch ?? "HEAD")}/docs`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <IconLayers
                                            width={16}
                                            height={16}
                                            aria-hidden
                                        />
                                        {t("devhub.detail.docs")}
                                    </a>
                                )}
                                {repo.hasPages && !temPagesNaDemo && (
                                    <a
                                        className="btn btn--outline"
                                        href={pagesUrl(repo)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <IconLink
                                            width={16}
                                            height={16}
                                            aria-hidden
                                        />
                                        {t("devhub.detail.pages")}
                                    </a>
                                )}
                                {repo.homepageUrl && (
                                    <a
                                        className="btn btn--primary"
                                        href={repo.homepageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {t("devhub.detail.liveDemo")}
                                        <IconExternalLink
                                            width={14}
                                            height={14}
                                            aria-hidden
                                        />
                                    </a>
                                )}
                            </div>
                        </div>

                        <aside
                            className="devhub-stats"
                            aria-labelledby="devhub-activity"
                        >
                            <h2
                                id="devhub-activity"
                                className="devhub-stats__title"
                            >
                                {t("devhub.detail.activity")}
                            </h2>
                            <dl className="devhub-stats__list">
                                {estatisticas.map((s) => (
                                    <div
                                        key={s.label}
                                        className="devhub-stats__row"
                                    >
                                        <dt className="devhub-stats__label">
                                            {s.label}
                                        </dt>
                                        <dd className="devhub-stats__value">
                                            {s.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>

                            {temLinguagens && (
                                <div className="devhub-stats__langs">
                                    <h3 className="devhub-stats__label">
                                        {t("devhub.detail.languages")}
                                    </h3>
                                    <LanguageBar
                                        languages={repo.languages}
                                        lang={lang}
                                        showLabels
                                        height={8}
                                    />
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </div>

            <div className="container">
                <ProjectStatsGrid
                    repo={repo}
                    stats={stats}
                    loading={estat.loading}
                />

                <section
                    className="devhub-detail__content"
                    aria-labelledby="devhub-content-title"
                >
                    <h2 id="devhub-content-title" className="sr-only">
                        {t("devhub.tabs.label")}
                    </h2>
                    <DetailTabs label={t("devhub.tabs.label")} tabs={abas} />
                </section>

                {relacionados.length > 0 && (
                    <section
                        className="devhub-section devhub-related"
                        aria-labelledby="devhub-related-title"
                    >
                        <h2
                            id="devhub-related-title"
                            className="devhub-section__title"
                        >
                            {t("devhub.related.title")}
                        </h2>
                        <p className="devhub-section__desc">
                            {t("devhub.related.desc")}
                        </p>
                        <ul className="devhub-grid">
                            {relacionados.map((r, i) => (
                                <li key={r.name}>
                                    <ProjectCard repo={r} index={i} />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {(previous || next) && (
                    <nav
                        className="devhub-siblings"
                        aria-label={t("devhub.detail.siblings")}
                    >
                        {previous && (
                            <SiblingLink repo={previous} direction="previous" />
                        )}
                        {next && <SiblingLink repo={next} direction="next" />}
                    </nav>
                )}
            </div>
        </Moldura>
    );
};
