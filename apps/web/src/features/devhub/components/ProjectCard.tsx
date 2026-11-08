import React, { Suspense, lazy, useState } from "react";
import "./ProjectCard.css";
import { RepoThumb } from "@/features/devhub/components/RepoThumb";
import { TechList } from "@/features/devhub/components/TechList";
import { displayName } from "@/features/devhub/catalog";
import { formatDate, formatNumber } from "@/features/devhub/format";
import { lastActivity } from "@/features/devhub/selectors";
import { techsFromRepo } from "@/features/devhub/tech";
import {
    NEUTRAL_LANGUAGE_COLOR,
    type Repository,
} from "@/features/devhub/types";
import { useLang } from "@/shared/hooks/useLang";
import {
    IconArrowRight,
    IconExternalLink,
    IconEye,
    IconGitBranch,
    IconGitHub,
    IconStar,
} from "@/shared/ui/Icons";

/* O modal só baixa quando alguém o abre (ou aponta para abrir): o
   orçamento do documento da home não paga a galeria. */
const carregarModal = () => import("@/features/devhub/components/ProjectModal");
const ProjectModal = lazy(carregarModal);
const preaquecer = () => {
    void carregarModal();
};

/* ─────────────────────────────────────────────────────────
   ProjectCard — o cartão de projeto ÚNICO do site
   ─────────────────────────────────────────────────────────
   O mesmo componente na home (#projetos) e no catálogo (/projetos),
   para as duas superfícies falarem a mesma língua visual.

     mídia   → capa real (imagem social própria ou do README); sem
               ela, o social card do GitHub (só na vitrine) ou o
               "prompt" `$ cd ~/repositório`. Selo "Fixado" no canto.
               No hover, o chip "Ver detalhes" — abre o modal.
     corpo   → meta · título · descrição · tecnologias (ícone oficial
               ou genérico, ver tech.ts) · números (catálogo)
     docs    → "Documentação do projeto · Abrir" — abre o modal com
               galeria, descrição, funcionalidades e stack.
     ações   → "Acessar projeto" (aplicação publicada, só quando há)
               e "Acessar repositório" (GitHub). As duas em nova aba.

   Variantes:
     `featured` — vitrine da home: "01 / PROJETO", até 4 chips.
     `default`  — catálogo: linguagem + estado, até 3 chips, números.

   Quem abre o modal são BOTÕES (título, linha de documentação e a
   mídia, esta só para o mouse); quem sai do site são LINKS. Nada de
   link dentro de link, e cada alvo diz o que faz.
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
    const [aberto, setAberto] = useState(false);
    const destaque = variant === "featured";
    const Titulo = headingLevel === 2 ? "h2" : "h3";
    const tituloId = `pcard-${repo.id}`;
    const nome = displayName(repo.name);
    const demo = repo.homepageUrl;
    const tinta = repo.primaryLanguage?.color ?? NEUTRAL_LANGUAGE_COLOR;
    const atividade = new Date(lastActivity(repo)).toISOString();
    const techs = techsFromRepo(repo);
    const abrir = () => setAberto(true);
    const gatilho = {
        onClick: abrir,
        onPointerEnter: preaquecer,
        onFocus: preaquecer,
        "aria-haspopup": "dialog" as const,
    };

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
                {/* Atalho de mouse: o teclado já tem o título e a linha
                    de documentação, então este fica fora da ordem de Tab
                    e da árvore de acessibilidade. */}
                <button
                    type="button"
                    className="pcard__peek"
                    tabIndex={-1}
                    aria-hidden="true"
                    {...gatilho}
                >
                    <span className="pcard__peek-chip">
                        <IconEye width={15} height={15} aria-hidden />
                        {t("card.details")}
                    </span>
                </button>
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
                        <time className="pcard__state" dateTime={atividade}>
                            {t("devhub.card.updated")}{" "}
                            {formatDate(atividade, lang)}
                        </time>
                    ) : (
                        <span className="pcard__state">{estado}</span>
                    )}
                </p>

                <Titulo className="pcard__title" id={tituloId}>
                    <button type="button" className="pcard__link" {...gatilho}>
                        {nome}
                    </button>
                </Titulo>

                <p className="pcard__desc">
                    {repo.description ?? (
                        <span className="pcard__nodesc">
                            {t("card.noDescription")}
                        </span>
                    )}
                </p>

                <TechList techs={techs} limit={destaque ? 4 : 3} />

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

                <button
                    type="button"
                    className="pcard__docs"
                    aria-label={`${t("card.docs.title")}: ${nome}`}
                    {...gatilho}
                >
                    <span className="pcard__docs-icon" aria-hidden="true">
                        ▤
                    </span>
                    <span className="pcard__docs-label">
                        {t("card.docs.title")}
                    </span>
                    <span className="pcard__docs-open" aria-hidden="true">
                        <span className="pcard__docs-open-text">
                            {t("card.docs.open")}
                        </span>
                        <IconArrowRight width={14} height={14} aria-hidden />
                    </span>
                </button>

                <div className="pcard__actions">
                    {demo && (
                        <a
                            href={demo}
                            className="pcard__btn pcard__btn--primary"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${t("card.access")}: ${nome} (${t("card.newTab")})`}
                        >
                            {t("card.access")}
                            <IconExternalLink
                                width={15}
                                height={15}
                                aria-hidden
                            />
                        </a>
                    )}
                    <a
                        href={repo.url}
                        className="pcard__btn pcard__btn--secondary"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${t("card.repo")}: ${nome} (${t("card.newTab")})`}
                    >
                        <IconGitHub width={16} height={16} aria-hidden />
                        {t("card.repo")}
                    </a>
                </div>
            </div>

            {aberto && (
                <Suspense fallback={null}>
                    <ProjectModal
                        repo={repo}
                        index={destaque ? index : undefined}
                        onClose={() => setAberto(false)}
                    />
                </Suspense>
            )}
        </article>
    );
};
