import React, { useMemo } from "react";
import { formatDate } from "@/features/devhub/format";
import {
    anosDisponiveis,
    ativos,
    idsDeRepos,
    intervalo,
    nomeCompleto,
    PANORAMA_PADRAO,
    reposFiltrados,
    totais,
    type Escopo,
    type FiltrosPanorama,
} from "@/features/devhub/panorama";
import type { GithubProfile } from "@/features/devhub/types";
import { useLang } from "@/shared/hooks/useLang";
import type { TranslationKey } from "@/shared/lib/translations";
import { useEmVista } from "./hooks";
import { Numero, Painel, ResumoFiltros, Segmentado, Seletor } from "./ui";

/* ─────────────────────────────────────────────────────────
   Aba "Visão geral" — indicadores e estatísticas
   ─────────────────────────────────────────────────────────
   escopo · linguagem · repositório → repositórios, estrelas, forks
       e atividade;
   período → só a atividade. Estrelas e forks são valores ATUAIS (a
       fonte não tem recorte temporal para eles). O histórico do
       perfil não filtra.
───────────────────────────────────────────────────────── */

export const TabVisao: React.FC<{
    p: GithubProfile;
    filtros: FiltrosPanorama;
    setFiltros: (f: FiltrosPanorama) => void;
}> = ({ p, filtros, setFiltros }) => {
    const { lang, t } = useLang();
    const [ref, visto] = useEmVista<HTMLDivElement>();
    const set = (parcial: Partial<FiltrosPanorama>) =>
        setFiltros({ ...filtros, ...parcial });

    const repos = useMemo(() => reposFiltrados(p, filtros), [p, filtros]);
    const faixa = useMemo(
        () => intervalo(p, filtros.period),
        [p, filtros.period],
    );
    /* "Todos" sem linguagem/repositório inclui contribuições em
       repositórios de terceiros; os demais recortes, só os do dono. */
    const ids = useMemo(
        () =>
            filtros.scope === "all" && !filtros.lang && !filtros.repo
                ? null
                : idsDeRepos(
                      p,
                      repos.map((r) => nomeCompleto(r.name)),
                  ),
        [p, filtros, repos],
    );
    const tot = useMemo(() => totais(p, faixa, ids), [p, faixa, ids]);

    const escopoBase = p.repos.filter((r) =>
        filtros.scope === "all"
            ? true
            : filtros.scope === "forks"
              ? r.fork
              : !r.fork,
    );
    const linguagensDoEscopo = [
        ...new Set(
            escopoBase.flatMap((r) =>
                r.languages.map(([id]) => p.langs[id].name),
            ),
        ),
    ].sort((a, b) => a.localeCompare(b));
    const nomesRepos = escopoBase
        .map((r) => r.name)
        .sort((a, b) => a.localeCompare(b));

    const periodoValor =
        filtros.period.kind === "year"
            ? `${filtros.period.year}`
            : filtros.period.kind;
    const rotuloPeriodo =
        filtros.period.kind === "12m"
            ? t("ghp.period.12m")
            : filtros.period.kind === "year"
              ? String(filtros.period.year)
              : t("ghp.period.since").replace(
                    "{date}",
                    formatDate(p.createdAt, lang),
                );

    return (
        <div ref={ref} className={`ghp-tab${visto ? " is-in" : ""}`}>
            <div
                className="ghp-filters"
                role="group"
                aria-label={t("ghp.filters.label")}
            >
                <div className="ghp-filters__row">
                    <Segmentado<Escopo>
                        rotulo={t("ghp.f.scope")}
                        valor={filtros.scope}
                        onChange={(scope) =>
                            set({ scope, lang: null, repo: null })
                        }
                        opcoes={[
                            { value: "own", label: t("ghp.f.scope.own") },
                            { value: "forks", label: t("ghp.f.scope.forks") },
                            { value: "all", label: t("ghp.f.all") },
                        ]}
                    />
                    <Seletor
                        id="ghp-v-period"
                        rotulo={t("ghp.f.period")}
                        valor={periodoValor}
                        onChange={(v) =>
                            set({
                                period:
                                    v === "12m" || v === "all"
                                        ? { kind: v }
                                        : { kind: "year", year: Number(v) },
                            })
                        }
                        opcoes={[
                            { value: "12m", label: t("ghp.period.12m") },
                            ...anosDisponiveis(p).map((a) => ({
                                value: String(a),
                                label: String(a),
                            })),
                            { value: "all", label: t("ghp.period.all") },
                        ]}
                    />
                    <details
                        className="ghp-more"
                        open={
                            Boolean(filtros.lang || filtros.repo) || undefined
                        }
                    >
                        <summary>{t("ghp.filters.more")}</summary>
                        <div className="ghp-more__body">
                            <Seletor
                                id="ghp-v-lang"
                                rotulo={t("ghp.f.lang")}
                                valor={filtros.lang ?? ""}
                                onChange={(v) =>
                                    set({ lang: v || null, repo: null })
                                }
                                opcoes={[
                                    { value: "", label: t("ghp.f.all") },
                                    ...linguagensDoEscopo.map((n) => ({
                                        value: n,
                                        label: n,
                                    })),
                                ]}
                            />
                            <Seletor
                                id="ghp-v-repo"
                                rotulo={t("ghp.f.repo")}
                                valor={filtros.repo ?? ""}
                                onChange={(v) => set({ repo: v || null })}
                                opcoes={[
                                    { value: "", label: t("ghp.f.all") },
                                    ...nomesRepos.map((n) => ({
                                        value: n,
                                        label: n,
                                    })),
                                ]}
                            />
                        </div>
                    </details>
                </div>
                <ResumoFiltros
                    ativos={ativos(filtros, PANORAMA_PADRAO)}
                    onLimpar={() => setFiltros(PANORAMA_PADRAO)}
                />
            </div>

            {repos.length === 0 ? (
                <p className="ghp__empty" role="status">
                    {t("ghp.noResults")}
                </p>
            ) : (
                <>
                    <dl className="ghp__kpis ghp-anim">
                        {(
                            [
                                [
                                    "ghp.kpi.repos",
                                    repos.length,
                                    "ghp.hint.current",
                                ],
                                [
                                    "ghp.kpi.stars",
                                    repos.reduce((s, r) => s + r.stars, 0),
                                    "ghp.hint.current",
                                ],
                                [
                                    "ghp.kpi.forks",
                                    repos.reduce((s, r) => s + r.forks, 0),
                                    "ghp.hint.current",
                                ],
                                ["ghp.kpi.commits", tot.commits, null],
                            ] as [
                                TranslationKey,
                                number,
                                TranslationKey | null,
                            ][]
                        ).map(([rot, v, dica]) => (
                            <div key={rot} className="ghp__kpi">
                                <dt>
                                    <span className="ghp__kpi-label">
                                        {t(rot)}
                                    </span>
                                    <span className="ghp__kpi-hint">
                                        {dica ? t(dica) : rotuloPeriodo}
                                    </span>
                                </dt>
                                <dd>
                                    <Numero valor={v} ativo={visto} />
                                </dd>
                            </div>
                        ))}
                    </dl>

                    <div className="ghp__cols">
                        <Painel
                            id="ghp-stats"
                            titulo={t("ghp.stats.title")}
                            nota={t("ghp.stats.note").replace(
                                "{period}",
                                rotuloPeriodo,
                            )}
                            className="ghp-anim"
                        >
                            <dl className="ghp__rows">
                                {(
                                    [
                                        ["ghp.stats.commits", tot.commits],
                                        ["ghp.stats.prs", tot.pullRequests],
                                        ["ghp.stats.issues", tot.issues],
                                        ["ghp.stats.reviews", tot.reviews],
                                        ["ghp.stats.repos", tot.repos],
                                    ] as [TranslationKey, number][]
                                ).map(([rot, v]) => (
                                    <div key={rot} className="ghp__row">
                                        <dt>{t(rot)}</dt>
                                        <dd>
                                            <Numero valor={v} ativo={visto} />
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </Painel>

                        <Painel
                            id="ghp-history"
                            titulo={t("ghp.history.title")}
                            nota={t("ghp.history.note")}
                            className="ghp-anim"
                        >
                            <dl className="ghp__rows">
                                {(
                                    [
                                        ["ghp.stats.prsAll", p.pullRequests],
                                        ["ghp.stats.issuesAll", p.issues],
                                        ["ghp.stats.followers", p.followers],
                                        ["ghp.history.contrib", p.streak.total],
                                    ] as [TranslationKey, number][]
                                ).map(([rot, v]) => (
                                    <div key={rot} className="ghp__row">
                                        <dt>{t(rot)}</dt>
                                        <dd>
                                            <Numero valor={v} ativo={visto} />
                                        </dd>
                                    </div>
                                ))}
                                <div className="ghp__row">
                                    <dt>{t("ghp.milestones.since")}</dt>
                                    <dd>{formatDate(p.createdAt, lang)}</dd>
                                </div>
                            </dl>
                        </Painel>
                    </div>
                </>
            )}
        </div>
    );
};
