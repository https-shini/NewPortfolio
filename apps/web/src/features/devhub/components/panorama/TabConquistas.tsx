import React, { useMemo } from "react";
import { LOCALE } from "@/features/devhub/format";
import { selos } from "@/features/devhub/panorama";
import type { GithubProfile } from "@/features/devhub/types";
import { useLang } from "@/shared/hooks/useLang";
import type { TranslationKey } from "@/shared/lib/translations";
import { useEmVista } from "./hooks";
import { Icone, type NomeIcone } from "./icones";
import { Numero } from "./ui";

/* ─────────────────────────────────────────────────────────
   Aba "Conquistas" — selos agrupados pelo que medem
   ─────────────────────────────────────────────────────────
   Cada selo é um número do histórico contra 4 faixas fixas
   (panorama.ts → `selos`). Os nove ficam em três grupos de três:
   Constância (ritmo), Colaboração (trabalho com outras pessoas) e
   Portfólio (o que fica publicado). Os critérios e o escopo dos
   dados moram na aba "API do GitHub", não aqui.
───────────────────────────────────────────────────────── */

type Grupo = "constancy" | "collaboration" | "portfolio";

const GRUPOS: { id: Grupo; selos: NomeIcone[] }[] = [
    { id: "constancy", selos: ["contributions", "commits", "streak"] },
    { id: "collaboration", selos: ["pullRequests", "issues", "reviews"] },
    { id: "portfolio", selos: ["repos", "languages", "stars"] },
];

export const TabConquistas: React.FC<{ p: GithubProfile }> = ({ p }) => {
    const { lang, t } = useLang();
    const [ref, visto] = useEmVista<HTMLDivElement>();
    const lista = useMemo(() => selos(p), [p]);
    const porId = useMemo(() => new Map(lista.map((s) => [s.id, s])), [lista]);
    const conquistados = lista.filter((s) => s.level > 0).length;
    const numero = new Intl.NumberFormat(LOCALE[lang]);

    return (
        <div ref={ref} className={`ghp-tab${visto ? " is-in" : ""}`}>
            <p className="ghp-scope">
                <strong>
                    {t("ghp.badges.summary")
                        .replace("{n}", String(conquistados))
                        .replace("{total}", String(lista.length))}
                </strong>
            </p>

            {GRUPOS.map((g) => {
                const itens = g.selos.flatMap((id) => {
                    const s = porId.get(id);
                    return s ? [s] : [];
                });
                const feitos = itens.filter((s) => s.level > 0).length;
                const tituloId = `ghp-badges-${g.id}`;
                return (
                    <section
                        key={g.id}
                        className="ghp-bgroup ghp-anim"
                        aria-labelledby={tituloId}
                    >
                        <header className="ghp-bgroup__head">
                            <span className="ghp-bgroup__icon">
                                <Icone nome={g.id} size={16} />
                            </span>
                            <div className="ghp-bgroup__text">
                                <h3 className="ghp-bgroup__title" id={tituloId}>
                                    {t(`ghp.bgroup.${g.id}` as TranslationKey)}
                                </h3>
                                <p className="ghp-bgroup__desc">
                                    {t(
                                        `ghp.bgroup.${g.id}.desc` as TranslationKey,
                                    )}
                                </p>
                            </div>
                            <span className="ghp-bgroup__count">
                                {t("ghp.bgroup.count")
                                    .replace("{n}", String(feitos))
                                    .replace("{total}", String(itens.length))}
                            </span>
                        </header>
                        <ul className="ghp-badges">
                            {itens.map((s) => {
                                const nome = t(
                                    `ghp.badge.${s.id}` as TranslationKey,
                                );
                                return (
                                    <li
                                        key={s.id}
                                        className="ghp-badge"
                                        data-level={s.level}
                                    >
                                        <span className="ghp-badge__icon">
                                            <Icone
                                                nome={s.id as NomeIcone}
                                                size={20}
                                            />
                                        </span>
                                        <span className="ghp-badge__title">
                                            {nome}
                                        </span>
                                        <span className="ghp-badge__value">
                                            <Numero
                                                valor={s.value}
                                                ativo={visto}
                                            />
                                        </span>
                                        <span className="ghp-badge__level">
                                            {t("ghp.badge.level")
                                                .replace("{n}", String(s.level))
                                                .replace(
                                                    "{total}",
                                                    String(s.levels.length),
                                                )}
                                        </span>
                                        <span
                                            className="ghp-badge__bar"
                                            role="progressbar"
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                            aria-valuenow={s.progress}
                                            aria-label={nome}
                                        >
                                            <span
                                                style={{
                                                    transform: `scaleX(${visto ? s.progress / 100 : 0})`,
                                                }}
                                            />
                                        </span>
                                        <span className="ghp-badge__next">
                                            {s.next === null
                                                ? t("ghp.badge.max")
                                                : t("ghp.badge.next").replace(
                                                      "{n}",
                                                      numero.format(s.next),
                                                  )}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                );
            })}
        </div>
    );
};
