import React, { useEffect, useMemo, useRef } from "react";
import { formatNumber, LOCALE } from "@/features/devhub/format";
import {
    agrupar,
    dataDoDia,
    type Agrupamento,
} from "@/features/devhub/panorama";
import type { GithubProfile } from "@/features/devhub/types";
import { useLang } from "@/shared/hooks/useLang";
import { curto } from "./hooks";

/* ─────────────────────────────────────────────────────────
   Calendário e gráfico de evolução do panorama
   ─────────────────────────────────────────────────────────
   Calendário: revelação coluna a coluna ao entrar na tela; as
   células trocam de cor com transição quando o filtro muda.
   Gráfico: barras crescem com `scaleY` (sem salto de layout).
───────────────────────────────────────────────────────── */

const nivel = (n: number, max: number) =>
    n === 0 || max === 0 ? 0 : Math.min(4, Math.ceil((n / max) * 4));

export const Calendario: React.FC<{
    p: GithubProfile;
    inicio: number;
    counts: number[];
    visto: boolean;
}> = ({ p, inicio, counts, visto }) => {
    const { lang, t } = useLang();
    const rolagem = useRef<HTMLDivElement>(null);
    const { semanas, meses, max } = useMemo(() => {
        const offset = new Date(
            `${dataDoDia(p, inicio)}T00:00:00Z`,
        ).getUTCDay();
        const celulas = [
            ...Array.from({ length: offset }, () => null),
            ...counts.map((count, i) => ({
                date: dataDoDia(p, inicio + i),
                count,
            })),
        ];
        const semanas: (typeof celulas)[] = [];
        for (let i = 0; i < celulas.length; i += 7)
            semanas.push(celulas.slice(i, i + 7));
        const meses: { col: number; rotulo: string }[] = [];
        let ultimo = "";
        semanas.forEach((s, col) => {
            const m = s.find(Boolean)?.date.slice(0, 7) ?? "";
            if (m && m !== ultimo) {
                ultimo = m;
                meses.push({
                    col,
                    rotulo: new Intl.DateTimeFormat(LOCALE[lang], {
                        month: "short",
                        timeZone: "UTC",
                    }).format(new Date(`${m}-01T00:00:00Z`)),
                });
            }
        });
        return { semanas, meses, max: Math.max(0, ...counts) };
    }, [p, inicio, counts, lang]);

    useEffect(() => {
        const el = rolagem.current;
        if (el) el.scrollLeft = el.scrollWidth;
    }, [semanas.length]);

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
                    className={`ghp__cal${visto ? " is-in" : ""}`}
                    style={{ "--weeks": semanas.length } as React.CSSProperties}
                >
                    <div className="ghp__cal-months" aria-hidden="true">
                        {meses.map((m) => (
                            <span
                                key={m.col}
                                style={{ gridColumnStart: m.col + 1 }}
                            >
                                {m.rotulo}
                            </span>
                        ))}
                    </div>
                    <div className="ghp__cal-grid" aria-hidden="true">
                        {semanas.map((s, col) =>
                            s.map((d, row) =>
                                d ? (
                                    <span
                                        key={d.date}
                                        className="ghp__cell"
                                        data-l={nivel(d.count, max)}
                                        style={
                                            {
                                                gridColumn: col + 1,
                                                gridRow: row + 1,
                                                "--c": col,
                                            } as React.CSSProperties
                                        }
                                        title={`${formatNumber(d.count, lang)} · ${curto(d.date, lang, true)}`}
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
        </>
    );
};

export const Grafico: React.FC<{
    p: GithubProfile;
    inicio: number;
    counts: number[];
    group: Agrupamento;
    visto: boolean;
}> = ({ p, inicio, counts, group, visto }) => {
    const { lang } = useLang();
    const baldes = useMemo(
        () => agrupar(p, inicio, counts, group),
        [p, inicio, counts, group],
    );
    const max = Math.max(1, ...baldes.map((b) => b.total));
    const rotulo = (b: (typeof baldes)[number]) =>
        group === "month"
            ? new Intl.DateTimeFormat(LOCALE[lang], {
                  month: "short",
                  year: "2-digit",
                  timeZone: "UTC",
              }).format(new Date(`${b.start}T00:00:00Z`))
            : curto(b.start, lang);
    /* Até ~12 rótulos no eixo, espaçados por igual. */
    const passo = Math.max(1, Math.ceil(baldes.length / 12));
    return (
        <div className="ghp-chart">
            <ol
                className="ghp-chart__bars"
                style={{ "--n": baldes.length } as React.CSSProperties}
            >
                {baldes.map((b) => (
                    <li key={b.key}>
                        <span
                            className="ghp-chart__bar"
                            style={{
                                transform: `scaleY(${visto ? Math.max(b.total ? 0.02 : 0, b.total / max) : 0})`,
                            }}
                            aria-hidden="true"
                            title={`${rotulo(b)}: ${formatNumber(b.total, lang)}`}
                        />
                        <span className="sr-only">
                            {rotulo(b)}: {formatNumber(b.total, lang)}
                        </span>
                    </li>
                ))}
            </ol>
            <div
                className="ghp-chart__axis"
                aria-hidden="true"
                style={{ "--n": baldes.length } as React.CSSProperties}
            >
                {baldes.map((b, i) =>
                    i % passo === 0 ? (
                        <span
                            key={b.key}
                            className={
                                i % (passo * 3) === 0
                                    ? undefined
                                    : "ghp-chart__tick--minor"
                            }
                            style={{ gridColumnStart: i + 1 }}
                        >
                            {rotulo(b)}
                        </span>
                    ) : null,
                )}
            </div>
        </div>
    );
};
