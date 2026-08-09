import React, { useState, useRef, useEffect, useId, useCallback } from "react";
import "./Accordion.css";

/* ─────────────────────────────────────────────────────────
   Accordion — cabeçalho clicável + painel expansível
   ─────────────────────────────────────────────────────────
   Concentra a mecânica que estava duplicada: estado de
   abertura, ids do par botão/painel, medição de altura para a
   transição e a ligação ARIA completa
   (`aria-expanded`/`aria-controls` no botão; `role="region"` +
   `aria-labelledby` no painel).

   Não impõe aparência: o consumidor passa o conteúdo do
   cabeçalho e do corpo, e um `classPrefix` de onde saem as
   classes BEM (`prefixo__trigger`, `prefixo__panel`…). Assim o
   CSS de cada widget continua sendo dele.

   Aceita uso controlado (`open` + `onToggle`) ou não
   controlado (`defaultOpen`).
───────────────────────────────────────────────────────── */

type RootTag = "article" | "div" | "li" | "section";

export interface AccordionProps {
    /** Conteúdo do cabeçalho clicável. */
    trigger: React.ReactNode;
    /** Conteúdo do painel expansível. */
    children: React.ReactNode;
    /**
     * Prefixo BEM das classes. Ex.: "position-entry" gera
     * `position-entry__trigger` e `position-entry__panel`.
     */
    classPrefix: string;
    /** Estado inicial no modo não controlado. */
    defaultOpen?: boolean;
    /** Estado no modo controlado — exige `onToggle`. */
    open?: boolean;
    /** Chamado com o próximo estado ao clicar no cabeçalho. */
    onToggle?: (next: boolean) => void;
    /** Elemento raiz. */
    as?: RootTag;
    className?: string;
    style?: React.CSSProperties;
    /** Rótulo acessível do botão, quando o conteúdo visível não basta. */
    triggerLabel?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
    trigger,
    children,
    classPrefix,
    defaultOpen = false,
    open,
    onToggle,
    as: Root = "div",
    className,
    style,
    triggerLabel,
}) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : uncontrolledOpen;

    const bodyRef = useRef<HTMLDivElement>(null);
    const [bodyHeight, setBodyHeight] = useState<number | "auto">(
        defaultOpen ? "auto" : 0,
    );

    const panelId = useId();
    const buttonId = useId();

    /* Mede o corpo para animar a altura. O ResizeObserver cobre também
       mudanças de conteúdo (troca de idioma, imagem que carrega). */
    useEffect(() => {
        const el = bodyRef.current;
        if (!el) return;

        const measure = () => setBodyHeight(isOpen ? el.scrollHeight : 0);
        measure();

        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, [isOpen]);

    const handleToggle = useCallback(() => {
        const next = !isOpen;
        if (!isControlled) setUncontrolledOpen(next);
        onToggle?.(next);
    }, [isOpen, isControlled, onToggle]);

    return (
        <Root
            className={`${classPrefix}${isOpen ? " is-open" : ""}${className ? ` ${className}` : ""}`}
            style={style}
        >
            <button
                id={buttonId}
                type="button"
                className={`${classPrefix}__trigger`}
                aria-expanded={isOpen}
                aria-controls={panelId}
                aria-label={triggerLabel}
                onClick={handleToggle}
            >
                {trigger}
            </button>

            <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={`accordion__panel ${classPrefix}__panel`}
                style={{
                    height: bodyHeight === "auto" ? "auto" : `${bodyHeight}px`,
                }}
                aria-hidden={!isOpen}
                /* `inert` acompanha o `aria-hidden`: sem ele, um link ou
                   botão dentro do painel fechado continuaria alcançável
                   por Tab, num conteúdo que o leitor de tela não anuncia.
                   Escrito via ref porque o React 18 não conhece o atributo. */
                ref={(el) => {
                    if (!el) return;
                    if (isOpen) el.removeAttribute("inert");
                    else el.setAttribute("inert", "");
                }}
            >
                <div ref={bodyRef} className={`${classPrefix}__panel-inner`}>
                    {children}
                </div>
            </div>
        </Root>
    );
};
