import React from "react";
import { RepoThumb } from "@/features/devhub/components/RepoThumb";
import { LanguageBar } from "@/features/devhub/components/LanguageBar";
import { formatNumber, formatRelativeDate } from "@/features/devhub/format";
import { lastActivity } from "@/features/devhub/selectors";
import {
    NEUTRAL_LANGUAGE_COLOR,
    type Repository,
} from "@/features/devhub/types";
import { projectPath } from "@/shared/config/routes";
import { useLang } from "@/shared/hooks/useLang";
import { useLinkProps } from "@/shared/hooks/useLinkProps";
import {
    IconExternalLink,
    IconGitBranch,
    IconGitHub,
    IconLayers,
    IconLink,
    IconRocket,
    IconStar,
} from "@/shared/ui/Icons";

/* ─────────────────────────────────────────────────────────
   ProjectCard — um repositório na /projetos
   ─────────────────────────────────────────────────────────
   O cartão inteiro é clicável, mas o elemento clicável é só o
   link do título: ele se estica sobre o cartão por CSS
   (`::after` com `inset: 0`). Assim o leitor de tela anuncia UM
   link, com o nome do projeto, e não quatro para o mesmo lugar.

   As ações rápidas (repositório e demonstração) levam para fora,
   ficam acima dessa camada e aparecem também no `:focus-within`,
   para existirem no teclado.
───────────────────────────────────────────────────────── */

interface Props {
    repo: Repository;
    /** Posição na grade — escalona a entrada animada. */
    index?: number;
    /** Nível do título: 3 dentro de uma seção com h2. */
    headingLevel?: 2 | 3;
}

export const ProjectCard: React.FC<Props> = ({
    repo,
    index = 0,
    headingLevel = 3,
}) => {
    const { lang, t } = useLang();
    const { anchorProps } = useLinkProps(projectPath(repo.name));
    const linguagem = repo.primaryLanguage;
    const demo = repo.homepageUrl;
    const Titulo = headingLevel === 2 ? "h2" : "h3";
    const atividade = new Date(lastActivity(repo)).toISOString();

    return (
        <article
            className="devhub-card"
            style={{ "--card-index": index } as React.CSSProperties}
        >
            <div className="devhub-card__thumb">
                <RepoThumb
                    repo={repo}
                    source="cover"
                    className="devhub-card__media"
                />
                <span className="devhub-card__veil" aria-hidden="true" />

                {linguagem && (
                    <span className="devhub-card__lang">
                        <span
                            className="devhub-card__lang-dot"
                            style={{
                                background:
                                    linguagem.color ?? NEUTRAL_LANGUAGE_COLOR,
                            }}
                            aria-hidden="true"
                        />
                        {linguagem.name}
                    </span>
                )}

                {(repo.isArchived || repo.isFork) && (
                    <span className="devhub-card__flags">
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
                    </span>
                )}

                <div className="devhub-card__actions">
                    <a
                        className="devhub-card__icon-btn"
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${t("devhub.card.openRepo")}: ${repo.name}`}
                    >
                        <IconGitHub width={16} height={16} aria-hidden />
                    </a>
                    {demo && (
                        <a
                            className="devhub-card__icon-btn"
                            href={demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${t("devhub.card.openDemo")}: ${repo.name}`}
                        >
                            <IconExternalLink
                                width={16}
                                height={16}
                                aria-hidden
                            />
                        </a>
                    )}
                </div>
            </div>

            <div className="devhub-card__body">
                <Titulo className="devhub-card__title">
                    <a className="devhub-card__link" {...anchorProps}>
                        {repo.name}
                    </a>
                </Titulo>

                <p className="devhub-card__desc">
                    {repo.description ?? (
                        <em className="devhub-card__nodesc">
                            {t("devhub.card.noDescription")}
                        </em>
                    )}
                </p>

                {(demo || repo.hasPages || repo.hasDocs) && (
                    <ul
                        className="devhub-card__badges"
                        aria-label={t("devhub.card.badges")}
                    >
                        {demo && (
                            <li className="devhub-card__badge">
                                <IconRocket
                                    width={12}
                                    height={12}
                                    aria-hidden
                                />
                                {t("devhub.card.badge.demo")}
                            </li>
                        )}
                        {repo.hasPages && !demo && (
                            <li className="devhub-card__badge">
                                <IconLink width={12} height={12} aria-hidden />
                                {t("devhub.card.badge.pages")}
                            </li>
                        )}
                        {repo.hasDocs && (
                            <li className="devhub-card__badge">
                                <IconLayers
                                    width={12}
                                    height={12}
                                    aria-hidden
                                />
                                {t("devhub.card.badge.docs")}
                            </li>
                        )}
                    </ul>
                )}

                {repo.topics.length > 0 && (
                    <ul className="devhub-card__topics">
                        {repo.topics.slice(0, 3).map((topic) => (
                            <li key={topic} className="devhub-chip">
                                {topic}
                            </li>
                        ))}
                        {repo.topics.length > 3 && (
                            <li className="devhub-chip devhub-chip--muted">
                                +{repo.topics.length - 3}
                            </li>
                        )}
                    </ul>
                )}

                <LanguageBar languages={repo.languages} lang={lang} />

                <footer className="devhub-card__footer">
                    <span className="devhub-card__meta">
                        <span className="devhub-card__stat">
                            <IconStar width={12} height={12} aria-hidden />
                            <span className="sr-only">
                                {t("devhub.card.stars")}:
                            </span>
                            {formatNumber(repo.stargazerCount, lang)}
                        </span>
                        <span className="devhub-card__stat">
                            <IconGitBranch width={12} height={12} aria-hidden />
                            <span className="sr-only">
                                {t("devhub.card.forks")}:
                            </span>
                            {formatNumber(repo.forkCount, lang)}
                        </span>
                        <span className="devhub-card__stat">
                            <span className="sr-only">
                                {t("devhub.card.updated")}:
                            </span>
                            <time dateTime={atividade}>
                                {formatRelativeDate(atividade, lang)}
                            </time>
                        </span>
                    </span>
                    <span className="devhub-card__cta" aria-hidden="true">
                        {t("devhub.card.details")}
                        <span className="devhub-card__arrow">→</span>
                    </span>
                </footer>
            </div>
        </article>
    );
};
