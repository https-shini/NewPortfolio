import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./Modal.css";

/* ─────────────────────────────────────────────────────────
   Modal — componente base reutilizável de diálogo modal.
   ─────────────────────────────────────────────────────────
   Centraliza toda a mecânica compartilhada entre modais:
   · createPortal para document.body
   · Overlay (backdrop) com fechamento por clique fora
   · Scroll-lock do <body> enquanto aberto
   · Focus-trap (Tab/Shift+Tab ciclando dentro do dialog)
   · Foco inicial no primeiro elemento focável
   · Restauração do foco ao elemento anterior no fechamento
   · Fechamento por Escape
   · role="dialog" + aria-modal + aria-labelledby/label

   O conteúdo e o layout interno são responsabilidade de quem
   consome (via `children`); dimensões por instância são
   ajustadas via `className` com as custom properties
   `--modal-width` e `--modal-max-height`.
───────────────────────────────────────────────────────── */

export interface ModalProps {
    /** Controla a visibilidade; quando false, nada é renderizado. */
    isOpen: boolean;
    /** Chamado ao fechar (Esc, clique no overlay ou ação interna). */
    onClose: () => void;
    /** Conteúdo do dialog — layout interno é do consumidor. */
    children: React.ReactNode;
    /** id do elemento que titula o dialog (aria-labelledby). */
    labelledBy?: string;
    /** Rótulo direto quando não há elemento de título (aria-label). */
    label?: string;
    /** id do elemento que descreve o dialog (aria-describedby). */
    describedBy?: string;
    /** Classe extra aplicada ao dialog (layout/dimensões da instância). */
    className?: string;
}

const FOCUSABLE =
    'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    children,
    labelledBy,
    label,
    describedBy,
    className,
}) => {
    const dialogRef = useRef<HTMLDivElement>(null);

    /* Ref estável para onClose — evita re-executar o efeito (e re-focar)
       quando o consumidor passa um callback inline que muda a cada render. */
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    /* Mecânica compartilhada — roda apenas enquanto aberto. */
    useEffect(() => {
        if (!isOpen) return;

        /* Elemento a restaurar o foco quando o modal fechar. */
        const previouslyFocused =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;

        /* Scroll-lock preservando o overflow anterior do body. */
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        /* Foco inicial no primeiro elemento focável do dialog. */
        const raf = requestAnimationFrame(() => {
            const first =
                dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
            first?.focus({ preventScroll: true });
        });

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                onCloseRef.current();
                return;
            }
            if (e.key !== "Tab" || !dialogRef.current) return;

            const els = Array.from(
                dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
            ).filter((el) => !el.hasAttribute("disabled"));
            if (!els.length) return;

            const first = els[0];
            const last = els[els.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKey);
        return () => {
            cancelAnimationFrame(raf);
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = prevOverflow;
            previouslyFocused?.focus({ preventScroll: true });
        };
    }, [isOpen]);

    if (!isOpen || typeof document === "undefined") return null;

    const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return createPortal(
        <div
            className="modal-backdrop"
            role="presentation"
            onMouseDown={handleBackdropMouseDown}
        >
            <div
                ref={dialogRef}
                className={`modal-dialog${className ? ` ${className}` : ""}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={labelledBy}
                aria-label={label}
                aria-describedby={describedBy}
            >
                {children}
            </div>
        </div>,
        document.body,
    );
};
