import React, { useMemo } from "react";
import { formatDate, formatNumber } from "@/features/devhub/format";
import { dataDoDia } from "@/features/devhub/panorama";
import type { GithubProfile, ProfileStreak } from "@/features/devhub/types";
import { useLang } from "@/shared/hooks/useLang";
import { curto, useEmVista } from "./hooks";
import { Numero, Painel } from "./ui";

/* ─────────────────────────────────────────────────────────
   Aba "Sequências" — constância ao longo do histórico
   ─────────────────────────────────────────────────────────
   Tudo do calendário oficial, desde a criação da conta, sem filtros
   (sequência é uma propriedade do histórico inteiro):
     · total, sequência atual e maior sequência, com períodos;
     · contribuições e dias ativos por ano;
     · marcos.
───────────────────────────────────────────────────────── */

const Periodo: React.FC<{ s: ProfileStreak }> = ({ s }) => {
    const { lang, t } = useLang();
    if (!s.start || !s.end || s.days === 0) return <>{t("ghp.streak.none")}</>;
    return (
        <>
            {curto(s.start, lang, true)} – {curto(s.end, lang, true)}
        </>
    );
};

export const TabSequencias: React.FC<{ p: GithubProfile }> = ({ p }) => {
    const { lang, t } = useLang();
    const [ref, visto] = useEmVista<HTMLDivElement>();
    const anos = useMemo(() => {
        const m = new Map<number, { total: number; ativos: number }>();
        p.days.counts.forEach((n, i) => {
            const ano = Number(dataDoDia(p, i).slice(0, 4));
            const v = m.get(ano) ?? { total: 0, ativos: 0 };
            v.total += n;
            if (n > 0) v.ativos++;
            m.set(ano, v);
        });
        return [...m.entries()].sort((a, b) => a[0] - b[0]);
    }, [p]);
    const max = Math.max(1, ...anos.map(([, v]) => v.total));
    const m = p.milestones;

    return (
        <div ref={ref} className={`ghp-tab${visto ? " is-in" : ""}`}>
            <dl className="ghp-streaks ghp-anim">
                <div>
                    <dt>{t("ghp.streak.total")}</dt>
                    <dd className="ghp-streaks__value">
                        <Numero valor={p.streak.total} ativo={visto} />
                    </dd>
                    <dd className="ghp__period">
                        {formatDate(p.streak.since, lang)} –{" "}
                        {t("ghp.streak.today")}
                    </dd>
                </div>
                <div className="ghp-streaks__main">
                    <dt>{t("ghp.streak.current")}</dt>
                    <dd className="ghp-streaks__value">
                        <Numero valor={p.streak.current.days} ativo={visto} />{" "}
                        <small>{t("ghp.streak.days")}</small>
                    </dd>
                    <dd className="ghp__period">
                        <Periodo s={p.streak.current} />
                    </dd>
                </div>
                <div>
                    <dt>{t("ghp.streak.longest")}</dt>
                    <dd className="ghp-streaks__value">
                        <Numero valor={p.streak.longest.days} ativo={visto} />{" "}
                        <small>{t("ghp.streak.days")}</small>
                    </dd>
                    <dd className="ghp__period">
                        <Periodo s={p.streak.longest} />
                    </dd>
                </div>
            </dl>

            <Painel
                id="ghp-years"
                titulo={t("ghp.years.title")}
                className="ghp-anim"
            >
                <ul className="ghp-years">
                    {anos.map(([ano, v]) => (
                        <li key={ano}>
                            <span className="ghp-years__label">{ano}</span>
                            <span
                                className="ghp__lang-track"
                                aria-hidden="true"
                            >
                                <span
                                    style={{
                                        transform: `scaleX(${visto ? v.total / max : 0})`,
                                    }}
                                />
                            </span>
                            <span className="ghp-years__value">
                                <Numero valor={v.total} ativo={visto} />
                            </span>
                            <span className="ghp-years__meta">
                                {t("ghp.years.active").replace(
                                    "{n}",
                                    formatNumber(v.ativos, lang),
                                )}
                            </span>
                        </li>
                    ))}
                </ul>
            </Painel>

            <section
                className="ghp__milestones ghp-anim"
                aria-labelledby="ghp-marcos"
            >
                <h3 className="ghp__panel-title" id="ghp-marcos">
                    {t("ghp.milestones.title")}
                </h3>
                <ul>
                    <li>
                        <span>{t("ghp.milestones.since")}</span>
                        <strong>{formatDate(p.createdAt, lang)}</strong>
                    </li>
                    {m.busiestYear && (
                        <li>
                            <span>{t("ghp.milestones.year")}</span>
                            <strong>
                                {m.busiestYear.year} ·{" "}
                                {formatNumber(m.busiestYear.count, lang)}
                            </strong>
                        </li>
                    )}
                    {m.busiestDay && (
                        <li>
                            <span>{t("ghp.milestones.day")}</span>
                            <strong>
                                {formatDate(m.busiestDay.date, lang)} ·{" "}
                                {formatNumber(m.busiestDay.count, lang)}
                            </strong>
                        </li>
                    )}
                    {m.topRepo && (
                        <li>
                            <span>{t("ghp.milestones.repo")}</span>
                            <strong>
                                {m.topRepo.name} ·{" "}
                                {formatNumber(m.topRepo.stars, lang)} ★
                            </strong>
                        </li>
                    )}
                </ul>
            </section>
        </div>
    );
};
