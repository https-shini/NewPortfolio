import React from "react";
import "./Work.css";
import { useLang } from "@/shared/hooks/useLang";
import { useLinkProps } from "@/shared/hooks/useLinkProps";
import { useDevhubPinned } from "@/features/devhub/useDevhub";
import { RepoThumb } from "@/features/devhub/components/RepoThumb";
import type { Repository } from "@/features/devhub/types";
import { GITHUB_URL } from "@/shared/config/constants";
import { ROUTES, projectPath } from "@/shared/config/routes";
import {
    IconArrowRight,
    IconExternalLink,
    IconGitHub,
} from "@/shared/ui/Icons";

/* ─────────────────────────────────────────────────────────
   Work — a vitrine da home (#projetos)
   ─────────────────────────────────────────────────────────
   Os cards são os repositórios FIXADOS no perfil do GitHub
   ("Customize your pins"), na ordem escolhida lá. Trocar a
   seleção no GitHub troca a home — sem mudar código. O cache da
   CDN (1 h) define quanto tempo a mudança leva para aparecer.

   Antes eram três projetos digitados aqui, com print e texto em
   PT/EN. A troca foi decidida: o GitHub é a fonte de verdade, e a
   descrição passa a ser a do repositório (um idioma só).

   A identidade visual dos cards é a mesma (`.work-card`); a
   imagem é o social card do GitHub, com o nome do repositório
   sobre a cor da linguagem quando ela não existe.
───────────────────────────────────────────────────────── */

const QTD_ESQUELETO = 6;
const BADGE_VARIANTS = ["brand", "accent", "neutral"] as const;

const WorkCard: React.FC<{ repo: Repository; index: number }> = ({
    repo,
    index,
}) => {
    const { t } = useLang();
    const detalhes = useLinkProps(projectPath(repo.name));
    const tituloId = `project-${repo.id}`;

    /* Até três linguagens, das maiores para as menores; sem divisão
       medida, fica a primária. */
    const linguagens = (
        repo.languages.length > 0
            ? repo.languages
            : repo.primaryLanguage
              ? [repo.primaryLanguage]
              : []
    ).slice(0, 3);

    return (
        <article
            className="work-card"
            aria-labelledby={tituloId}
            style={{ ["--card-index" as string]: index }}
        >
            <div className="work-card__thumb">
                <RepoThumb repo={repo} className="work-card__media" />
                <span className="work-card__thumb-grad" aria-hidden="true" />
            </div>

            <div className="work-card__body">
                <h3 className="work-card__title" id={tituloId}>
                    {repo.name}
                </h3>

                <p className="work-card__desc">
                    {repo.description ?? (
                        <em className="work-card__nodesc">
                            {t("work.noDescription")}
                        </em>
                    )}
                </p>

                {linguagens.length > 0 && (
                    <ul
                        className="work-card__tech"
                        aria-label={t("work.block.stack")}
                    >
                        {linguagens.map((l, i) => (
                            <li
                                key={l.name}
                                className={`badge badge--${BADGE_VARIANTS[i % BADGE_VARIANTS.length]}`}
                            >
                                {l.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="work-card__footer">
                <a
                    className="work-btn work-btn--primary"
                    {...detalhes.anchorProps}
                    aria-label={`${t("work.btn.details")} — ${repo.name}`}
                >
                    <IconArrowRight width={14} height={14} aria-hidden="true" />
                    {t("work.btn.details")}
                </a>

                {repo.homepageUrl ? (
                    <a
                        href={repo.homepageUrl}
                        className="work-btn work-btn--outline"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${t("work.btn.demo")} — ${repo.name}`}
                    >
                        <IconExternalLink
                            width={14}
                            height={14}
                            aria-hidden="true"
                        />
                        {t("work.btn.demo")}
                    </a>
                ) : (
                    <a
                        href={repo.url}
                        className="work-btn work-btn--outline"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${t("work.btn.repo")} — ${repo.name}`}
                    >
                        <IconGitHub width={15} height={15} aria-hidden="true" />
                        {t("work.btn.repo")}
                    </a>
                )}
            </div>
        </article>
    );
};

export const Work: React.FC = () => {
    const { t } = useLang();
    const { data, loading, error } = useDevhubPinned();
    const verTodos = useLinkProps(ROUTES.PROJECTS);

    const repos = data?.repositories ?? [];

    return (
        <section
            id="projetos"
            className="work section"
            aria-labelledby="work-title"
            data-reveal
        >
            <div className="container">
                <header className="section-header">
                    <span className="section-eyebrow">{t("work.eyebrow")}</span>
                    <h2 className="section-title" id="work-title">
                        {t("work.title")}
                    </h2>
                    <p className="section-subtitle">{t("work.sub")}</p>
                    <p className="work__note">{t("work.sub2")}</p>
                </header>

                {loading && (
                    <ul
                        className="work__grid"
                        aria-busy="true"
                        aria-label={t("work.loading")}
                    >
                        {Array.from({ length: QTD_ESQUELETO }, (_, i) => (
                            <li
                                key={i}
                                className="work-card work-card--skeleton"
                                aria-hidden="true"
                            >
                                <span className="work-card__thumb" />
                                <span className="work-card__skel-line" />
                                <span className="work-card__skel-line work-card__skel-line--short" />
                            </li>
                        ))}
                    </ul>
                )}

                {!loading && (error || repos.length === 0) && (
                    <p className="work__state" role="status">
                        {t("work.error")}
                    </p>
                )}

                {!loading && repos.length > 0 && (
                    <ul className="work__grid">
                        {repos.map((repo, i) => (
                            <li key={repo.id} className="work__item">
                                <WorkCard repo={repo} index={i} />
                            </li>
                        ))}
                    </ul>
                )}

                <div className="work__cta">
                    <a className="btn btn--primary" {...verTodos.anchorProps}>
                        {t("work.viewAll")}
                        <IconArrowRight width={16} height={16} aria-hidden />
                    </a>
                    <a
                        href={GITHUB_URL}
                        className="btn btn--outline"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t("work.more")}
                        <IconGitHub width={16} height={16} aria-hidden />
                    </a>
                </div>
            </div>
        </section>
    );
};
