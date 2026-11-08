import React from "react";
import { formatNumber } from "@/features/devhub/format";
import { useLang } from "@/shared/hooks/useLang";
import { useNumeroAnimado } from "./hooks";

/* ─────────────────────────────────────────────────────────
   Peças do panorama — número animado, visibilidade, filtros
   ─────────────────────────────────────────────────────────
   Animação sempre curta e só na mudança: o número conta do valor
   anterior até o novo (do zero, na primeira vez que entra na tela).
   Com `prefers-reduced-motion`, o valor final aparece direto.
───────────────────────────────────────────────────────── */

/** Número formatado no idioma, com contagem animada. */
export const Numero: React.FC<{ valor: number; ativo: boolean }> = ({
    valor,
    ativo,
}) => {
    const { lang } = useLang();
    const v = useNumeroAnimado(valor, ativo);
    /* O texto acessível é sempre o valor final; a contagem é visual. */
    return (
        <>
            <span aria-hidden="true">{formatNumber(v, lang)}</span>
            <span className="sr-only">{formatNumber(valor, lang)}</span>
        </>
    );
};

/* ── Filtros ───────────────────────────────────────────── */

export interface Opcao<T extends string> {
    value: T;
    label: string;
}

/** Grupo de botões exclusivos (aria-pressed), compacto. */
export function Segmentado<T extends string>({
    rotulo,
    valor,
    opcoes,
    onChange,
}: {
    rotulo: string;
    valor: T;
    opcoes: Opcao<T>[];
    onChange: (v: T) => void;
}) {
    return (
        <div className="ghp-seg" role="group" aria-label={rotulo}>
            {opcoes.map((o) => (
                <button
                    key={o.value}
                    type="button"
                    className="ghp-seg__btn"
                    aria-pressed={o.value === valor}
                    onClick={() => onChange(o.value)}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}

/** Seletor nativo com rótulo visível curto. */
export function Seletor({
    id,
    rotulo,
    valor,
    opcoes,
    onChange,
}: {
    id: string;
    rotulo: string;
    valor: string;
    opcoes: Opcao<string>[];
    onChange: (v: string) => void;
}) {
    return (
        <label className="ghp-select" htmlFor={id}>
            <span className="ghp-select__label">{rotulo}</span>
            <select
                id={id}
                value={valor}
                onChange={(e) => onChange(e.target.value)}
            >
                {opcoes.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

/** Cabeçalho da barra: quantos filtros ativos + limpar. */
export const ResumoFiltros: React.FC<{
    ativos: number;
    onLimpar: () => void;
}> = ({ ativos, onLimpar }) => {
    const { t } = useLang();
    return (
        <div className="ghp-filters__meta">
            <span className="ghp-filters__count" aria-live="polite">
                {ativos === 0
                    ? t("ghp.filters.none")
                    : t(
                          ativos === 1
                              ? "ghp.filters.activeOne"
                              : "ghp.filters.active",
                      ).replace("{n}", String(ativos))}
            </span>
            <button
                type="button"
                className="ghp-filters__clear"
                onClick={onLimpar}
                disabled={ativos === 0}
            >
                {t("ghp.filters.clear")}
            </button>
        </div>
    );
};

/** Painel com título e nota opcional. */
export const Painel: React.FC<{
    id: string;
    titulo: string;
    nota?: React.ReactNode;
    acao?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}> = ({ id, titulo, nota, acao, className, children }) => (
    <section
        className={`ghp__panel${className ? ` ${className}` : ""}`}
        aria-labelledby={id}
    >
        <header className="ghp__panel-head">
            <div className="ghp__panel-text">
                <h3 className="ghp__panel-title" id={id}>
                    {titulo}
                </h3>
                {nota && <p className="ghp__panel-note">{nota}</p>}
            </div>
            {acao}
        </header>
        {children}
    </section>
);
