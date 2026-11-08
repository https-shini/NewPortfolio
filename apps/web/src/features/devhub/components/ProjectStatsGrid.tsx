import React from "react";
import { formatNumber } from "@/features/devhub/format";
import type { Repository, RepositoryStats } from "@/features/devhub/types";
import { useLang } from "@/shared/hooks/useLang";
import type { Lang } from "@/shared/lib/translations";

/* ─────────────────────────────────────────────────────────
   ProjectStatsGrid — os números do repositório
   ─────────────────────────────────────────────────────────
   Regra da página: INDISPONÍVEL não é ZERO. Os números que vêm do
   índice (estrelas, forks, observadores, tamanho) existem sempre;
   os de `op=stats` só quando a API conseguiu lê-los. Enquanto
   carregam, o valor mostra "…" (com aria-busy); se não vieram,
   "Indisponível" — nunca um 0 inventado.
───────────────────────────────────────────────────────── */

interface Props {
    repo: Repository;
    stats: RepositoryStats | null;
    loading: boolean;
}

function tamanho(kb: number | null, lang: Lang): string | null {
    if (typeof kb !== "number" || !Number.isFinite(kb)) return null;
    const mb = kb / 1024;
    const fmt = new Intl.NumberFormat(lang === "pt" ? "pt-BR" : "en-US", {
        maximumFractionDigits: mb >= 10 ? 0 : 1,
    });
    return mb >= 1 ? `${fmt.format(mb)} MB` : `${fmt.format(kb)} KB`;
}

export const ProjectStatsGrid: React.FC<Props> = ({ repo, stats, loading }) => {
    const { lang, t } = useLang();
    const n = (v: number) => formatNumber(v, lang);

    /** `null` = indisponível (stats não vieram, ou aquele bloco falhou). */
    const deStats = <T,>(ler: (s: RepositoryStats) => T): T | null =>
        stats ? ler(stats) : null;

    const itens: {
        id: string;
        label: string;
        value: string | null;
        hint?: string | null;
        remoto?: boolean;
    }[] = [
        {
            id: "stars",
            label: t("devhub.detail.stars"),
            value: n(repo.stargazerCount),
        },
        {
            id: "forks",
            label: t("devhub.detail.forks"),
            value: n(repo.forkCount),
        },
        {
            id: "watchers",
            label: t("devhub.stats.watchers"),
            value:
                typeof repo.watcherCount === "number"
                    ? n(repo.watcherCount)
                    : null,
        },
        {
            id: "commits",
            label: t("devhub.stats.commits"),
            value: deStats((s) => (s.commits ? n(s.commits.total) : null)),
            hint: deStats((s) =>
                s.commits
                    ? t("devhub.stats.commitsYear").replace(
                          "{n}",
                          n(s.commits.lastYear),
                      )
                    : null,
            ),
            remoto: true,
        },
        {
            id: "issues",
            label: t("devhub.stats.issues"),
            value: deStats((s) => n(s.openIssues)),
            hint: deStats((s) =>
                t("devhub.stats.ofTotal").replace("{n}", n(s.totalIssues)),
            ),
            remoto: true,
        },
        {
            id: "prs",
            label: t("devhub.stats.prs"),
            value: deStats((s) => n(s.openPullRequests)),
            hint: deStats((s) =>
                t("devhub.stats.ofTotal").replace(
                    "{n}",
                    n(s.totalPullRequests),
                ),
            ),
            remoto: true,
        },
        {
            id: "branches",
            label: t("devhub.stats.branches"),
            value: deStats((s) => n(s.branches)),
            remoto: true,
        },
        {
            id: "releases",
            label: t("devhub.stats.releases"),
            value: deStats((s) => n(s.releases.total)),
            hint: deStats((s) =>
                t("devhub.stats.tagsCount").replace("{n}", n(s.tags)),
            ),
            remoto: true,
        },
        {
            id: "contributors",
            label: t("devhub.stats.contributors"),
            value: deStats((s) =>
                s.contributors ? n(s.contributors.total) : null,
            ),
            remoto: true,
        },
        {
            id: "size",
            label: t("devhub.stats.size"),
            value: tamanho(repo.diskUsageKb, lang),
        },
    ];

    return (
        <section
            className="devhub-numbers"
            aria-labelledby="devhub-numbers-title"
        >
            <h2 id="devhub-numbers-title" className="devhub-section__title">
                {t("devhub.stats.title")}
            </h2>
            <dl
                className="devhub-numbers__grid"
                aria-busy={loading || undefined}
            >
                {itens.map((it) => {
                    const carregando = it.remoto && loading;
                    const indisponivel = !carregando && it.value === null;
                    return (
                        <div
                            key={it.id}
                            className="devhub-numbers__item"
                            data-state={
                                carregando
                                    ? "loading"
                                    : indisponivel
                                      ? "unavailable"
                                      : undefined
                            }
                        >
                            <dt className="devhub-numbers__label">
                                {it.label}
                            </dt>
                            <dd className="devhub-numbers__value">
                                {carregando ? (
                                    <>
                                        <span aria-hidden="true">…</span>
                                        <span className="sr-only">
                                            {t("devhub.stats.loading")}
                                        </span>
                                    </>
                                ) : indisponivel ? (
                                    t("devhub.stats.unavailable")
                                ) : (
                                    it.value
                                )}
                            </dd>
                            {!carregando && it.hint && (
                                <dd className="devhub-numbers__hint">
                                    {it.hint}
                                </dd>
                            )}
                        </div>
                    );
                })}
            </dl>
            {!loading && !stats && (
                <p className="devhub-numbers__note">
                    {t("devhub.stats.unavailableNote")}
                </p>
            )}
        </section>
    );
};
