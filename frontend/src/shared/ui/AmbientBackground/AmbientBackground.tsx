import React, { useRef, useEffect } from "react";
import "./AmbientBackground.css";

/* ─────────────────────────────────────────────────────────
   AmbientBackground — a atmosfera do site, atrás de tudo
   ─────────────────────────────────────────────────────────
   Três camadas fixas: a malha de pontos, um véu de gradiente
   e as partículas que flutuam. Nasceu na /links e passou a
   valer para o portfólio inteiro — extrair foi o que impediu
   as duas de divergirem na primeira correção feita só de um
   lado.

   As partículas são criadas no DOM por referência, no mount:
   o render continua puro, sem Math.random, e não há setState
   dentro de efeito. A animação em si é toda CSS, então roda
   fora da thread principal e não disputa com a rolagem.

   Sob prefers-reduced-motion nenhuma partícula é criada — não
   é um caso de animar mais devagar, e sim de não animar.
   Decoração pura, então `aria-hidden` em tudo.
───────────────────────────────────────────────────────── */

interface AmbientBackgroundProps {
    /**
     * Quantas partículas flutuam.
     *
     * O portfólio usa menos que a /links de propósito. Lá é uma tela só,
     * quase um cartão, e o movimento é o assunto; aqui se rola por dez
     * seções de texto, e o mesmo efeito passa de ambiente a distração.
     */
    count?: number;
    /** Marca a variante de intensidade no CSS. */
    variant?: "site" | "links";
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
    count = 18,
    variant = "site",
}) => {
    const boxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const box = boxRef.current;
        if (!box) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            return;

        for (let i = 0; i < count; i++) {
            const p = document.createElement("span");
            p.className = "ambient__particle";
            const size = rand(2, 6);
            const accent = rand(0, 1) > 0.5;
            p.style.cssText = [
                `left:${rand(0, 100)}%`,
                `top:${rand(0, 100)}%`,
                `width:${size}px`,
                `height:${size}px`,
                `--dx:${rand(-60, 60)}px`,
                `--dy:${rand(-200, -80)}px`,
                `--dur:${rand(28, 52)}s`,
                `--delay:${rand(0, 10)}s`,
                `filter:blur(${rand(0, 1.5)}px)`,
                `background:radial-gradient(circle,${
                    accent ? "var(--color-accent)" : "var(--color-brand)"
                },transparent)`,
            ].join(";");
            box.appendChild(p);
        }

        return () => {
            box.replaceChildren();
        };
    }, [count]);

    return (
        <div className={`ambient ambient--${variant}`} aria-hidden="true">
            <div className="ambient__grid" />
            <div className="ambient__overlay" />
            <div ref={boxRef} className="ambient__particles" />
        </div>
    );
};
