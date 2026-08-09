import React, { useRef, useEffect } from "react";
import "./AmbientBackground.css";
import { useAmbientMotion } from "./useAmbientMotion";

/* ─────────────────────────────────────────────────────────
   AmbientBackground — a atmosfera do site, atrás de tudo
   ─────────────────────────────────────────────────────────
   Duas profundidades, não quatro camadas soltas:

     fundo   aurora — manchas largas, ciclos de minutos
     frente  malha + partículas — a MESMA grade

   A ideia que sustenta o resto: as partículas não flutuam
   por cima da malha, elas SÃO pontos da malha que acenderam.
   Nascem em interseções da grade, andam um número inteiro de
   células e apagam. Por isso as duas dividem o mesmo passo,
   a mesma fração de paralaxe e o mesmo plano — o que antes
   eram dois efeitos de "pontinhos" sobrepostos virou um só.

   É também o que separa isto de um preset: pontos subindo em
   posições aleatórias existe em qualquer lugar; pontos que
   respeitam a grade do próprio design, não.

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
     * Teto de partículas, antes dos cortes por tela e por aparelho.
     *
     * Baixou de 26 para 18 quando elas ganharam halo e tamanho: um ponto
     * que se vê vale por três que não se viam. Subiu para 24 quando a
     * correção da deriva deu à caixa uma sangria de 130px em cada extremo
     * — a área a povoar cresceu junto.
     */
    count?: number;
    /** Marca a variante no CSS, para ajustes pontuais por página. */
    variant?: "site" | "links";
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Sorteio com peso: `p` é a chance de verdadeiro. */
const chance = (p: number) => Math.random() < p;

/** Inteiro em [min, max]. */
const randInt = (min: number, max: number) => Math.round(rand(min, max));

/**
 * Quanto da densidade cheia este aparelho merece.
 *
 * Os três sinais são declarativos e estáveis — o navegador responde a
 * mesma coisa a cada leitura. Já tentei inferir capacidade medindo
 * quadros e não funciona: o laço dorme quando não há nada a fazer, então
 * o intervalo entre quadros mede a pausa, não o custo, e a heurística
 * degradava a atmosfera em máquina de 60fps. Sinal declarado é pior como
 * estimativa e melhor como decisão.
 */
function fracaoDeDensidade(): number {
    let f = 1;

    const largura = window.innerWidth;
    /* Tela pequena é quase sempre também a GPU mais fraca, e a área a
       cobrir é menor de qualquer forma. */
    if (largura < 700) f *= 0.5;
    else if (largura < 1100) f *= 0.75;

    /* Quem pediu economia de dados pediu economia de tudo. */
    const nav = navigator as Navigator & {
        connection?: { saveData?: boolean };
        deviceMemory?: number;
    };
    if (
        nav.connection?.saveData ||
        window.matchMedia("(prefers-reduced-data: reduce)").matches
    )
        f *= 0.4;

    /* 4GB ou menos é o território dos aparelhos que engasgam. O valor é
       arredondado pelo navegador de propósito, então serve de faixa e
       não de medida — que é exatamente o uso que se faz dele aqui. */
    if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) f *= 0.6;

    return f;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
    count = 24,
    variant = "site",
}) => {
    const boxRef = useRef<HTMLDivElement>(null);
    const raizRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const box = boxRef.current;
        if (!box) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            return;

        const semear = () => {
            const total = Math.max(8, Math.round(count * fracaoDeDensidade()));

            /* O passo da grade vem do CSS, não de um número repetido aqui: é a
               mesma medida que desenha a malha, e duplicá-la seria garantir que
               um dia as duas divergissem. */
            const estilo = getComputedStyle(box);
            const passo =
                parseFloat(estilo.getPropertyValue("--ambient-step")) || 26;

            /* As dimensões vêm da CAIXA, não da janela. Com a sangria da
               deriva a caixa é bem mais alta que a janela, e semear pela
               janela deixaria justamente a faixa de sangria vazia — que é a
               faixa que a deriva traz para dentro da tela. */
            const caixa = box.getBoundingClientRect();
            const L = caixa.width || window.innerWidth;
            const H = caixa.height || window.innerHeight;

            /* A malha desenha o ponto no centro de cada célula, então as
               interseções ficam em meio-passo + n·passo. */
            const naGrade = (n: number) => passo / 2 + n * passo;
            const colunas = Math.max(1, Math.floor(L / passo));
            const linhas = Math.max(1, Math.floor(H / passo));

            /* Amostragem estratificada em DUAS dimensões: a caixa é dividida
               numa grade de estratos e cada partícula sorteia dentro do seu.
               Estratificar só por coluna, como antes, ainda deixava o
               agrupamento vertical acontecer — e agrupamento lê como
               descuido, não como acaso. */
            const estCol = Math.max(
                1,
                Math.round(Math.sqrt((total * L) / Math.max(1, H))),
            );
            const estLin = Math.max(1, Math.ceil(total / estCol));

            const frag = document.createDocumentFragment();

            for (let i = 0; i < total; i++) {
                /* Uma em cada cinco é um orbe: maior, mais lento, mais
               apagado. São eles que dão a camada de fundo — sem essa
               diferença de porte, pontos iguais leem como ruído. */
                const orbe = chance(0.2);
                const size = orbe ? rand(12, 20) : rand(3, 5);
                const dur = orbe ? rand(38, 62) : rand(16, 32);

                /* Estrato desta partícula, com sorteio dentro dele. */
                const ec = i % estCol;
                const el = Math.floor(i / estCol) % estLin;
                const col = Math.min(
                    colunas - 1,
                    Math.max(
                        0,
                        Math.round(((ec + Math.random()) * colunas) / estCol),
                    ),
                );
                const lin = Math.min(
                    linhas - 1,
                    Math.max(
                        0,
                        Math.round(((el + Math.random()) * linhas) / estLin),
                    ),
                );

                /* Sobe ou desce um número INTEIRO de células, então parte de
               uma interseção e chega em outra. */
                const sobe = chance(0.75);
                const celulas = orbe ? randInt(3, 6) : randInt(4, 9);
                const dy = (sobe ? -1 : 1) * celulas * passo;
                /* O desvio lateral também fecha na grade; o do meio do
               percurso cai para o lado oposto, o que curva a trajetória
               em vez de inclinar a reta. */
                const dx = randInt(-2, 2) * passo;
                const mx = -dx * rand(0.4, 0.9);

                /* Quatro para uma: a cor de apoio manda, o destaque pontua.
               Meio a meio entre duas cortes fortes lê como confete. */
                const cor = chance(0.22)
                    ? "var(--ambient-dot-b)"
                    : "var(--ambient-dot-a)";

                const p = document.createElement("span");
                p.className = orbe
                    ? "ambient__particle ambient__particle--orb"
                    : "ambient__particle";

                p.style.cssText = [
                    `left:${naGrade(col) - size / 2}px`,
                    `top:${naGrade(lin) - size / 2}px`,
                    `width:${size}px`,
                    `height:${size}px`,
                    `--dx:${dx}px`,
                    `--mx:${mx}px`,
                    `--dy:${dy}px`,
                    `--dur:${dur}s`,
                    /* Atraso NEGATIVO: a animação entra já no meio do ciclo e
                   o campo nasce povoado. Com atraso positivo — o que este
                   arquivo fazia — a primeira impressão era um céu quase
                   vazio que levava 14 SEGUNDOS para encher. */
                    `--delay:${-rand(0, dur)}s`,
                    `--peak:${orbe ? rand(0.14, 0.24) : rand(0.34, 0.55)}`,
                    /* O halo é `box-shadow`, e a escolha da propriedade é a
                   parte que importa.

                   `filter: blur()` está fora: foi ele que custou 83ms por
                   quadro na aurora, porque é reaplicado enquanto o
                   elemento se move. Paradas de gradiente também não
                   resolvem — num ponto de 4px a queda inteira cabe em um
                   pixel e o resultado continua sendo um disco chapado,
                   que lê como pixel queimado e não como luz.

                   `box-shadow` é rasterizado UMA vez dentro da camada da
                   partícula e depois viaja junto com o `transform`. Custo
                   por quadro: zero. E o halo tem três vezes o diâmetro do
                   núcleo, que é a proporção em que o olho lê brilho. */
                    orbe
                        ? `background:radial-gradient(circle,color-mix(in srgb,${cor} 52%,transparent) 0%,color-mix(in srgb,${cor} 20%,transparent) 45%,transparent 72%)`
                        : `background:${cor}`,
                    orbe
                        ? ""
                        : `box-shadow:0 0 ${(size * 2.4).toFixed(1)}px ${(
                              size * 0.4
                          ).toFixed(
                              1,
                          )}px color-mix(in srgb,${cor} 42%,transparent)`,
                ].join(";");

                frag.appendChild(p);
            }

            /* Um append só: N inserções separadas provocam N recálculos. */
            box.replaceChildren(frag);
        };

        semear();

        /* Re-semeadura com guarda. Girar o telefone muda tudo e precisa
           re-semear; a barra de URL do navegador móvel, que mexe 60 a 100px
           na altura durante a própria rolagem, não pode disparar nada — ali
           re-semear seria pior que o defeito. */
        let larguraAnterior = window.innerWidth;
        let alturaAnterior = window.innerHeight;
        let agendado = 0;
        const aoRedimensionar = () => {
            const dl = window.innerWidth !== larguraAnterior;
            const dh =
                Math.abs(window.innerHeight - alturaAnterior) / alturaAnterior >
                0.25;
            if (!dl && !dh) return;
            larguraAnterior = window.innerWidth;
            alturaAnterior = window.innerHeight;
            clearTimeout(agendado);
            agendado = window.setTimeout(semear, 200);
        };
        window.addEventListener("resize", aoRedimensionar, { passive: true });

        return () => {
            clearTimeout(agendado);
            window.removeEventListener("resize", aoRedimensionar);
            box.replaceChildren();
        };
    }, [count]);

    /* Declarado DEPOIS do efeito acima de propósito: efeitos rodam na
       ordem em que são declarados, então quando este roda as partículas
       já existem e podem ser medidas. Sinalizar isso por estado seria um
       setState dentro de efeito — uma renderização a mais para informar
       o que a ordem já garante. */
    useAmbientMotion(raizRef, count);

    return (
        <div
            ref={raizRef}
            className={`ambient ambient--${variant}`}
            aria-hidden="true"
        >
            <div className="ambient__aurora" />
            <div className="ambient__grid" />
            {/* O véu fica ENTRE a malha e as partículas de propósito: ele
                assenta a aurora e a grade, e deixa os pontos acesos por
                cima, nítidos. Envolver os dois num mesmo elemento os tiraria
                do `position: fixed` e empurraria o véu para cima deles — o
                "mesmo plano" das duas camadas é a fração de paralaxe que
                compartilham, não a árvore do DOM. */}
            <div className="ambient__overlay" />
            <div ref={boxRef} className="ambient__particles" />
        </div>
    );
};
