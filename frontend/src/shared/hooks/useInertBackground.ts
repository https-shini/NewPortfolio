import { useEffect, type RefObject } from "react";

/* ─────────────────────────────────────────────────────────
   useInertBackground — neutraliza o resto da página
   ─────────────────────────────────────────────────────────
   O focus-trap resolve Tab e Escape, mas o fundo continuava
   alcançável por clique, por toque e pelo cursor virtual de um
   leitor de tela. O atributo `inert` resolve os três de uma vez:
   o subárvore inteira sai da ordem de foco, para de receber
   eventos de ponteiro e desaparece da árvore de acessibilidade.

   Aplicado aos filhos diretos do <body>, poupando aquele que
   contém o overlay — é por isso que todo overlay do projeto vive
   num portal para o <body>. Marcar `#root` inteiro seria mais
   simples, mas desligaria junto qualquer overlay renderizado
   dentro dele.

   Escrito via DOM, e não como prop: o React 18 não conhece
   `inert` e o repassaria como atributo string.
───────────────────────────────────────────────────────── */

/**
 * useInertBackground — enquanto `active`, torna inerte tudo o que
 * estiver fora de `overlayRef`.
 *
 * Overlays aninhados compõem sem se atrapalhar: um elemento que já
 * estava inerte não é remarcado, e portanto não é reativado quando o
 * overlay de cima fecha.
 */
export function useInertBackground(
    overlayRef: RefObject<HTMLElement | null>,
    active: boolean,
): void {
    useEffect(() => {
        if (!active || typeof document === "undefined") return;

        const overlay = overlayRef.current;
        const marked: HTMLElement[] = [];

        for (const child of Array.from(document.body.children)) {
            if (!(child instanceof HTMLElement)) continue;
            if (overlay && child.contains(overlay)) continue;
            if (child.hasAttribute("inert")) continue;

            child.setAttribute("inert", "");
            marked.push(child);
        }

        return () => {
            for (const el of marked) el.removeAttribute("inert");
        };
    }, [active, overlayRef]);
}
