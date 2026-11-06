import React from "react";
import { formatDate, formatNumber } from "@/features/devhub/format";
import type { RepoStats } from "@/features/devhub/types";
import { useLang } from "@/shared/hooks/useLang";
import type { TranslationKey } from "@/shared/lib/translations";

/* ─────────────────────────────────────────────────────────
   ProjectMetrics — números do perfil no GitHub
   ─────────────────────────────────────────────────────────
   Tudo calculado da coleta (`repoStats`); nenhum número fixo. Uma
   métrica que o GitHub não informou (seguidores, por exemplo) não
   vira zero — sai da lista, porque zero afirmaria um dado falso.

   `<dl>` com o número no `<dd>` e o rótulo no `<dt>`: o leitor de
   tela anuncia "repositórios públicos: 86".
───────────────────────────────────────────────────────── */

interface Props {
    stats: RepoStats | null;
    fetchedAt: string | null;
}

const ITENS: { key: keyof RepoStats; label: TranslationKey }[] = [
    { key: "repos", label: "devhub.stats.repos" },
    { key: "stars", label: "devhub.stats.stars" },
    { key: "followers", label: "devhub.stats.followers" },
    { key: "languages", label: "devhub.stats.languages" },
    { key: "active", label: "devhub.stats.active" },
];

export const ProjectMetrics: React.FC<Props> = ({ stats, fetchedAt }) => {
    const { lang, t } = useLang();

    const visiveis = ITENS.filter(
        ({ key }) => stats === null || stats[key] !== null,
    );

    return (
        <section className="devhub-metrics-wrap" aria-labelledby="devhub-stats">
            <h2 id="devhub-stats" className="sr-only">
                {t("devhub.stats.label")}
            </h2>
            <dl className="devhub-metrics" aria-busy={stats === null}>
                {visiveis.map(({ key, label }) => {
                    const valor = stats?.[key];
                    return (
                        <div key={key} className="devhub-metric">
                            <dt className="devhub-metric__label">{t(label)}</dt>
                            <dd className="devhub-metric__value">
                                {typeof valor === "number"
                                    ? formatNumber(valor, lang)
                                    : "—"}
                            </dd>
                        </div>
                    );
                })}
            </dl>
            {fetchedAt && (
                <p className="devhub-metrics__source">
                    {t("devhub.stats.source")}{" "}
                    <time dateTime={fetchedAt}>
                        {formatDate(fetchedAt, lang)}
                    </time>
                </p>
            )}
        </section>
    );
};
