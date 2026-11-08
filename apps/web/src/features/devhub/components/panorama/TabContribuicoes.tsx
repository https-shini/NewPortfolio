import React, { useMemo } from "react";
import { formatDate, formatNumber } from "@/features/devhub/format";
import {
    anosDisponiveis,
    ativos,
    CONTRIB_PADRAO,
    dataDoDia,
    idsDeRepos,
    intervalo,
    MAX_DIAS_CALENDARIO,
    resumo,
    serieDiaria,
    totais,
    ultimoDia,
    type Agrupamento,
    type FiltrosContribuicoes,
    type Periodo,
    type TipoAtividade,
} from "@/features/devhub/panorama";
import type { GithubProfile } from "@/features/devhub/types";
import { useLang } from "@/shared/hooks/useLang";
import type { TranslationKey } from "@/shared/lib/translations";
import { Calendario, Grafico } from "./charts";
import { curto, useEmVista } from "./hooks";
import { Numero, Painel, ResumoFiltros, Segmentado, Seletor } from "./ui";

/* ─────────────────────────────────────────────────────────
   Aba "Contribuições" — calendário, evolução, tipos,
   sequências e marcos, com filtros de período, tipo,
   repositório e agrupamento.
   ─────────────────────────────────────────────────────────
   Sem tipo nem repositório, os números vêm do calendário oficial
   do GitHub. Com recorte, vêm do detalhamento público (commits, PRs,
   issues e revisões por dia e repositório) — a nota do painel diz
   qual. Sequências e marcos são históricos e não filtram.
───────────────────────────────────────────────────────── */

const TIPOS: TipoAtividade[] = [
    "all",
    "commits",
    "pullRequests",
    "issues",
    "reviews",
];
const COR_TIPO: Record<Exclude<TipoAtividade, "all">, string> = {
    commits: "var(--color-brand)",
    pullRequests: "#a78bfa",
    issues: "#38bdf8",
    reviews: "#34d399",
};

type ChavePeriodo = "30d" | "90d" | "12m" | "all" | "custom" | `${number}`;

export const TabContribuicoes: React.FC<{
    p: GithubProfile;
    filtros: FiltrosContribuicoes;
    setFiltros: (f: FiltrosContribuicoes) => void;
}> = ({ p, filtros, setFiltros }) => {
    const { lang, t } = useLang();
    const [ref, visto] = useEmVista<HTMLDivElement>();
    const set = (parcial: Partial<FiltrosContribuicoes>) =>
        setFiltros({ ...filtros, ...parcial });

    const faixa = useMemo(
        () => intervalo(p, filtros.period),
        [p, filtros.period],
    );
    const ids = useMemo(
        () => idsDeRepos(p, filtros.repo ? [filtros.repo] : null),
        [p, filtros.repo],
    );
    const serie = useMemo(
        () => serieDiaria(p, faixa, filtros.type, ids),
        [p, faixa, filtros.type, ids],
    );
    const res = useMemo(
        () => resumo(p, faixa[0], serie.counts),
        [p, faixa, serie.counts],
    );
    const tipos = useMemo(() => totais(p, faixa, ids), [p, faixa, ids]);
    const somaTipos =
        tipos.commits + tipos.pullRequests + tipos.issues + tipos.reviews;
    const reposComAtividade = useMemo(() => {
        const usados = new Set<number>();
        for (const l of [
            p.activity.commits,
            p.activity.pullRequests,
            p.activity.issues,
            p.activity.reviews,
        ]) {
            for (const e of l) usados.add(e[1]);
        }
        return [...usados]
            .map((id) => p.activity.repos[id])
            .sort((a, b) => a.localeCompare(b));
    }, [p]);

    const chave: ChavePeriodo =
        filtros.period.kind === "year"
            ? `${filtros.period.year}`
            : filtros.period.kind;
    const hoje = dataDoDia(p, ultimoDia(p));
    const rotuloPeriodo = `${curto(dataDoDia(p, faixa[0]), lang, true)} – ${curto(dataDoDia(p, faixa[1]), lang, true)}`;
    const mudarPeriodo = (v: string) => {
        let period: Periodo;
        if (v === "custom") {
            const [a, b] = faixa;
            period = {
                kind: "custom",
                from: dataDoDia(p, a),
                to: dataDoDia(p, b),
            };
        } else if (v === "30d" || v === "90d" || v === "12m" || v === "all")
            period = { kind: v };
        else period = { kind: "year", year: Number(v) };
        set({ period });
    };
    const nFiltros = ativos(filtros, CONTRIB_PADRAO);
    const calendarioCabe = serie.counts.length <= MAX_DIAS_CALENDARIO;

    return (
        <div ref={ref} className={`ghp-tab${visto ? " is-in" : ""}`}>
            <div
                className="ghp-filters"
                role="group"
                aria-label={t("ghp.filters.label")}
            >
                <div className="ghp-filters__row">
                    <Segmentado<ChavePeriodo>
                        rotulo={t("ghp.f.period")}
                        valor={
                            ["30d", "90d", "12m"].includes(chave)
                                ? chave
                                : ("" as ChavePeriodo)
                        }
                        onChange={mudarPeriodo}
                        opcoes={[
                            { value: "30d", label: t("ghp.period.30d") },
                            { value: "90d", label: t("ghp.period.90d") },
                            { value: "12m", label: t("ghp.period.12m") },
                        ]}
                    />
                    <Seletor
                        id="ghp-c-period"
                        rotulo={t("ghp.f.other")}
                        valor={
                            ["30d", "90d", "12m"].includes(chave) ? "" : chave
                        }
                        onChange={(v) => v && mudarPeriodo(v)}
                        opcoes={[
                            { value: "", label: "—" },
                            ...anosDisponiveis(p).map((a) => ({
                                value: String(a),
                                label: String(a),
                            })),
                            { value: "all", label: t("ghp.period.all") },
                            { value: "custom", label: t("ghp.period.custom") },
                        ]}
                    />
                    <Seletor
                        id="ghp-c-type"
                        rotulo={t("ghp.f.type")}
                        valor={filtros.type}
                        onChange={(v) => set({ type: v as TipoAtividade })}
                        opcoes={TIPOS.map((tp) => ({
                            value: tp,
                            label:
                                tp === "all"
                                    ? t("ghp.f.all")
                                    : t(`ghp.type.${tp}` as TranslationKey),
                        }))}
                    />
                    <details
                        className="ghp-more"
                        open={Boolean(filtros.repo) || undefined}
                    >
                        <summary>{t("ghp.filters.more")}</summary>
                        <div className="ghp-more__body">
                            <Seletor
                                id="ghp-c-repo"
                                rotulo={t("ghp.f.repo")}
                                valor={filtros.repo ?? ""}
                                onChange={(v) => set({ repo: v || null })}
                                opcoes={[
                                    { value: "", label: t("ghp.f.all") },
                                    ...reposComAtividade.map((n) => ({
                                        value: n,
                                        label: n,
                                    })),
                                ]}
                            />
                            <Segmentado<Agrupamento>
                                rotulo={t("ghp.f.group")}
                                valor={filtros.group}
                                onChange={(group) => set({ group })}
                                opcoes={[
                                    { value: "day", label: t("ghp.group.day") },
                                    {
                                        value: "week",
                                        label: t("ghp.group.week"),
                                    },
                                    {
                                        value: "month",
                                        label: t("ghp.group.month"),
                                    },
                                ]}
                            />
                        </div>
                    </details>
                </div>
                {filtros.period.kind === "custom" && (
                    <div className="ghp-filters__row ghp-filters__dates">
                        <label className="ghp-select">
                            <span className="ghp-select__label">
                                {t("ghp.f.from")}
                            </span>
                            <input
                                type="date"
                                min={p.days.start}
                                max={hoje}
                                value={filtros.period.from}
                                onChange={(e) =>
                                    e.target.value &&
                                    filtros.period.kind === "custom" &&
                                    set({
                                        period: {
                                            ...filtros.period,
                                            from: e.target.value,
                                        },
                                    })
                                }
                            />
                        </label>
                        <label className="ghp-select">
                            <span className="ghp-select__label">
                                {t("ghp.f.to")}
                            </span>
                            <input
                                type="date"
                                min={p.days.start}
                                max={hoje}
                                value={filtros.period.to}
                                onChange={(e) =>
                                    e.target.value &&
                                    filtros.period.kind === "custom" &&
                                    set({
                                        period: {
                                            ...filtros.period,
                                            to: e.target.value,
                                        },
                                    })
                                }
                            />
                        </label>
                    </div>
                )}
                <ResumoFiltros
                    ativos={nFiltros}
                    onLimpar={() => setFiltros(CONTRIB_PADRAO)}
                />
            </div>

            <p className="ghp-scope" role="status">
                <strong>{rotuloPeriodo}</strong> ·{" "}
                {serie.oficial
                    ? t("ghp.source.official")
                    : t("ghp.source.detail")}
            </p>

            <dl className="ghp__kpis ghp-anim">
                {(
                    [
                        [
                            "ghp.sum.total",
                            res.total,
                            serie.oficial
                                ? "ghp.sum.total.official"
                                : "ghp.sum.total.detail",
                        ],
                        ["ghp.sum.active", res.ativos, null],
                        [
                            "ghp.sum.avg",
                            res.ativos ? Math.round(res.total / res.ativos) : 0,
                            "ghp.sum.avg.hint",
                        ],
                        ["ghp.sum.best", res.melhor?.count ?? 0, null],
                    ] as [TranslationKey, number, TranslationKey | null][]
                ).map(([rot, v, dica], i) => (
                    <div key={rot} className="ghp__kpi">
                        <dt>
                            <span className="ghp__kpi-label">{t(rot)}</span>
                            <span className="ghp__kpi-hint">
                                {i === 1
                                    ? t("ghp.sum.active.hint").replace(
                                          "{n}",
                                          formatNumber(res.dias, lang),
                                      )
                                    : i === 3
                                      ? res.melhor
                                          ? formatDate(res.melhor.date, lang)
                                          : "—"
                                      : dica
                                        ? t(dica)
                                        : ""}
                            </span>
                        </dt>
                        <dd>
                            <Numero valor={v} ativo={visto} />
                        </dd>
                    </div>
                ))}
            </dl>

            {res.total === 0 ? (
                <p className="ghp__empty" role="status">
                    {t("ghp.noActivity")}
                </p>
            ) : (
                <>
                    <Painel
                        id="ghp-cal"
                        titulo={t("ghp.calendar.title")}
                        nota={
                            calendarioCabe
                                ? t("ghp.calendar.note")
                                : t("ghp.calendar.tooLong")
                        }
                        className="ghp-anim"
                    >
                        {calendarioCabe && (
                            <Calendario
                                p={p}
                                inicio={faixa[0]}
                                counts={serie.counts}
                                visto={visto}
                            />
                        )}
                    </Painel>
                    <div className="ghp__activity">
                        <Painel
                            id="ghp-chart"
                            titulo={t("ghp.chart.title").replace(
                                "{group}",
                                t(
                                    `ghp.group.${filtros.group}.by` as TranslationKey,
                                ),
                            )}
                            className="ghp-anim"
                        >
                            <Grafico
                                p={p}
                                inicio={faixa[0]}
                                counts={serie.counts}
                                group={filtros.group}
                                visto={visto}
                            />
                        </Painel>
                        <Painel
                            id="ghp-types"
                            titulo={t("ghp.types.title")}
                            nota={t("ghp.types.note")}
                            className="ghp-anim"
                        >
                            <div className="ghp-types__bar" aria-hidden="true">
                                {(
                                    Object.keys(
                                        COR_TIPO,
                                    ) as (keyof typeof COR_TIPO)[]
                                ).map((k) =>
                                    tipos[k] ? (
                                        <span
                                            key={k}
                                            style={{
                                                flexGrow: tipos[k],
                                                background: COR_TIPO[k],
                                            }}
                                        />
                                    ) : null,
                                )}
                            </div>
                            <dl className="ghp__rows">
                                {(
                                    Object.keys(
                                        COR_TIPO,
                                    ) as (keyof typeof COR_TIPO)[]
                                ).map((k) => (
                                    <div
                                        key={k}
                                        className="ghp__row"
                                        data-dim={
                                            filtros.type !== "all" &&
                                            filtros.type !== k
                                                ? ""
                                                : undefined
                                        }
                                    >
                                        <dt>
                                            <span
                                                className="ghp__dot"
                                                style={{
                                                    background: COR_TIPO[k],
                                                }}
                                                aria-hidden="true"
                                            />
                                            {t(
                                                `ghp.type.${k}` as TranslationKey,
                                            )}
                                        </dt>
                                        <dd>
                                            <Numero
                                                valor={tipos[k]}
                                                ativo={visto}
                                            />
                                            <small>
                                                {somaTipos
                                                    ? Math.round(
                                                          (tipos[k] /
                                                              somaTipos) *
                                                              100,
                                                      )
                                                    : 0}
                                                %
                                            </small>
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </Painel>
                    </div>
                </>
            )}
        </div>
    );
};
