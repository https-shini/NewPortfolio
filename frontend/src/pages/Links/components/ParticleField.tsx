import React, { useRef, useEffect } from "react";

/* ─────────────────────────────────────────────────────────
   ParticleField — orbes ambientes flutuantes (decorativo).
   As partículas são criadas imperativamente no DOM (ref) no
   mount — o render permanece puro (sem Math.random) e não há
   setState em efeito. A animação em si é 100% CSS.
   Respeita prefers-reduced-motion: se ativo, não cria nada.
───────────────────────────────────────────────────────── */

interface ParticleFieldProps {
    count?: number;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export const ParticleField: React.FC<ParticleFieldProps> = ({ count = 26 }) => {
    const boxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const box = boxRef.current;
        if (!box) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            return;

        for (let i = 0; i < count; i++) {
            const p = document.createElement("span");
            p.className = "linktree__particle";
            const size = rand(2, 6);
            const accent = rand(0, 1) > 0.5;
            p.style.cssText = [
                `left:${rand(0, 100)}%`,
                `top:${rand(0, 100)}%`,
                `width:${size}px`,
                `height:${size}px`,
                `--dx:${rand(-60, 60)}px`,
                `--dy:${rand(-200, -80)}px`,
                `--dur:${rand(18, 34)}s`,
                `--delay:${rand(0, 20)}s`,
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
        <div ref={boxRef} className="linktree__particles" aria-hidden="true" />
    );
};
