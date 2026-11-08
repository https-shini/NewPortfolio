import React, { useMemo } from "react";
import { LOCALE, formatNumber } from "@/features/devhub/format";
import { selos } from "@/features/devhub/panorama";
import type { GithubProfile } from "@/features/devhub/types";
import { useLang } from "@/shared/hooks/useLang";
import type { TranslationKey } from "@/shared/lib/translations";
import { useEmVista } from "./hooks";
import { Icone, type NomeIcone } from "./icones";

/* ─────────────────────────────────────────────────────────
   Aba "API do GitHub" — de onde vêm os números e como contam
   ─────────────────────────────────────────────────────────
   Todas as notas técnicas do panorama ficam aqui, num só lugar:
   fonte, horário da coleta, critérios de contagem, o que cada filtro
   afeta, as faixas dos selos e as limitações. As outras abas mostram
   só os dados. As limitações que dependem da coleta (contribuições
   privadas, limite de itens da API) são lidas do próprio perfil.
───────────────────────────────────────────────────────── */

/** Bloco com ícone, título e conteúdo. */
const Bloco: React.FC<{
    id: string;
    icone: NomeIcone;
    titulo: string;
    className?: string;
    children: React.ReactNode;
}> = ({ id, icone, titulo, className, children }) => (
    <section
        className={`ghp-api__block ghp-anim${className ? ` ${className}` : ""}`}
        aria-labelledby={id}
    >
        <h3 className="ghp-api__title" id={id}>
            <span className="ghp-api__icon">
                <Icone nome={icone} size={16} />
            </span>
            {titulo}
        </h3>
        {children}
    </section>
);

/** Lista simples a partir de chaves de tradução. */
const Lista: React.FC<{ chaves: TranslationKey[] }> = ({ chaves }) => {
    const { t } = useLang();
    return (
        <ul className="ghp-api__list">
            {chaves.map((k) => (
                <li key={k}>{t(k)}</li>
            ))}
        </ul>
    );
};

export const TabApi: React.FC<{ p: GithubProfile }> = ({ p }) => {
    const { lang, t } = useLang();
    const [ref, visto] = useEmVista<HTMLDivElement>();
    const faixas = useMemo(() => selos(p), [p]);
    const numero = new Intl.NumberFormat(LOCALE[lang]);
    const coleta = new Intl.DateTimeFormat(LOCALE[lang], {
        dateStyle: "long",
        timeStyle: "short",
    }).format(new Date(p.fetchedAt));

    return (
        <div ref={ref} className={`ghp-tab ghp-api${visto ? " is-in" : ""}`}>
            <dl className="ghp-api__status ghp-anim">
                <div>
                    <dt>
                        <Icone nome="source" size={14} />
                        {t("ghp.api.source")}
                    </dt>
                    <dd>{t("ghp.api.source.value")}</dd>
                </div>
                <div>
                    <dt>
                        <Icone nome="updated" size={14} />
                        {t("ghp.api.updated")}
                    </dt>
                    <dd>
                        <time dateTime={p.fetchedAt}>{coleta}</time>
                    </dd>
                </div>
                <div>
                    <dt>
                        <Icone nome="api" size={14} />
                        {t("ghp.api.profile")}
                    </dt>
                    <dd>@{p.login}</dd>
                </div>
            </dl>

            <div className="ghp-api__grid">
                <Bloco
                    id="ghp-api-source"
                    icone="source"
                    titulo={t("ghp.api.source.title")}
                >
                    <Lista
                        chaves={[
                            "ghp.api.source.1",
                            "ghp.api.source.2",
                            "ghp.api.source.3",
                        ]}
                    />
                </Bloco>

                <Bloco
                    id="ghp-api-criteria"
                    icone="criteria"
                    titulo={t("ghp.api.criteria.title")}
                >
                    <Lista
                        chaves={[
                            "ghp.api.criteria.1",
                            "ghp.api.criteria.2",
                            "ghp.api.criteria.3",
                            "ghp.api.criteria.4",
                            "ghp.api.criteria.5",
                        ]}
                    />
                </Bloco>

                <Bloco
                    id="ghp-api-filters"
                    icone="filters"
                    titulo={t("ghp.api.filters.title")}
                >
                    <div className="ghp-api__split">
                        <div>
                            <p className="ghp-api__label" data-tipo="sim">
                                <Icone nome="check" size={14} />
                                {t("ghp.api.filters.yes")}
                            </p>
                            <p className="ghp-api__text">
                                {t("ghp.api.filters.yes.list")}
                            </p>
                        </div>
                        <div>
                            <p className="ghp-api__label" data-tipo="nao">
                                <Icone nome="minus" size={14} />
                                {t("ghp.api.filters.no")}
                            </p>
                            <p className="ghp-api__text">
                                {t("ghp.api.filters.no.list")}
                            </p>
                        </div>
                    </div>
                </Bloco>

                <Bloco
                    id="ghp-api-limits"
                    icone="limits"
                    titulo={t("ghp.api.limits.title")}
                >
                    <ul className="ghp-api__list">
                        <li>{t("ghp.api.limits.1")}</li>
                        <li>
                            {p.lastYear.restricted > 0
                                ? t("ghp.api.limits.private").replace(
                                      "{n}",
                                      formatNumber(p.lastYear.restricted, lang),
                                  )
                                : t("ghp.api.limits.private.none")}
                        </li>
                        <li>
                            {t("ghp.api.limits.truncate")}{" "}
                            <strong
                                className="ghp-api__flag"
                                data-ok={!p.activity.truncated}
                            >
                                {p.activity.truncated
                                    ? t("ghp.api.limits.truncate.hit")
                                    : t("ghp.api.limits.truncate.ok")}
                            </strong>
                        </li>
                    </ul>
                </Bloco>

                <Bloco
                    id="ghp-api-badges"
                    icone="badges"
                    titulo={t("ghp.api.badges.title")}
                    className="ghp-api__block--wide"
                >
                    <p className="ghp-api__text">{t("ghp.api.badges.text")}</p>
                    <div
                        className="ghp-api__table-wrap"
                        role="region"
                        aria-label={t("ghp.api.badges.title")}
                        tabIndex={0}
                    >
                        <table className="ghp-api__table">
                            <thead>
                                <tr>
                                    <th scope="col">
                                        {t("ghp.api.badges.col.badge")}
                                    </th>
                                    {[1, 2, 3, 4].map((n) => (
                                        <th key={n} scope="col">
                                            {t(
                                                "ghp.api.badges.col.level",
                                            ).replace("{n}", String(n))}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {faixas.map((s) => (
                                    <tr key={s.id}>
                                        <th scope="row">
                                            <span className="ghp-api__badge">
                                                <Icone
                                                    nome={s.id as NomeIcone}
                                                    size={14}
                                                />
                                                {t(
                                                    `ghp.badge.${s.id}` as TranslationKey,
                                                )}
                                            </span>
                                        </th>
                                        {s.levels.map((v, i) => (
                                            <td key={v} data-done={s.level > i}>
                                                {numero.format(v)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Bloco>
            </div>
        </div>
    );
};
