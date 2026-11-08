import React, { useMemo, useState } from "react";
import { LOCALE } from "@/features/devhub/format";
import {
    ativos,
    linguagens,
    LINGUAGENS_PADRAO,
    reposFiltrados,
    type Escopo,
    type FiltrosLinguagens,
} from "@/features/devhub/panorama";
import type { GithubProfile } from "@/features/devhub/types";
import { useLang } from "@/shared/hooks/useLang";
import { useEmVista } from "./hooks";
import { Numero, Painel, ResumoFiltros, Segmentado, Seletor } from "./ui";

/* ─────────────────────────────────────────────────────────
   Aba "Linguagens" — volume de código por linguagem
   ─────────────────────────────────────────────────────────
   Dois recortes da MESMA fonte (bytes medidos pelo GitHub em cada
   repositório) e duas leituras:
     · distribuição por bytes (barras individuais ou segmentada);
     · linguagem principal de cada repositório (contagem).
   Em forks, os bytes incluem o código do projeto original — por isso
   o escopo padrão é "Autorais".
───────────────────────────────────────────────────────── */

export const TabLinguagens: React.FC<{
    p: GithubProfile;
    filtros: FiltrosLinguagens;
    setFiltros: (f: FiltrosLinguagens) => void;
}> = ({ p, filtros, setFiltros }) => {
    const { lang, t } = useLang();
    const [ref, visto] = useEmVista<HTMLDivElement>();
    const [hover, setHover] = useState<string | null>(null);
    const set = (parcial: Partial<FiltrosLinguagens>) =>
        setFiltros({ ...filtros, ...parcial });

    const repos = useMemo(
        () => reposFiltrados(p, { ...filtros, lang: null }),
        [p, filtros],
    );
    const fatias = useMemo(() => linguagens(p, repos), [p, repos]);
    const principais = useMemo(() => {
        const conta = new Map<string, { n: number; color: string | null }>();
        for (const r of repos) {
            const l = r.lang === null ? null : p.langs[r.lang];
            const nome = l?.name ?? "—";
            conta.set(nome, {
                n: (conta.get(nome)?.n ?? 0) + 1,
                color: l?.color ?? null,
            });
        }
        return [...conta.entries()].sort((a, b) => b[1].n - a[1].n);
    }, [p, repos]);
    const maxPrincipal = Math.max(1, ...principais.map(([, v]) => v.n));
    const escopoBase = p.repos.filter((r) =>
        filtros.scope === "all"
            ? true
            : filtros.scope === "forks"
              ? r.fork
              : !r.fork,
    );
    const pct = new Intl.NumberFormat(LOCALE[lang], {
        maximumFractionDigits: 1,
    });
    const kb = new Intl.NumberFormat(LOCALE[lang], {
        maximumFractionDigits: 0,
    });
    const filtrosAtivos = ativos(
        { scope: filtros.scope, repo: filtros.repo },
        { scope: LINGUAGENS_PADRAO.scope, repo: LINGUAGENS_PADRAO.repo },
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
                        onChange={(scope) => set({ scope, repo: null })}
                        opcoes={[
                            { value: "own", label: t("ghp.f.scope.own") },
                            { value: "forks", label: t("ghp.f.scope.forks") },
                            { value: "all", label: t("ghp.f.all") },
                        ]}
                    />
                    <Seletor
                        id="ghp-l-repo"
                        rotulo={t("ghp.f.repo")}
                        valor={filtros.repo ?? ""}
                        onChange={(v) => set({ repo: v || null })}
                        opcoes={[
                            { value: "", label: t("ghp.f.all") },
                            ...escopoBase
                                .map((r) => r.name)
                                .sort((a, b) => a.localeCompare(b))
                                .map((n) => ({ value: n, label: n })),
                        ]}
                    />
                </div>
                <ResumoFiltros
                    ativos={filtrosAtivos}
                    onLimpar={() =>
                        setFiltros({ ...LINGUAGENS_PADRAO, view: filtros.view })
                    }
                />
            </div>

            {fatias.length === 0 ? (
                <p className="ghp__empty" role="status">
                    {t("ghp.noResults")}
                </p>
            ) : (
                <div className="ghp__cols ghp__cols--wide">
                    <Painel
                        id="ghp-langs"
                        titulo={t("ghp.langs.title")}
                        nota={t("ghp.langs.note").replace(
                            "{n}",
                            String(repos.length),
                        )}
                        className="ghp-anim"
                        acao={
                            <Segmentado
                                rotulo={t("ghp.langs.view")}
                                valor={filtros.view}
                                onChange={(view) => set({ view })}
                                opcoes={[
                                    {
                                        value: "bars",
                                        label: t("ghp.langs.bars"),
                                    },
                                    {
                                        value: "segmented",
                                        label: t("ghp.langs.segmented"),
                                    },
                                ]}
                            />
                        }
                    >
                        <div
                            className="ghp__langbar"
                            aria-hidden="true"
                            data-modo={filtros.view}
                        >
                            {fatias.map((l) => (
                                <span
                                    key={l.name}
                                    data-hover={
                                        hover === l.name ? "" : undefined
                                    }
                                    style={{
                                        flexGrow: l.percent,
                                        background:
                                            l.color ?? "var(--color-text-4)",
                                    }}
                                />
                            ))}
                        </div>
                        <ul className="ghp__langs" data-modo={filtros.view}>
                            {fatias.map((l) => {
                                const cor = l.color ?? "var(--color-text-4)";
                                return (
                                    <li
                                        key={l.name}
                                        onPointerEnter={() => setHover(l.name)}
                                        onPointerLeave={() => setHover(null)}
                                    >
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
                                        {filtros.view === "bars" && (
                                            <span
                                                className="ghp__lang-track"
                                                aria-hidden="true"
                                            >
                                                <span
                                                    style={{
                                                        transform: `scaleX(${visto ? Math.max(0.01, l.percent / 100) : 0})`,
                                                        background: cor,
                                                    }}
                                                />
                                            </span>
                                        )}
                                        <span className="ghp__lang-kb">
                                            {kb.format(l.bytes / 1024)} KB
                                        </span>
                                        <span className="ghp__lang-pct">
                                            {pct.format(l.percent)}%
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </Painel>

                    <Painel
                        id="ghp-primary"
                        titulo={t("ghp.primary.title")}
                        nota={t("ghp.primary.note")}
                        className="ghp-anim"
                    >
                        <ul className="ghp-primary">
                            {principais.map(([nome, v]) => (
                                <li key={nome}>
                                    <span
                                        className="ghp__dot"
                                        style={{
                                            background:
                                                v.color ??
                                                "var(--color-text-4)",
                                        }}
                                        aria-hidden="true"
                                    />
                                    <span className="ghp__lang-name">
                                        {nome === "—"
                                            ? t("ghp.primary.none")
                                            : nome}
                                    </span>
                                    <span
                                        className="ghp__lang-track"
                                        aria-hidden="true"
                                    >
                                        <span
                                            style={{
                                                transform: `scaleX(${visto ? v.n / maxPrincipal : 0})`,
                                                background:
                                                    v.color ??
                                                    "var(--color-text-4)",
                                            }}
                                        />
                                    </span>
                                    <span className="ghp__lang-pct">
                                        <Numero valor={v.n} ativo={visto} />
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </Painel>
                </div>
            )}
        </div>
    );
};
