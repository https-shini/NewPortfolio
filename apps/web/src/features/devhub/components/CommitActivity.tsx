import React, { useMemo } from "react";
import { formatNumber, formatRelativeDate } from "@/features/devhub/format";
import { weeklyCommits } from "@/features/devhub/selectors";
import type { RepositoryStats } from "@/features/devhub/types";
import { useLang } from "@/shared/hooks/useLang";

/* ─────────────────────────────────────────────────────────
   CommitActivity — aba "Atividade"
   ─────────────────────────────────────────────────────────
   Histograma de commits por semana (52 semanas) desenhado em SVG à
   mão, commits recentes e contribuidores. O gráfico é decorativo
   para o leitor de tela: o resumo em texto ao lado diz o total, e
   a lista de commits traz o conteúdo. Quando o período passa de
   100 commits, a API manda só as 100 datas mais recentes — o
   gráfico avisa que é parcial em vez de fingir completude.
───────────────────────────────────────────────────────── */

interface Props {
    stats: RepositoryStats;
}

const W = 520;
const H = 96;
const GAP = 2;

export const CommitActivity: React.FC<Props> = ({ stats }) => {
    const { lang, t } = useLang();
    const commits = stats.commits;
    const semanas = useMemo(
        () => weeklyCommits(commits?.lastYearDates ?? []),
        [commits],
    );
    const max = Math.max(1, ...semanas);
    const barra = (W - GAP * (semanas.length - 1)) / semanas.length;

    if (!commits) {
        return (
            <p className="devhub-empty">{t("devhub.stats.unavailableNote")}</p>
        );
    }

    const parcial = commits.lastYear > commits.lastYearDates.length;

    return (
        <div className="devhub-activity">
            <figure className="devhub-activity__chart">
                <figcaption className="devhub-activity__caption">
                    <strong>
                        {t("devhub.activity.summary").replace(
                            "{n}",
                            formatNumber(commits.lastYear, lang),
                        )}
                    </strong>
                    {parcial && (
                        <span>
                            {t("devhub.activity.partial").replace(
                                "{n}",
                                formatNumber(
                                    commits.lastYearDates.length,
                                    lang,
                                ),
                            )}
                        </span>
                    )}
                </figcaption>
                <svg
                    viewBox={`0 0 ${W} ${H}`}
                    preserveAspectRatio="none"
                    className="devhub-activity__svg"
                    aria-hidden="true"
                    focusable="false"
                >
                    <line
                        x1="0"
                        x2={W}
                        y1={H - 0.5}
                        y2={H - 0.5}
                        className="devhub-activity__axis"
                    />
                    {semanas.map((v, i) => {
                        const h =
                            v === 0 ? 2 : Math.max(4, (v / max) * (H - 6));
                        return (
                            <rect
                                key={i}
                                x={i * (barra + GAP)}
                                y={H - h}
                                width={barra}
                                height={h}
                                rx={1.5}
                                className="devhub-activity__bar"
                                data-empty={v === 0 || undefined}
                            />
                        );
                    })}
                </svg>
                <div className="devhub-activity__scale" aria-hidden="true">
                    <span>{t("devhub.activity.yearAgo")}</span>
                    <span>{t("devhub.activity.now")}</span>
                </div>
            </figure>

            <div className="devhub-activity__cols">
                <section aria-labelledby="devhub-recent-commits">
                    <h3 id="devhub-recent-commits" className="devhub-subtitle">
                        {t("devhub.activity.recent")}
                    </h3>
                    {commits.recent.length === 0 ? (
                        <p className="devhub-empty">
                            {t("devhub.activity.empty")}
                        </p>
                    ) : (
                        <ol className="devhub-commits">
                            {commits.recent.map((c) => (
                                <li
                                    key={c.sha}
                                    className="devhub-commits__item"
                                >
                                    <a
                                        className="devhub-commits__msg"
                                        href={c.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {c.message}
                                    </a>
                                    <span className="devhub-commits__meta">
                                        <code>{c.sha.slice(0, 7)}</code>
                                        {(c.authorLogin ?? c.author) && (
                                            <span>
                                                {c.authorLogin ?? c.author}
                                            </span>
                                        )}
                                        <time dateTime={c.date}>
                                            {formatRelativeDate(c.date, lang)}
                                        </time>
                                    </span>
                                </li>
                            ))}
                        </ol>
                    )}
                </section>

                <section aria-labelledby="devhub-contributors">
                    <h3 id="devhub-contributors" className="devhub-subtitle">
                        {t("devhub.stats.contributors")}
                    </h3>
                    {!stats.contributors ? (
                        <p className="devhub-empty">
                            {t("devhub.stats.unavailable")}
                        </p>
                    ) : stats.contributors.top.length === 0 ? (
                        <p className="devhub-empty">
                            {t("devhub.activity.noContributors")}
                        </p>
                    ) : (
                        <ul className="devhub-people">
                            {stats.contributors.top.map((p) => (
                                <li key={p.login}>
                                    <a
                                        className="devhub-people__item"
                                        href={p.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {p.avatarUrl ? (
                                            <img
                                                src={p.avatarUrl}
                                                alt=""
                                                width={32}
                                                height={32}
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        ) : (
                                            <span
                                                className="devhub-people__fallback"
                                                aria-hidden="true"
                                            >
                                                {p.login
                                                    .slice(0, 1)
                                                    .toUpperCase()}
                                            </span>
                                        )}
                                        <span className="devhub-people__name">
                                            {p.login}
                                        </span>
                                        <span className="devhub-people__count">
                                            {t(
                                                "devhub.activity.commitsBy",
                                            ).replace(
                                                "{n}",
                                                formatNumber(
                                                    p.contributions,
                                                    lang,
                                                ),
                                            )}
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
};
