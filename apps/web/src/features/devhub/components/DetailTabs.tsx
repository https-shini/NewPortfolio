import React, { useId, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────
   DetailTabs — abas no padrão WAI-ARIA APG (ativação manual
   não: ativação automática, porque trocar de aba é barato)
   ─────────────────────────────────────────────────────────
   Setas ←/→ andam entre as abas, Home/End vão às pontas; só a aba
   ativa fica no Tab order (roving tabindex). Os painéis inativos
   continuam montados só se já foram abertos — o primeiro render
   não paga pelo conteúdo das outras abas.
───────────────────────────────────────────────────────── */

export interface Tab {
    id: string;
    label: string;
    /** Contagem opcional exibida ao lado do rótulo. */
    badge?: string;
    content: React.ReactNode;
}

interface Props {
    label: string;
    tabs: Tab[];
}

export const DetailTabs: React.FC<Props> = ({ label, tabs }) => {
    const base = useId();
    const [ativa, setAtiva] = useState(tabs[0]?.id);
    const [abertas, setAbertas] = useState<Set<string>>(
        () => new Set(tabs[0] ? [tabs[0].id] : []),
    );
    const refs = useRef<Record<string, HTMLButtonElement | null>>({});

    const abrir = (id: string, focar = false) => {
        setAtiva(id);
        setAbertas((s) => (s.has(id) ? s : new Set(s).add(id)));
        if (focar) refs.current[id]?.focus();
    };

    const onKeyDown = (e: React.KeyboardEvent, i: number) => {
        const ultimo = tabs.length - 1;
        const destino =
            e.key === "ArrowRight"
                ? i === ultimo
                    ? 0
                    : i + 1
                : e.key === "ArrowLeft"
                  ? i === 0
                      ? ultimo
                      : i - 1
                  : e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? ultimo
                      : null;
        if (destino === null) return;
        e.preventDefault();
        abrir(tabs[destino].id, true);
    };

    return (
        <div className="devhub-tabs">
            <div
                className="devhub-tabs__list"
                role="tablist"
                aria-label={label}
            >
                {tabs.map((tab, i) => {
                    const sel = tab.id === ativa;
                    return (
                        <button
                            key={tab.id}
                            ref={(el) => {
                                refs.current[tab.id] = el;
                            }}
                            type="button"
                            role="tab"
                            id={`${base}-tab-${tab.id}`}
                            aria-selected={sel}
                            aria-controls={`${base}-panel-${tab.id}`}
                            tabIndex={sel ? 0 : -1}
                            className="devhub-tabs__tab"
                            onClick={() => abrir(tab.id)}
                            onKeyDown={(e) => onKeyDown(e, i)}
                        >
                            {tab.label}
                            {tab.badge && (
                                <span className="devhub-tabs__badge">
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
            {tabs.map((tab) => (
                <div
                    key={tab.id}
                    role="tabpanel"
                    id={`${base}-panel-${tab.id}`}
                    aria-labelledby={`${base}-tab-${tab.id}`}
                    hidden={tab.id !== ativa}
                    className="devhub-tabs__panel"
                >
                    {abertas.has(tab.id) && tab.content}
                </div>
            ))}
        </div>
    );
};
