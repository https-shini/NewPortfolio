import React, { useEffect, useMemo, useRef } from "react";
import "./GithubPanorama.css";
import { formatDate, formatNumber, LOCALE } from "@/features/devhub/format";
import type { GithubProfile, ProfileStreak } from "@/features/devhub/types";
import { useDevhubProfile } from "@/features/devhub/useDevhub";
import { GITHUB_URL } from "@/shared/config/constants";
import { useLang } from "@/shared/hooks/useLang";
import type { Lang } from "@/shared/lib/translations";
import { IconExternalLink, IconGitHub } from "@/shared/ui/Icons";

/* ─────────────────────────────────────────────────────────
   GithubPanorama — o perfil no GitHub, em números reais
   ─────────────────────────────────────────────────────────
   Antes eram quatro SVGs de serviços externos (readme-stats,
   streak-stats, profile-trophy): só em inglês, largura fixa, ilegíveis
   no celular, e com "rank" e troféus que cada serviço inventa. Agora
   os números vêm de `op=profile` (api/_github-perfil.ts), calculados
   no servidor com o token que nunca sai de lá, e cachados na CDN.

   Moldura: uma janela de navegador enxuta. Só o endereço é
   interativo (abre o perfil); pontos e aba são decoração.

   Conteúdo, de cima para baixo:
     1. indicadores principais            (período em cada rótulo)
     2. estatísticas gerais | linguagens  (colunas equilibradas)
     3. calendário + evolução | sequências
     4. marcos — fatos dos mesmos dados, discretos

   Commits ≠ contribuições: "contribuições" é o número do calendário
   do GitHub (commits, PRs, issues e revisões); commits aparecem à
   parte, com o período.
───────────────────────────────────────────────────────── */

const PERFIL = GITHUB_URL.replace(/^https:\/\//, "");
const MS_DIA = 86_400_000;

const diaCurto = (iso: string, lang: Lang) =>
    new Intl.DateTimeFormat(LOCALE[lang], {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
    }).format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));

const mesAno = (iso: string, lang: Lang) =>
    new Intl.DateTimeFormat(LOCALE[lang], {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(iso));

/** Dias do calendário com data, a partir do primeiro dia + contagens. */
function diasDoCalendario(c: GithubProfile["calendar"]) {
    const base = Date.parse(`${c.start}T00:00:00Z`);
    return c.counts.map((count, i) => ({
        date: new Date(base + i * MS_DIA).toISOString().slice(0, 10),
        count,
    }));
}

/** Nível 0–4 por faixas relativas ao maior dia do período. */
const nivel = (n: number, max: number) =>
    n === 0 || max === 0 ? 0 : Math.min(4, Math.ceil((n / max) * 4));

/* ── Moldura ───────────────────────────────────────────── */

const Janela: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t } = useLang();
    return (
        <div className="ghp__window">
            <div className="ghp__chrome">
                <span className="ghp__dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                </span>
                <span className="ghp__tab" aria-hidden="true">
                    <IconGitHub width={13} height={13} />
                    GitHub · https-shini
                </span>
                <a
                    className="ghp__address"
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("ghp.address")}
                >
                    <svg
                        className="ghp__lock"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        aria-hidden="true"
                    >
                        <rect x="5" y="11" width="14" height="10" rx="2" />
                        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                    <span className="ghp__url">{PERFIL}</span>
                    <IconExternalLink width={12} height={12} aria-hidden />
                </a>
            </div>
            <div className="ghp__body">{children}</div>
        </div>
    );
};

/* ── Blocos ────────────────────────────────────────────── */

const Painel: React.FC<{
    id: string;
    titulo: string;
    nota?: string;
    className?: string;
    children: React.ReactNode;
}> = ({ id, titulo, nota, className, children }) => (
    <section
        className={`ghp__panel${className ? ` ${className}` : ""}`}
        aria-labelledby={id}
    >
        <header className="ghp__panel-head">
            <h3 className="ghp__panel-title" id={id}>
                {titulo}
            </h3>
            {nota && <p className="ghp__panel-note">{nota}</p>}
        </header>
        {children}
    </section>
);

const Linha: React.FC<{ rotulo: string; valor: number }> = ({
    rotulo,
    valor,
}) => {
    const { lang } = useLang();
    return (
        <div className="ghp__row">
            <dt>{rotulo}</dt>
            <dd>{formatNumber(valor, lang)}</dd>
        </div>
    );
};

const Periodo: React.FC<{ s: ProfileStreak }> = ({ s }) => {
    const { lang, t } = useLang();
    if (!s.start || !s.end || s.days === 0) return <>{t("ghp.streak.none")}</>;
    return (
        <>
            {diaCurto(s.start, lang)} – {diaCurto(s.end, lang)}
        </>
    );
};

const Calendario: React.FC<{ p: GithubProfile }> = ({ p }) => {
    const { lang, t } = useLang();
    const { semanas, meses, max, mensal } = useMemo(() => {
        const dias = diasDoCalendario(p.calendar);
        /* Colunas = semanas começando no domingo, como no GitHub. */
        const offset = new Date(`${p.calendar.start}T00:00:00Z`).getUTCDay();
        const celulas: ({ date: string; count: number } | null)[] = [
            ...Array.from({ length: offset }, () => null),
            ...dias,
        ];
        const semanas: (typeof celulas)[] = [];
        for (let i = 0; i < celulas.length; i += 7)
            semanas.push(celulas.slice(i, i + 7));
        const max = Math.max(0, ...dias.map((d) => d.count));

        const meses: { col: number; rotulo: string }[] = [];
        let ultimo = "";
        semanas.forEach((s, col) => {
            const primeiro = s.find(Boolean);
            const mes = primeiro?.date.slice(0, 7) ?? "";
            if (mes && mes !== ultimo) {
                ultimo = mes;
                meses.push({
                    col,
                    rotulo: new Intl.DateTimeFormat(LOCALE[lang], {
                        month: "short",
                        timeZone: "UTC",
                    }).format(new Date(`${mes}-01T00:00:00Z`)),
                });
            }
        });

        const porMes = new Map<string, number>();
        for (const d of dias) {
            const m = d.date.slice(0, 7);
            porMes.set(m, (porMes.get(m) ?? 0) + d.count);
        }
        const mensal = [...porMes.entries()].slice(-12).map(([m, total]) => ({
            mes: m,
            total,
            rotulo: new Intl.DateTimeFormat(LOCALE[lang], {
                month: "short",
                year: "2-digit",
                timeZone: "UTC",
            }).format(new Date(`${m}-01T00:00:00Z`)),
        }));
        return { semanas, meses, max, mensal };
    }, [p.calendar, lang]);

    const maxMes = Math.max(1, ...mensal.map((m) => m.total));
    /* No celular o calendário rola na horizontal dentro do painel;
       começa mostrando as semanas mais recentes (à direita). */
    const rolagem = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = rolagem.current;
        if (el) el.scrollLeft = el.scrollWidth;
    }, [semanas.length]);
    const resumo = t("ghp.calendar.summary")
        .replace("{n}", formatNumber(p.lastYear.contributions, lang))
        .replace("{from}", formatDate(p.lastYear.from, lang))
        .replace("{to}", formatDate(p.lastYear.to, lang));

    return (
        <>
            <div
                className="ghp__cal-wrap"
                ref={rolagem}
                tabIndex={0}
                role="region"
                aria-labelledby="ghp-cal"
            >
                <div
                    className="ghp__cal"
                    role="img"
                    aria-label={resumo}
                    style={{ "--weeks": semanas.length } as React.CSSProperties}
                >
                    <div className="ghp__cal-months" aria-hidden="true">
                        {meses.map((m) => (
                            <span
                                key={`${m.col}`}
                                style={{ gridColumnStart: m.col + 1 }}
                            >
                                {m.rotulo}
                            </span>
                        ))}
                    </div>
                    <div className="ghp__cal-grid">
                        {semanas.map((s, col) =>
                            s.map((d, row) =>
                                d ? (
                                    <span
                                        key={d.date}
                                        className="ghp__cell"
                                        data-l={nivel(d.count, max)}
                                        style={{
                                            gridColumn: col + 1,
                                            gridRow: row + 1,
                                        }}
                                        title={`${formatNumber(d.count, lang)} · ${diaCurto(d.date, lang)}`}
                                    />
                                ) : null,
                            ),
                        )}
                    </div>
                </div>
            </div>
            <div className="ghp__legend" aria-hidden="true">
                <span>{t("ghp.calendar.less")}</span>
                {[0, 1, 2, 3, 4].map((l) => (
                    <span key={l} className="ghp__cell" data-l={l} />
                ))}
                <span>{t("ghp.calendar.more")}</span>
            </div>

            <h4 className="ghp__sub">{t("ghp.monthly.title")}</h4>
            <ol className="ghp__months">
                {mensal.map((m) => (
                    <li key={m.mes}>
                        <span
                            className="ghp__bar"
                            style={
                                {
                                    "--h": `${Math.max(3, (m.total / maxMes) * 100)}%`,
                                } as React.CSSProperties
                            }
                            aria-hidden="true"
                        />
                        <span className="ghp__month-label" aria-hidden="true">
                            {m.rotulo}
                        </span>
                        <span className="sr-only">
                            {m.rotulo}: {formatNumber(m.total, lang)}
                        </span>
                    </li>
                ))}
            </ol>
        </>
    );
};

/* ── Conteúdo ──────────────────────────────────────────── */

const Conteudo: React.FC<{ p: GithubProfile }> = ({ p }) => {
    const { lang, t } = useLang();
    const n = (v: number) => formatNumber(v, lang);
    const desde = mesAno(p.createdAt, lang);
    const kpis: { valor: number; rotulo: string; dica: string }[] = [
        {
            valor: p.lastYear.contributions,
            rotulo: t("ghp.kpi.contrib"),
            dica: t("ghp.kpi.contrib.hint"),
        },
        {
            valor: p.publicRepos,
            rotulo: t("ghp.kpi.repos"),
            dica: t("ghp.kpi.repos.hint").replace("{n}", n(p.ownRepos)),
        },
        {
            valor: p.stars,
            rotulo: t("ghp.kpi.stars"),
            dica: t("ghp.kpi.received"),
        },
        {
            valor: p.forks,
            rotulo: t("ghp.kpi.forks"),
            dica: t("ghp.kpi.received"),
        },
    ];
    const m = p.milestones;

    return (
        <>
            <dl className="ghp__kpis">
                {kpis.map((k) => (
                    <div key={k.rotulo} className="ghp__kpi">
                        <dt>
                            <span className="ghp__kpi-label">{k.rotulo}</span>
                            <span className="ghp__kpi-hint">{k.dica}</span>
                        </dt>
                        <dd>{n(k.valor)}</dd>
                    </div>
                ))}
            </dl>

            <div className="ghp__cols">
                <Painel id="ghp-stats" titulo={t("ghp.stats.title")}>
                    <h4 className="ghp__sub">{t("ghp.stats.year")}</h4>
                    <dl className="ghp__rows">
                        <Linha
                            rotulo={t("ghp.stats.commits")}
                            valor={p.lastYear.commits}
                        />
                        <Linha
                            rotulo={t("ghp.stats.prs")}
                            valor={p.lastYear.pullRequests}
                        />
                        <Linha
                            rotulo={t("ghp.stats.issues")}
                            valor={p.lastYear.issues}
                        />
                        <Linha
                            rotulo={t("ghp.stats.reviews")}
                            valor={p.lastYear.reviews}
                        />
                        <Linha
                            rotulo={t("ghp.stats.repos")}
                            valor={p.lastYear.reposContributed}
                        />
                    </dl>
                    <h4 className="ghp__sub">
                        {t("ghp.stats.all").replace("{date}", desde)}
                    </h4>
                    <dl className="ghp__rows">
                        <Linha
                            rotulo={t("ghp.stats.prsAll")}
                            valor={p.pullRequests}
                        />
                        <Linha
                            rotulo={t("ghp.stats.issuesAll")}
                            valor={p.issues}
                        />
                        <Linha
                            rotulo={t("ghp.stats.followers")}
                            valor={p.followers}
                        />
                    </dl>
                </Painel>

                <Painel
                    id="ghp-langs"
                    titulo={t("ghp.langs.title")}
                    nota={t("ghp.langs.note").replace("{n}", n(p.ownRepos))}
                >
                    {p.languages.length === 0 ? (
                        <p className="ghp__empty">{t("ghp.empty")}</p>
                    ) : (
                        <>
                            <div className="ghp__langbar" aria-hidden="true">
                                {p.languages.map((l) => (
                                    <span
                                        key={l.name}
                                        style={{
                                            width: `${l.percent}%`,
                                            background:
                                                l.color ??
                                                "var(--color-text-4)",
                                        }}
                                    />
                                ))}
                            </div>
                            <ul className="ghp__langs">
                                {p.languages.map((l) => {
                                    const cor =
                                        l.color ?? "var(--color-text-4)";
                                    const pct = new Intl.NumberFormat(
                                        LOCALE[lang],
                                        {
                                            maximumFractionDigits: 1,
                                        },
                                    ).format(l.percent);
                                    return (
                                        <li key={l.name}>
                                            <span
                                                className="ghp__dot"
                                                style={{ background: cor }}
                                                aria-hidden="true"
                                            />
                                            <span className="ghp__lang-name">
                                                {l.name === "Outras"
                                                    ? t("ghp.langs.other")
                                                    : l.name}
                                            </span>
                                            <span
                                                className="ghp__lang-track"
                                                aria-hidden="true"
                                            >
                                                <span
                                                    style={{
                                                        width: `${Math.max(1, l.percent)}%`,
                                                        background: cor,
                                                    }}
                                                />
                                            </span>
                                            <span className="ghp__lang-pct">
                                                {pct}%
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </>
                    )}
                </Painel>
            </div>

            <div className="ghp__activity">
                <Painel
                    id="ghp-cal"
                    titulo={t("ghp.calendar.title")}
                    nota={t("ghp.calendar.note")}
                    className="ghp__panel--cal"
                >
                    <Calendario p={p} />
                </Painel>

                <Painel id="ghp-streak" titulo={t("ghp.streak.title")}>
                    <dl className="ghp__streaks">
                        <div>
                            <dt>{t("ghp.streak.total")}</dt>
                            <dd className="ghp__streak-value">
                                {n(p.streak.total)}
                            </dd>
                            <dd className="ghp__period">
                                {t("ghp.streak.since").replace(
                                    "{date}",
                                    formatDate(p.streak.since, lang),
                                )}
                            </dd>
                        </div>
                        <div className="ghp__streak--main">
                            <dt>{t("ghp.streak.current")}</dt>
                            <dd className="ghp__streak-value">
                                {n(p.streak.current.days)}{" "}
                                <small>{t("ghp.streak.days")}</small>
                            </dd>
                            <dd className="ghp__period">
                                <Periodo s={p.streak.current} />
                            </dd>
                        </div>
                        <div>
                            <dt>{t("ghp.streak.longest")}</dt>
                            <dd className="ghp__streak-value">
                                {n(p.streak.longest.days)}{" "}
                                <small>{t("ghp.streak.days")}</small>
                            </dd>
                            <dd className="ghp__period">
                                <Periodo s={p.streak.longest} />
                            </dd>
                        </div>
                    </dl>
                </Painel>
            </div>

            <section className="ghp__milestones" aria-labelledby="ghp-marcos">
                <h3 className="ghp__panel-title" id="ghp-marcos">
                    {t("ghp.milestones.title")}
                </h3>
                <ul>
                    <li>
                        <span>{t("ghp.milestones.since")}</span>
                        <strong>{desde}</strong>
                    </li>
                    {m.busiestYear && (
                        <li>
                            <span>{t("ghp.milestones.year")}</span>
                            <strong>
                                {m.busiestYear.year} · {n(m.busiestYear.count)}
                            </strong>
                        </li>
                    )}
                    {m.busiestDay && (
                        <li>
                            <span>{t("ghp.milestones.day")}</span>
                            <strong>
                                {formatDate(m.busiestDay.date, lang)} ·{" "}
                                {n(m.busiestDay.count)}
                            </strong>
                        </li>
                    )}
                    {m.topRepo && (
                        <li>
                            <span>{t("ghp.milestones.repo")}</span>
                            <strong>
                                {m.topRepo.name} · {n(m.topRepo.stars)} ★
                            </strong>
                        </li>
                    )}
                </ul>
            </section>
        </>
    );
};

const Esqueleto: React.FC = () => {
    const { t } = useLang();
    return (
        <div className="ghp__skeleton" role="status" aria-live="polite">
            <span className="sr-only">{t("ghp.loading")}</span>
            <div className="ghp__kpis" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="ghp__kpi ghp__shimmer" />
                ))}
            </div>
            <div className="ghp__cols" aria-hidden="true">
                <div className="ghp__panel ghp__shimmer" />
                <div className="ghp__panel ghp__shimmer" />
            </div>
        </div>
    );
};

export const GithubPanorama: React.FC = () => {
    const { lang, t } = useLang();
    const { data, loading, error } = useDevhubProfile();

    return (
        <section
            id="panorama-github"
            className="devhub-section ghp"
            aria-labelledby="ghp-title"
        >
            <div className="devhub-section__head">
                <h2 id="ghp-title" className="devhub-section__title">
                    {t("ghp.title")}
                </h2>
                <p className="devhub-section__desc">{t("ghp.desc")}</p>
            </div>

            <Janela>
                {loading ? (
                    <Esqueleto />
                ) : error || !data ? (
                    <div className="ghp__error" role="status">
                        <p>{t("ghp.error")}</p>
                        <a
                            href={GITHUB_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {t("ghp.error.link")}
                            <IconExternalLink
                                width={12}
                                height={12}
                                aria-hidden
                            />
                        </a>
                    </div>
                ) : (
                    <Conteudo p={data} />
                )}
            </Janela>

            {data && (
                <div className="ghp__foot">
                    <p>
                        {t("ghp.source")}{" "}
                        <time dateTime={data.fetchedAt}>
                            {new Intl.DateTimeFormat(LOCALE[lang], {
                                dateStyle: "medium",
                                timeStyle: "short",
                            }).format(new Date(data.fetchedAt))}
                        </time>
                    </p>
                    {data.lastYear.restricted > 0 && (
                        <p>
                            {t("ghp.private").replace(
                                "{n}",
                                formatNumber(data.lastYear.restricted, lang),
                            )}
                        </p>
                    )}
                </div>
            )}
        </section>
    );
};
