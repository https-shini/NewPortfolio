import React from "react";
import "./Work.css";
import { useLang } from "@/shared/hooks/useLang";
import { useLinkProps } from "@/shared/hooks/useLinkProps";
import { useDevhubPinned } from "@/features/devhub/useDevhub";
import { ProjectCard } from "@/features/devhub/components/ProjectCard";
import { displayName } from "@/features/devhub/catalog";
import {
    NEUTRAL_LANGUAGE_COLOR,
    type Repository,
} from "@/features/devhub/types";
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
   Os projetos são os FIXADOS no perfil do GitHub, na ordem escolhida
   lá. A seção tem quatro blocos, do mais visual ao mais direto:

     1. cabeçalho   → eyebrow · título · subtítulo curto
     2. barra       → "06 projetos fixados" + atalho para o GitHub
     3. destaques   → os três primeiros, no cartão único do site
                      (ProjectCard `featured`): capa, tecnologias,
                      "Acessar projeto", "Código" e a documentação
                      expansível
     4. outras      → os demais fixados numa lista enxuta
                      (número, nome, linguagem → página do projeto)
     5. rodapé      → catálogo completo e GitHub

   O cartão é o mesmo do catálogo (/projetos): a home e a página
   falam a mesma língua visual, sem um segundo componente para manter.
───────────────────────────────────────────────────────── */

const DESTAQUES = 3;

const pad = (n: number) => String(n).padStart(2, "0");

const OtherRow: React.FC<{ repo: Repository; index: number }> = ({
    repo,
    index,
}) => {
    const { anchorProps } = useLinkProps(projectPath(repo.name));
    return (
        <li>
            <a className="work-other" {...anchorProps}>
                <span className="work-other__index" aria-hidden="true">
                    {pad(index + 1)}
                </span>
                <span className="work-other__name">
                    {displayName(repo.name)}
                </span>
                {repo.primaryLanguage && (
                    <span className="work-other__lang">
                        <span
                            className="work-other__dot"
                            style={{
                                background:
                                    repo.primaryLanguage.color ??
                                    NEUTRAL_LANGUAGE_COLOR,
                            }}
                            aria-hidden="true"
                        />
                        {repo.primaryLanguage.name}
                    </span>
                )}
                <span className="work-other__arrow" aria-hidden="true">
                    ↗
                </span>
            </a>
        </li>
    );
};

export const Work: React.FC = () => {
    const { t } = useLang();
    const { data, loading, error } = useDevhubPinned();
    const verTodos = useLinkProps(ROUTES.PROJECTS);

    const repos = data?.repositories ?? [];
    const destaques = repos.slice(0, DESTAQUES);
    const outros = repos.slice(DESTAQUES);

    return (
        <section
            id="projetos"
            className="work section"
            aria-labelledby="work-title"
            data-reveal
        >
            <div className="container">
                <header className="work__head section-header">
                    <span className="section-eyebrow">{t("work.eyebrow")}</span>
                    <h2 className="section-title" id="work-title">
                        {t("work.title")}
                    </h2>
                    <p className="section-subtitle work__sub">
                        {t("work.sub")}
                    </p>
                </header>

                <div className="work__bar">
                    <p className="work__count">
                        <strong>{loading ? "··" : pad(repos.length)}</strong>
                        <span>{t("work.pinnedCount")}</span>
                    </p>
                    <a
                        className="work__gh"
                        href={GITHUB_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <IconGitHub width={15} height={15} aria-hidden />
                        {t("work.onGithub")}
                        <IconExternalLink width={12} height={12} aria-hidden />
                    </a>
                </div>

                {loading && (
                    <ul
                        className="work__grid"
                        aria-busy="true"
                        aria-label={t("work.loading")}
                    >
                        {[0, 1, 2].map((i) => (
                            <li
                                key={i}
                                className="work__skeleton"
                                aria-hidden="true"
                            >
                                <span className="work__skeleton-media" />
                                <span className="work__skeleton-line work__skeleton-line--short" />
                                <span className="work__skeleton-line work__skeleton-line--title" />
                                <span className="work__skeleton-line" />
                            </li>
                        ))}
                    </ul>
                )}

                {!loading && (error || repos.length === 0) && (
                    <p className="work__state" role="status">
                        {t("work.error")}
                    </p>
                )}

                {destaques.length > 0 && (
                    <ul className="work__grid">
                        {destaques.map((repo, i) => (
                            <li key={repo.id}>
                                <ProjectCard
                                    repo={repo}
                                    index={i}
                                    variant="featured"
                                />
                            </li>
                        ))}
                    </ul>
                )}

                {outros.length > 0 && (
                    <section
                        className="work__others"
                        aria-labelledby="work-others-title"
                    >
                        <div className="work__others-head">
                            <h3
                                className="section-eyebrow work__others-title"
                                id="work-others-title"
                            >
                                {t("work.others")}
                            </h3>
                            <p className="work__others-sub">
                                {t("work.othersSub")}
                            </p>
                        </div>
                        <ol className="work__others-list" start={DESTAQUES + 1}>
                            {outros.map((repo, i) => (
                                <OtherRow
                                    key={repo.id}
                                    repo={repo}
                                    index={DESTAQUES + i}
                                />
                            ))}
                        </ol>
                    </section>
                )}

                <div className="work__foot">
                    <p className="work__foot-note">{t("work.footNote")}</p>
                    <div className="work__foot-actions">
                        <a
                            className="work-btn work-btn--primary"
                            {...verTodos.anchorProps}
                        >
                            {t("work.viewAll")}
                            <IconArrowRight
                                className="work-btn__icon work-btn__icon--go"
                                width={18}
                                height={18}
                                aria-hidden
                            />
                        </a>
                        <a
                            href={GITHUB_URL}
                            className="work-btn work-btn--ghost"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <IconGitHub
                                className="work-btn__icon"
                                width={18}
                                height={18}
                                aria-hidden
                            />
                            {t("work.more")}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};
