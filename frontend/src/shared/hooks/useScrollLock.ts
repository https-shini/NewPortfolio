import { useEffect } from "react";

/**
 * useScrollLock — trava a rolagem do <body> enquanto `active` for true,
 * restaurando o valor anterior de `overflow` ao destravar/desmontar.
 *
 * Usado por overlays que cobrem a página (Modal base, drawer do Header)
 * para evitar o "scroll por trás" do conteúdo sobreposto.
 */
export function useScrollLock(active: boolean): void {
    useEffect(() => {
        if (!active) return;

        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previous;
        };
    }, [active]);
}
