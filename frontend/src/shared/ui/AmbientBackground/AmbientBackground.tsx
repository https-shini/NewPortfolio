import React, { useRef, useEffect } from "react";
import "./AmbientBackground.css";

/* ─────────────────────────────────────────────────────────
   AmbientBackground — a atmosfera do site, atrás de tudo
   ─────────────────────────────────────────────────────────
   Quatro camadas com ritmos deliberadamente diferentes: as
   manchas de aurora levam minutos, a malha leva um minuto, as
   partículas levam segundos. É o descompasso entre elas que
   cria profundidade — na mesma velocidade, o olho leria uma
   camada só.

   Nasceu na /links e passou a valer para o portfólio inteiro;
   extrair foi o que impediu as duas de divergirem na primeira
   correção feita só de um lado.

   As partículas são criadas no DOM por referência, no mount: o
   render continua puro, sem Math.random, e não há setState
   dentro de efeito. A animação em si é toda CSS, então roda
   fora da thread principal e não disputa com a rolagem.

   Sob prefers-reduced-motion nenhuma partícula é criada — não
   é caso de animar mais devagar, e sim de não animar.
   Decoração pura, então `aria-hidden` em tudo.
───────────────────────────────────────────────────────── */

interface AmbientBackgroundProps {
    /**
     * Quantas partículas flutuam.
     *
     * A mesma densidade nas duas páginas, de propósito: o portfólio pede
     * a atmosfera da /links, não uma versão contida dela. Tentei conter e
     * o resultado foi um fundo que não existia na tela.
     */
    count?: number;
    /** Marca a variante no CSS, para ajustes pontuais por página. */
    variant?: "site" | "links";
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Sorteio com peso: `p` é a chance de verdadeiro. */
const chance = (p: number) => Math.random() < p;

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
    count = 26,
    variant = "site",
}) => {
    const boxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const box = boxRef.current;
        if (!box) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            return;

        const frag = document.createDocumentFragment();

        for (let i = 0; i < count; i++) {
            /* Uma em cada cinco é um orbe: maior, mais lento, mais
               apagado. São eles que dão a camada de fundo — sem essa
               diferença de porte, 26 pontos iguais leem como ruído. */
            const orbe = chance(0.2);
            const size = orbe ? rand(10, 22) : rand(2, 5);

            /* A direção vertical também varia. Tudo subindo lê como
               fumaça; uma parte descendo lê como poeira em suspensão. */
            const sobe = chance(0.75);
            const dy = sobe ? rand(-220, -90) : rand(70, 170);

            /* O desvio do meio do percurso cai para o lado oposto do
               final, o que curva a trajetória em vez de inclinar a reta. */
            const dx = rand(-70, 70);
            const mx = -dx * rand(0.4, 0.9);

            const p = document.createElement("span");
            p.className = orbe
                ? "ambient__particle ambient__particle--orb"
                : "ambient__particle";

            p.style.cssText = [
                `left:${rand(0, 100)}%`,
                `top:${rand(0, 100)}%`,
                `width:${size}px`,
                `height:${size}px`,
                `--dx:${dx}px`,
                `--mx:${mx}px`,
                `--dy:${dy}px`,
                `--dur:${orbe ? rand(38, 62) : rand(16, 32)}s`,
                `--delay:${rand(0, 14)}s`,
                `--peak:${orbe ? rand(0.16, 0.3) : rand(0.4, 0.68)}`,
                `filter:blur(${orbe ? rand(3, 7) : rand(0, 1.2)}px)`,
                `background:radial-gradient(circle,${
                    chance(0.5) ? "var(--color-accent)" : "var(--color-brand)"
                },transparent 70%)`,
            ].join(";");

            frag.appendChild(p);
        }

        /* Um append só: 26 inserções separadas provocam 26 recálculos. */
        box.appendChild(frag);

        return () => {
            box.replaceChildren();
        };
    }, [count]);

    return (
        <div className={`ambient ambient--${variant}`} aria-hidden="true">
            <div className="ambient__aurora" />
            <div className="ambient__grid" />
            <div className="ambient__overlay" />
            <div ref={boxRef} className="ambient__particles" />
        </div>
    );
};
