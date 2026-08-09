import React, { useRef } from "react";
import { createPortal } from "react-dom";
import "./Modal.css";
import { useScrollLock } from "@/shared/hooks/useScrollLock";
import { useFocusTrap } from "@/shared/hooks/useFocusTrap";
import { useInertBackground } from "@/shared/hooks/useInertBackground";

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

    /* Mecânica compartilhada — hooks reutilizados pelo drawer do Header.
       Os três se dividem: a trava congela a página e devolve a posição,
       o inerte neutraliza ponteiro e leitor de tela, o trap cuida do
       teclado. */
    useScrollLock(isOpen);
    useInertBackground(dialogRef, isOpen);
    useFocusTrap(dialogRef, { active: isOpen, onEscape: onClose });

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
