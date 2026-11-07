import React from "react";
import "./ProjectCard.css";
import { RepoThumb } from "@/features/devhub/components/RepoThumb";
import { displayName } from "@/features/devhub/catalog";
import {
    formatDate,
    formatNumber,
    formatRelativeDate,
    languageShares,
} from "@/features/devhub/format";
import { lastActivity } from "@/features/devhub/selectors";
import {
    NEUTRAL_LANGUAGE_COLOR,
    type Repository,
} from "@/features/devhub/types";
import { projectPath } from "@/shared/config/routes";
import { useLang } from "@/shared/hooks/useLang";
import { useLinkProps } from "@/shared/hooks/useLinkProps";
import {
    IconArrowRight,
    IconCode,
    IconExternalLink,
    IconGitBranch,
    IconStar,
} from "@/shared/ui/Icons";

/* ─────────────────────────────────────────────────────────
   ProjectCard — o cartão de projeto ÚNICO do site
   ─────────────────────────────────────────────────────────
   O mesmo componente na home (#projetos) e no catálogo (/projetos),
   para as duas superfícies falarem a mesma língua visual.

     mídia   → capa real (imagem social própria ou do README); sem
               ela, o social card do GitHub (só na vitrine) ou o
               "prompt" `$ cd ~/repositório`. Selos por cima: Fixado
               (canto superior) e "Aplicação disponível ↗" (link).
     corpo   → meta · título · descrição · tecnologias · números
     ações   → principal: "Conhecer projeto" (página interna);
               secundária: "Ver demo" ou "Ver código" (nova aba)
     detalhes→ (opcional, vitrine) painel expansível nativo
               <details> com stack medida, tópicos e links do README.

   Variantes:
     `featured` — vitrine da home: "01 / PROJETO", chips de
                  tecnologia, ação principal preenchida, detalhes.
     `default`  — catálogo: linguagem + estado, números e data,
                  ação principal com contorno.

   Sem link esticado sobre o cartão: as ações são explícitas e o
   título é o link para a página do projeto — nada de link dentro de
   link, e cada alvo diz o que faz.
───────────────────────────────────────────────────────── */

interface Props {
    repo: Repository;
    /** Posição na lista — "01 / PROJETO" na vitrine. */
    index?: number;
    variant?: "featured" | "default";
    /** Fixado no perfil do GitHub (selo na mídia). */
    pinned?: boolean;
    /** Nível do título: 3 dentro de uma seção com h2. */
    headingLevel?: 2 | 3;
}

const pad = (n: number) => String(n).padStart(2, "0");

export const ProjectCard: React.FC<Props> = ({
    repo,
    index = 0,
    variant = "default",
    pinned = false,
    headingLevel = 3,
}) => {
    const { lang, t } = useLang();
    const detalhes = useLinkProps(projectPath(repo.name));
    const destaque = variant === "featured";
    const Titulo = headingLevel === 2 ? "h2" : "h3";
    const tituloId = `pcard-${repo.id}`;
    const nome = displayName(repo.name);
    const demo = repo.homepageUrl;
    const tinta = repo.primaryLanguage?.color ?? NEUTRAL_LANGUAGE_COLOR;
    const atividade = new Date(lastActivity(repo)).toISOString();

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

    const estado = repo.isArchived
        ? t("devhub.card.archived")
        : repo.isFork
          ? t("devhub.card.fork")
          : t("card.public");

    return (
        <article
            className="pcard"
            data-variant={variant}
            aria-labelledby={tituloId}
            style={{ "--pcard-tint": tinta } as React.CSSProperties}
        >
            <div className="pcard__media">
                <RepoThumb
                    repo={repo}
                    source={destaque ? "showcase" : "cover"}
                    coverVariant="terminal"
                    className="pcard__img"
                />
                {pinned && (
                    <span className="pcard__badge">
                        <span aria-hidden="true">⌖</span>
                        {t("card.pinned")}
                    </span>
                )}
                {demo && (
                    <a
                        className="pcard__live"
                        href={demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${t("card.available")}: ${nome} (${t("card.newTab")})`}
                    >
                        <span className="pcard__live-dot" aria-hidden="true" />
                        {t("card.available")}
                        <IconExternalLink width={12} height={12} aria-hidden />
                    </a>
                )}
            </div>

            <div className="pcard__body">
                <p className="pcard__meta">
                    {destaque ? (
                        <span className="pcard__index">
                            {pad(index + 1)} / {t("card.project")}
                        </span>
                    ) : (
                        <span className="pcard__lang">
                            <span
                                className="pcard__dot"
                                style={{ background: tinta }}
                                aria-hidden="true"
                            />
                            {repo.primaryLanguage?.name ?? t("card.noLanguage")}
                        </span>
                    )}
                    {destaque ? (
                        repo.primaryLanguage && (
                            <span className="pcard__lang">
                                <span
                                    className="pcard__dot"
                                    style={{ background: tinta }}
                                    aria-hidden="true"
                                />
                                {repo.primaryLanguage.name}
                            </span>
                        )
                    ) : (
                        <span className="pcard__state">{estado}</span>
                    )}
                </p>

                <Titulo className="pcard__title" id={tituloId}>
                    <a className="pcard__link" {...detalhes.anchorProps}>
                        {nome}
                    </a>
                </Titulo>

                <p className="pcard__desc">
                    {repo.description ?? (
                        <span className="pcard__nodesc">
                            {t("card.noDescription")}
                        </span>
                    )}
                </p>

                {destaque && linguagens.length > 0 && (
                    <ul
                        className="pcard__chips"
                        aria-label={t("work.block.stack")}
                    >
                        {linguagens.slice(0, 3).map((l) => (
                            <li
                                key={l.name}
                                className="pcard__chip"
                                style={
                                    {
                                        "--chip":
                                            l.color ?? NEUTRAL_LANGUAGE_COLOR,
                                    } as React.CSSProperties
                                }
                            >
                                {l.name}
                            </li>
                        ))}
                    </ul>
                )}

                {!destaque && (
                    <p className="pcard__stats">
                        <span
                            aria-label={`${formatNumber(repo.stargazerCount, lang)} ${t("devhub.card.stars")}`}
                        >
                            <IconStar width={13} height={13} aria-hidden />
                            {formatNumber(repo.stargazerCount, lang)}
                        </span>
                        <span
                            aria-label={`${formatNumber(repo.forkCount, lang)} ${t("devhub.card.forks")}`}
                        >
                            <IconGitBranch width={13} height={13} aria-hidden />
                            {formatNumber(repo.forkCount, lang)}
                        </span>
                        <time className="pcard__date" dateTime={atividade}>
                            {t("devhub.card.updated")}{" "}
                            {formatDate(atividade, lang)}
                        </time>
                    </p>
                )}

                {/* Ações: a principal leva SEMPRE à página do projeto (é ali
                    que o visitante conhece o trabalho); a secundária abre a
                    demo, quando existe, ou o código. */}
                <div className="pcard__actions">
                    <a
                        className={`pcard__btn ${destaque ? "pcard__btn--primary" : "pcard__btn--outline"}`}
                        {...detalhes.anchorProps}
                        aria-label={`${t("card.explore")}: ${nome}`}
                    >
                        {t("card.explore")}
                        <IconArrowRight
                            className="pcard__btn-go"
                            width={15}
                            height={15}
                            aria-hidden
                        />
                    </a>

                    {demo ? (
                        <a
                            href={demo}
                            className="pcard__btn pcard__btn--text"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${t("card.demo")}: ${nome} (${t("card.newTab")})`}
                        >
                            <IconExternalLink
                                width={14}
                                height={14}
                                aria-hidden
                            />
                            {t("card.demo")}
                        </a>
                    ) : (
                        <a
                            href={repo.url}
                            className="pcard__btn pcard__btn--text"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${t("card.code")}: ${nome} (${t("card.newTab")})`}
                        >
                            <IconCode width={15} height={15} aria-hidden />
                            {t("card.code")}
                        </a>
                    )}
                </div>

                {destaque && (
                    <details className="pcard__docs">
                        <summary className="pcard__docs-summary">
                            <span className="pcard__docs-label">
                                <span aria-hidden="true">▤</span>
                                {t("card.docs.title")}
                            </span>
                            <span
                                className="pcard__docs-icon"
                                aria-hidden="true"
                            />
                        </summary>
                        <div className="pcard__docs-body">
                            {fatias.length > 0 && (
                                <div className="pcard__docs-block">
                                    <p className="pcard__docs-heading">
                                        {t("card.docs.stack")}
                                    </p>
                                    <span
                                        className="pcard__bar"
                                        role="img"
                                        aria-label={fatias
                                            .map(
                                                (f) =>
                                                    `${f.name} ${fmtPct.format(f.pct)}%`,
                                            )
                                            .join(", ")}
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
                                </div>
                            )}

                            {repo.topics.length > 0 && (
                                <ul
                                    className="pcard__topics"
                                    aria-label={t("work.highlights")}
                                >
                                    {repo.topics.slice(0, 6).map((tp) => (
                                        <li key={tp}>#{tp}</li>
                                    ))}
                                </ul>
                            )}

                            <dl className="pcard__facts">
                                <div>
                                    <dt>{t("devhub.detail.stars")}</dt>
                                    <dd>
                                        {formatNumber(
                                            repo.stargazerCount,
                                            lang,
                                        )}
                                    </dd>
                                </div>
                                <div>
                                    <dt>{t("devhub.detail.forks")}</dt>
                                    <dd>
                                        {formatNumber(repo.forkCount, lang)}
                                    </dd>
                                </div>
                                <div>
                                    <dt>{t("devhub.card.updated")}</dt>
                                    <dd>
                                        <time dateTime={atividade}>
                                            {formatRelativeDate(
                                                atividade,
                                                lang,
                                            )}
                                        </time>
                                    </dd>
                                </div>
                                {repo.licenseName && (
                                    <div>
                                        <dt>{t("devhub.detail.license")}</dt>
                                        <dd>{repo.licenseName}</dd>
                                    </div>
                                )}
                            </dl>

                            <p className="pcard__docs-links">
                                {repo.hasReadme && (
                                    <a
                                        href={`${repo.url}#readme`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {t("card.docs.readme")}
                                        <IconExternalLink
                                            width={12}
                                            height={12}
                                            aria-hidden
                                        />
                                    </a>
                                )}
                                <a
                                    href={repo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {t("card.docs.code")}
                                    <IconExternalLink
                                        width={12}
                                        height={12}
                                        aria-hidden
                                    />
                                </a>
                                <a {...detalhes.anchorProps}>
                                    {t("card.docs.page")}
                                    <IconArrowRight
                                        width={13}
                                        height={13}
                                        aria-hidden
                                    />
                                </a>
                            </p>
                        </div>
                    </details>
                )}
            </div>
        </article>
    );
};
