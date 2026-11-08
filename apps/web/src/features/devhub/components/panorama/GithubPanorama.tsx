import React, { useRef, useState } from "react";
import "./Panorama.css";
import {
    CONTRIB_PADRAO,
    LINGUAGENS_PADRAO,
    PANORAMA_PADRAO,
    type FiltrosContribuicoes,
    type FiltrosLinguagens,
    type FiltrosPanorama,
} from "@/features/devhub/panorama";
import { useDevhubProfile } from "@/features/devhub/useDevhub";
import { GITHUB_URL } from "@/shared/config/constants";
import { useLang } from "@/shared/hooks/useLang";
import type { TranslationKey } from "@/shared/lib/translations";
import { IconExternalLink, IconGitHub } from "@/shared/ui/Icons";
import { TabApi } from "./TabApi";
import { TabConquistas } from "./TabConquistas";
import { TabContribuicoes } from "./TabContribuicoes";
import { TabLinguagens } from "./TabLinguagens";
import { TabSequencias } from "./TabSequencias";
import { TabVisao } from "./TabVisao";

/* ─────────────────────────────────────────────────────────
   GithubPanorama — o perfil no GitHub, em duas abas
   ─────────────────────────────────────────────────────────
   Janela de navegador: três pontos (decorativos), SEIS abas de
   verdade (tablist com setas ←/→, Home e End), cada uma com o seu
   conjunto de métricas e filtros independentes, e o endereço — o
   único link, que abre o perfil em nova aba.

     Visão geral    → indicadores e estatísticas      (TabVisao)
     Linguagens     → volume de código e principais   (TabLinguagens)
     Contribuições  → calendário, evolução e tipos    (TabContribuicoes)
     Sequências     → constância, anos e marcos       (TabSequencias)
     Conquistas     → selos agrupados pelo que medem  (TabConquistas)
     API do GitHub  → fonte, critérios e limitações   (TabApi)

   As notas técnicas (fonte, horário, critérios, limitações) ficam
   só na aba "API do GitHub"; as demais mostram apenas os dados.

   Os filtros de cada aba moram AQUI: trocar de aba não perde o
   recorte nem refaz a busca (os dados vêm de um único `op=profile`,
   com cache na CDN e no navegador).
───────────────────────────────────────────────────────── */

type Aba = "visao" | "langs" | "contrib" | "streak" | "badges" | "api";
const ABAS: Aba[] = ["visao", "langs", "contrib", "streak", "badges", "api"];

/* Ícones das abas (favicons). Desenhos genéricos, não marcas. */
const ICONE: Record<Exclude<Aba, "visao">, React.ReactNode> = {
    langs: <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />,
    contrib: (
        <>
            <rect x="3" y="3" width="5" height="5" rx="1" />
            <rect x="10" y="3" width="5" height="5" rx="1" />
            <rect x="17" y="3" width="4" height="5" rx="1" />
            <rect x="3" y="10" width="5" height="5" rx="1" />
            <rect x="10" y="10" width="5" height="5" rx="1" />
            <rect x="3" y="17" width="5" height="4" rx="1" />
        </>
    ),
    streak: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
    badges: (
        <>
            <circle cx="12" cy="9" r="6" />
            <path d="m8.5 14-1.5 8 5-3 5 3-1.5-8" />
        </>
    ),
    api: (
        <path d="M8 4H7a2 2 0 0 0-2 2v4l-2 2 2 2v4a2 2 0 0 0 2 2h1M16 4h1a2 2 0 0 1 2 2v4l2 2-2 2v4a2 2 0 0 1-2 2h-1" />
    ),
};
const ENDERECO = GITHUB_URL.replace(/^https:\/\//, "");

export const GithubPanorama: React.FC = () => {
    const { t } = useLang();
    const { data, loading, error } = useDevhubProfile();
    const [aba, setAba] = useState<Aba>("visao");
    const [fVisao, setFVisao] = useState<FiltrosPanorama>(PANORAMA_PADRAO);
    const [fLangs, setFLangs] = useState<FiltrosLinguagens>(LINGUAGENS_PADRAO);
    const [fContrib, setFContrib] =
        useState<FiltrosContribuicoes>(CONTRIB_PADRAO);
    const refs = useRef<Partial<Record<Aba, HTMLButtonElement | null>>>({});

    const teclas = (e: React.KeyboardEvent) => {
        const i = ABAS.indexOf(aba);
        const alvo =
            e.key === "ArrowRight"
                ? ABAS[(i + 1) % ABAS.length]
                : e.key === "ArrowLeft"
                  ? ABAS[(i - 1 + ABAS.length) % ABAS.length]
                  : e.key === "Home"
                    ? ABAS[0]
                    : e.key === "End"
                      ? ABAS[ABAS.length - 1]
                      : null;
        if (!alvo) return;
        e.preventDefault();
        setAba(alvo);
        const el = refs.current[alvo];
        el?.focus();
        el?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    };

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

            <div className="ghp__window">
                <div className="ghp__chrome">
                    <span className="ghp__dots" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                    </span>
                    <div
                        className="ghp__tabs"
                        role="tablist"
                        aria-label={t("ghp.tabs")}
                    >
                        {ABAS.map((a) => (
                            <button
                                key={a}
                                ref={(el) => {
                                    refs.current[a] = el;
                                }}
                                type="button"
                                role="tab"
                                id={`ghp-tab-${a}`}
                                aria-controls={`ghp-panel-${a}`}
                                aria-selected={aba === a}
                                tabIndex={aba === a ? 0 : -1}
                                className="ghp__tab"
                                onClick={() => setAba(a)}
                                onKeyDown={teclas}
                            >
                                {a === "visao" ? (
                                    <span
                                        className="ghp__tab-icon"
                                        aria-hidden="true"
                                    >
                                        <IconGitHub width={14} height={14} />
                                    </span>
                                ) : (
                                    <svg
                                        className="ghp__tab-icon"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        {ICONE[a]}
                                    </svg>
                                )}
                                <span className="ghp__tab-label">
                                    {t(`ghp.tab.${a}` as TranslationKey)}
                                </span>
                            </button>
                        ))}
                    </div>
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
                        <span className="ghp__url">{ENDERECO}</span>
                        <IconExternalLink width={12} height={12} aria-hidden />
                    </a>
                </div>

                <div
                    className="ghp__body"
                    role="tabpanel"
                    id={`ghp-panel-${aba}`}
                    aria-labelledby={`ghp-tab-${aba}`}
                    key={aba}
                >
                    {loading ? (
                        <div
                            className="ghp__skeleton"
                            role="status"
                            aria-live="polite"
                        >
                            <span className="sr-only">{t("ghp.loading")}</span>
                            <div className="ghp__kpis" aria-hidden="true">
                                {[0, 1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="ghp__kpi ghp__shimmer"
                                    />
                                ))}
                            </div>
                            <div className="ghp__cols" aria-hidden="true">
                                <div className="ghp__panel ghp__shimmer" />
                                <div className="ghp__panel ghp__shimmer" />
                            </div>
                        </div>
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
                    ) : aba === "visao" ? (
                        <TabVisao
                            p={data}
                            filtros={fVisao}
                            setFiltros={setFVisao}
                        />
                    ) : aba === "langs" ? (
                        <TabLinguagens
                            p={data}
                            filtros={fLangs}
                            setFiltros={setFLangs}
                        />
                    ) : aba === "contrib" ? (
                        <TabContribuicoes
                            p={data}
                            filtros={fContrib}
                            setFiltros={setFContrib}
                        />
                    ) : aba === "streak" ? (
                        <TabSequencias p={data} />
                    ) : aba === "badges" ? (
                        <TabConquistas p={data} />
                    ) : (
                        <TabApi p={data} />
                    )}
                </div>
            </div>
        </section>
    );
};
