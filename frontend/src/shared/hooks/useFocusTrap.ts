import { useEffect, useRef, type RefObject } from "react";

/** Seletor de elementos focáveis usado pelo trap. */
export const FOCUSABLE_SELECTOR =
    'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

interface FocusTrapOptions {
    /** Ativa o trap (normalmente o estado de "aberto" do overlay). */
    active: boolean;
    /** Chamado ao pressionar Escape. */
    onEscape?: () => void;
    /** Foca o primeiro elemento focável ao ativar (default: true). */
    autoFocus?: boolean;
    /** Devolve o foco ao elemento anterior ao desativar (default: true). */
    restoreFocus?: boolean;
}

/**
 * useFocusTrap — mantém o foco do teclado dentro de `containerRef`.
 *
 * · Foco inicial no primeiro elemento focável
 * · Tab/Shift+Tab ciclam sem sair do container
 * · Escape dispara `onEscape`
 * · Restaura o foco ao elemento anteriormente focado ao desativar
 *
 * Compartilhado entre o Modal base e o drawer de navegação do Header.
 */
export function useFocusTrap(
    containerRef: RefObject<HTMLElement | null>,
    {
        active,
        onEscape,
        autoFocus = true,
        restoreFocus = true,
    }: FocusTrapOptions,
): void {
    /* Ref estável — evita reexecutar o efeito (e refocar) quando o
       consumidor passa um callback inline recriado a cada render. */
    const onEscapeRef = useRef(onEscape);
    useEffect(() => {
        onEscapeRef.current = onEscape;
    }, [onEscape]);

    useEffect(() => {
        if (!active) return;

        const previouslyFocused =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;

        let raf = 0;
        if (autoFocus) {
            raf = requestAnimationFrame(() => {
                containerRef.current
                    ?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
                    ?.focus({ preventScroll: true });
            });
        }

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                onEscapeRef.current?.();
                return;
            }
            if (e.key !== "Tab" || !containerRef.current) return;

            const els = Array.from(
                containerRef.current.querySelectorAll<HTMLElement>(
                    FOCUSABLE_SELECTOR,
                ),
            ).filter((el) => !el.hasAttribute("disabled"));
            if (!els.length) return;

            const first = els[0]!;
            const last = els[els.length - 1]!;

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
            if (raf) cancelAnimationFrame(raf);
            document.removeEventListener("keydown", handleKey);
            if (restoreFocus) {
                previouslyFocused?.focus({ preventScroll: true });
            }
        };
    }, [active, autoFocus, restoreFocus, containerRef]);
}
