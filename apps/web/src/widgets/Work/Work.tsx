import React from "react";
import "./Work.css";
import { useLang } from "@/shared/hooks/useLang";
import { useLinkProps } from "@/shared/hooks/useLinkProps";
import { useDevhubPinned } from "@/features/devhub/useDevhub";
import { RepoThumb } from "@/features/devhub/components/RepoThumb";
import {
    formatNumber,
    formatRelativeDate,
    languageShares,
} from "@/features/devhub/format";
import { lastActivity } from "@/features/devhub/selectors";
import {
    NEUTRAL_LANGUAGE_COLOR,
    type Repository,
} from "@/features/devhub/types";
import { GITHUB_URL } from "@/shared/config/constants";
import { ROUTES, projectPath } from "@/shared/config/routes";
import {
    IconArrowRight,
    IconCode,
    IconExternalLink,
    IconGitBranch,
    IconGitHub,
    IconStar,
} from "@/shared/ui/Icons";

/* ─────────────────────────────────────────────────────────
   Work — a vitrine da home (#projetos), em grade "bento"
   ─────────────────────────────────────────────────────────
   Por que não carrossel: quem chega aqui (recrutador ou cliente)
   quer VARRER o trabalho. Um carrossel mostrava 1 de 6 projetos e
   escondia os outros atrás de cliques. A grade mostra os seis
   fixados do GitHub de uma vez, com hierarquia:

     ┌──────────────┬───────┐   desktop (3 colunas)
     │  01  líder   │  02   │   · o 1º fixado é o líder (2×2):
     │  (2 × 2)     ├───────┤     capa grande, stack completa,
     │              │  03   │     tópicos e os três CTAs;
     ├──────┬───────┼───────┤   · os demais são compactos:
     │  04  │  05   │  06   │     capa, nome, descrição curta,
     ├──────┴───────┴───────┤     linguagens e atalhos.
     │  $ ls --all  →  CTA  │   · a última faixa leva ao catálogo.
     └──────────────────────┘

   Tablet: duas colunas (líder na largura toda). Mobile: uma.

   Interação: o card inteiro abre a página do projeto (o link do
   título se estica sobre o card). Demo e código ficam por cima,
   como atalhos próprios — nada de link dentro de link.

   Sem estado, sem JS de navegação: é HTML de lista com CSS grid.
   A ordem é a que o dono escolheu ao fixar no GitHub.
───────────────────────────────────────────────────────── */

const MAX_DESTAQUES = 5;

const pad = (n: number) => String(n).padStart(2, "0");

/* ── Card ─────────────────────────────────────────────────────── */

interface CardProps {
    repo: Repository;
    index: number;
    lead: boolean;
}

const ProjectTile: React.FC<CardProps> = ({ repo, index, lead }) => {
    const { lang, t } = useLang();
    const detalhes = useLinkProps(projectPath(repo.name));
    const tituloId = `project-${repo.id}`;
    const atividade = new Date(lastActivity(repo)).toISOString();
    const tinta = repo.primaryLanguage?.color ?? NEUTRAL_LANGUAGE_COLOR;

    /* Composição medida (bytes por linguagem). Sem medida, só os
       nomes — sem barra e sem porcentagem inventada. */
    const fatias = languageShares(repo.languages);
    const linguagens: { name: string; color: string | null; pct?: number }[] =
        fatias.length > 0
            ? fatias
            : repo.languages.length > 0
              ? repo.languages
              : repo.primaryLanguage
                ? [repo.primaryLanguage]
                : [];
    const fmtPct = new Intl.NumberFormat(lang === "pt" ? "pt-BR" : "en-US", {
        maximumFractionDigits: 1,
    });
    const resumoStack = fatias
        .map((f) => `${f.name} ${fmtPct.format(f.pct)}%`)
        .join(", ");

    /* Tópicos declarados no próprio repositório: dado real, só no
       card líder (nos compactos virariam ruído). */
    const destaques = lead ? repo.topics.slice(0, MAX_DESTAQUES) : [];

    return (
        <article
            className="ptile"
            data-lead={lead || undefined}
            aria-labelledby={tituloId}
            style={{ "--ptile-tint": tinta } as React.CSSProperties}
        >
            <div className="ptile__media">
                <RepoThumb
                    repo={repo}
                    source="showcase"
                    className="ptile__img"
                />
                {repo.homepageUrl && (
                    <span className="ptile__live">
                        <span aria-hidden="true" />
                        {t("devhub.card.badge.demo")}
                    </span>
                )}
            </div>

            <div className="ptile__body">
                <p className="ptile__meta">
                    <span className="ptile__index" aria-hidden="true">
                        {pad(index + 1)}
                    </span>
                    {repo.primaryLanguage && (
                        <span className="ptile__lang">
                            <span
                                className="ptile__dot"
                                style={{ background: tinta }}
                                aria-hidden="true"
                            />
                            {repo.primaryLanguage.name}
                        </span>
                    )}
                    <time className="ptile__time" dateTime={atividade}>
                        {formatRelativeDate(atividade, lang)}
                    </time>
                </p>

                <h3 className="ptile__title" id={tituloId}>
                    {/* O link do título cobre o card inteiro (::after):
                        um alvo grande, um nome acessível só. */}
                    <a className="ptile__link" {...detalhes.anchorProps}>
                        {repo.name}
                    </a>
                </h3>

                <p className="ptile__desc">
                    {repo.description ?? (
                        <em className="ptile__nodesc">
                            {t("work.noDescription")}
                        </em>
                    )}
                </p>

                {linguagens.length > 0 && (
                    <div className="ptile__stack">
                        {lead && fatias.length > 0 && (
                            <span
                                className="ptile__bar"
                                role="img"
                                aria-label={resumoStack}
                            >
                                {fatias.map((f) => (
                                    <span
                                        key={f.name}
                                        style={{
                                            width: `${f.pct}%`,
                                            background:
                                                f.color ??
                                                NEUTRAL_LANGUAGE_COLOR,
                                        }}
                                    />
                                ))}
                            </span>
                        )}
                        <ul
                            className="ptile__langs"
                            aria-label={t("work.block.stack")}
                        >
                            {linguagens.slice(0, lead ? 4 : 3).map((l) => (
                                <li key={l.name} className="ptile__langs-item">
                                    <span
                                        className="ptile__dot"
                                        style={{
                                            background:
                                                l.color ??
                                                NEUTRAL_LANGUAGE_COLOR,
                                        }}
                                        aria-hidden="true"
                                    />
                                    <span className="ptile__langs-name">
                                        {l.name}
                                    </span>
                                    {lead && l.pct !== undefined && (
                                        <span className="ptile__langs-pct">
                                            {fmtPct.format(l.pct)}%
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {destaques.length > 0 && (
                    <ul
                        className="ptile__topics"
                        aria-label={t("work.highlights")}
                    >
                        {destaques.map((topico) => (
                            <li key={topico}>#{topico}</li>
                        ))}
                    </ul>
                )}

                <div className="ptile__foot">
                    <p className="ptile__stats">
                        <span
                            aria-label={`${formatNumber(repo.stargazerCount, lang)} ${t("devhub.detail.stars")}`}
                        >
                            <IconStar width={13} height={13} aria-hidden />
                            {formatNumber(repo.stargazerCount, lang)}
                        </span>
                        {lead && (
                            <span
                                aria-label={`${formatNumber(repo.forkCount, lang)} ${t("devhub.detail.forks")}`}
                            >
                                <IconGitBranch
                                    width={13}
                                    height={13}
                                    aria-hidden
                                />
                                {formatNumber(repo.forkCount, lang)}
                            </span>
                        )}
                        {lead && repo.licenseName && (
                            <span>{repo.licenseName}</span>
                        )}
                    </p>

                    {lead ? (
                        <div className="ptile__actions ptile__actions--lead">
                            {repo.homepageUrl && (
                                <a
                                    href={repo.homepageUrl}
                                    className="work-btn work-btn--primary work-btn--sm"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`${t("work.btn.demo")} — ${repo.name}`}
                                >
                                    {t("work.btn.demo")}
                                    <IconExternalLink
                                        className="work-btn__icon work-btn__icon--go"
                                        width={15}
                                        height={15}
                                        aria-hidden
                                    />
                                </a>
                            )}
                            <a
                                href={repo.url}
                                className="work-btn work-btn--ghost work-btn--sm"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${t("work.btn.code")} — ${repo.name}`}
                            >
                                <IconCode
                                    className="work-btn__icon"
                                    width={15}
                                    height={15}
                                    aria-hidden
                                />
                                {t("work.btn.code")}
                            </a>
                        </div>
                    ) : (
                        <div className="ptile__actions">
                            {repo.homepageUrl && (
                                <a
                                    href={repo.homepageUrl}
                                    className="ptile__action"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`${t("work.btn.demo")} — ${repo.name}`}
                                    title={t("work.btn.demo")}
                                >
                                    <IconExternalLink
                                        width={16}
                                        height={16}
                                        aria-hidden
                                    />
                                </a>
                            )}
                            <a
                                href={repo.url}
                                className="ptile__action"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${t("work.btn.code")} — ${repo.name}`}
                                title={t("work.btn.code")}
                            >
                                <IconCode width={16} height={16} aria-hidden />
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
};

/* ── Esqueleto: mesma grade, sem conteúdo ─────────────────────── */

const Skeleton: React.FC = () => {
    const { t } = useLang();
    return (
        <div
            className="work-grid work-grid--skeleton"
            role="status"
            aria-busy="true"
            aria-label={t("work.loading")}
        >
            {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                    key={i}
                    className="ptile ptile--skeleton"
                    data-lead={i === 0 || undefined}
                    aria-hidden="true"
                >
                    <div className="ptile__media" />
                    <div className="ptile__body">
                        <span className="ptile__skel ptile__skel--short" />
                        <span className="ptile__skel ptile__skel--title" />
                        <span className="ptile__skel" />
                    </div>
                </div>
            ))}
        </div>
    );
};

/* ── Seção ────────────────────────────────────────────────────── */

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
                <header className="work__head">
                    <div className="work__intro">
                        <span className="section-eyebrow">
                            {t("work.eyebrow")}
                        </span>
                        <h2 className="section-title" id="work-title">
                            {t("work.title")}
                        </h2>
                        <p className="work__sub">{t("work.sub")}</p>
                    </div>
                    <p className="work__sync">
                        <span aria-hidden="true" />
                        {t("work.sync")}
                    </p>
                </header>

                {loading && <Skeleton />}

                {!loading && (error || repos.length === 0) && (
                    <p className="work__state" role="status">
                        {t("work.error")}
                    </p>
                )}

                {!loading && repos.length > 0 && (
                    <ul className="work-grid" data-count={repos.length}>
                        {repos.map((repo, i) => (
                            <li key={repo.id} className="work-grid__item">
                                <ProjectTile
                                    repo={repo}
                                    index={i}
                                    lead={i === 0}
                                />
                            </li>
                        ))}
                    </ul>
                )}

                {/* Fechamento: o próximo passo é o acervo inteiro. */}
                <div className="work__more">
                    <p className="work__prompt" aria-hidden="true">
                        <span>$</span> ls ~/projetos --all
                    </p>
                    <div className="work__more-text">
                        <p className="work__more-title">
                            {t("work.moreTitle")}
                        </p>
                        <p className="work__more-desc">{t("work.moreDesc")}</p>
                    </div>
                    <div className="work__more-actions">
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
