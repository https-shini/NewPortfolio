import React, { useMemo } from "react";
import { LOCALE } from "@/features/devhub/format";
import { selos } from "@/features/devhub/panorama";
import type { GithubProfile } from "@/features/devhub/types";
import { useLang } from "@/shared/hooks/useLang";
import type { TranslationKey } from "@/shared/lib/translations";
import { useEmVista } from "./hooks";
import { Numero, Painel } from "./ui";

/* ─────────────────────────────────────────────────────────
   Aba "Conquistas" — selos com critério explícito
   ─────────────────────────────────────────────────────────
   Não são rankings nem troféus de terceiros: cada selo é um número
   do histórico (verificável no próprio GitHub) contra 4 faixas fixas
   definidas aqui (panorama.ts → `selos`). O cartão mostra o valor, o
   nível, o progresso até o próximo e a faixa seguinte.
───────────────────────────────────────────────────────── */

const SELO_ICONE: Record<string, string> = {
    contributions: "◆",
    commits: "⌁",
    pullRequests: "⇄",
    issues: "◎",
    reviews: "✓",
    languages: "</>",
    repos: "▣",
    stars: "★",
    streak: "↯",
};

export const TabConquistas: React.FC<{ p: GithubProfile }> = ({ p }) => {
    const { lang, t } = useLang();
    const [ref, visto] = useEmVista<HTMLDivElement>();
    const lista = useMemo(() => selos(p), [p]);
    const conquistados = lista.filter((s) => s.level > 0).length;
    return (
        <div ref={ref} className={`ghp-tab${visto ? " is-in" : ""}`}>
            <p className="ghp-scope">
                <strong>
                    {t("ghp.badges.summary")
                        .replace("{n}", String(conquistados))
                        .replace("{total}", String(lista.length))}
                </strong>{" "}
                · {t("ghp.streak.note")}
            </p>
            <Painel
                id="ghp-badges"
                titulo={t("ghp.badges.title")}
                nota={t("ghp.badges.note")}
                className="ghp-anim"
            >
                <ul className="ghp-badges">
                    {lista.map((s) => (
                        <li
                            key={s.id}
                            className="ghp-badge"
                            data-level={s.level}
                        >
                            <span
                                className="ghp-badge__icon"
                                aria-hidden="true"
                            >
                                {SELO_ICONE[s.id]}
                            </span>
                            <span className="ghp-badge__title">
                                {t(`ghp.badge.${s.id}` as TranslationKey)}
                            </span>
                            <span className="ghp-badge__value">
                                <Numero valor={s.value} ativo={visto} />
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
                                aria-label={t(
                                    `ghp.badge.${s.id}` as TranslationKey,
                                )}
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
                                          new Intl.NumberFormat(
                                              LOCALE[lang],
                                          ).format(s.next),
                                      )}
                            </span>
                        </li>
                    ))}
                </ul>
            </Painel>
        </div>
    );
};
