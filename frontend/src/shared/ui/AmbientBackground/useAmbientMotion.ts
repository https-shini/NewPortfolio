import { useEffect } from "react";

/* ─────────────────────────────────────────────────────────
   useAmbientMotion — deriva de rolagem e desvio ao ponteiro
   ─────────────────────────────────────────────────────────
   Duas reações, um laço só.

   A deriva move UM plano conforme a rolagem — o das partículas
   — e o que o olho lê como profundidade é a DIFERENÇA de
   velocidade entre o conteúdo e ele, não a velocidade dele em
   si. É por isso que ela pode oscilar em vez de subir sem
   parar. As camadas são `fixed`, então sem isto ficariam
   paradas enquanto a página desliza.

   Aurora, bokeh e malha NÃO derivam mais. Antes os quatro
   planos andavam com a rolagem, cada um no seu período, e o
   resultado era movimento demais para quem só queria descer a
   página: a cena inteira reagia ao gesto. Agora o fundo e a
   iluminação ficam parados e as partículas são o que se move.
   As animações próprias da aurora e do bokeh continuam — elas
   levam minutos, não respondem à rolagem, e são o que mantém a
   atmosfera viva sem competir com a leitura.

   O desvio empurra de leve as partículas próximas ao cursor.
   O empurrão decai com a distância, então a mão parece abrir
   caminho em vez de arrastar um bloco.

   Por que `translate` e não `transform`: as partículas já têm
   uma animação de `transform` rodando pelo CSS, e escrever
   nessa propriedade a cancelaria. `translate` é propriedade
   independente, aplicada antes de `transform` — as duas se
   somam, e o CSS continua dono do movimento de base.

   Um `requestAnimationFrame` só, compartilhado, e ele dorme
   quando não há nada a fazer: rolagem parada e ponteiro
   quieto significam zero trabalho por quadro.
───────────────────────────────────────────────────────── */

/**
 * Deriva: `−A · sin(2π · s / L)`, com A e L vindos do CSS.
 *
 * Era uma rampa linear, e uma rampa sem limite sobre uma camada do
 * tamanho da janela tem um fim previsível: a camada sai da janela. Na
 * home, de 9.517px, a atmosfera esvaziava por completo antes do rodapé.
 *
 * Um plano só, agora: o das partículas. A malha continua sendo a grade de
 * onde elas nascem, mas parou de derivar junto — então o alinhamento
 * entre ponto aceso e ponto da malha vale no topo da página e se perde ao
 * rolar. Foi escolha consciente: a malha é fundo, e fundo devia ficar
 * parado. Os pontos da malha têm 13% de alfa no escuro e 8% no claro, em
 * 1px, e a diferença não se lê.
 *
 * Abaixo deste limiar a escrita não muda nada que se veja, e perto dos
 * extremos do seno a variação por quadro fica bem abaixo dele.
 */
const LIMIAR_ESCRITA = 0.25;

/** Alcance do empurrão, em pixels. */
const RAIO = 180;
/** Deslocamento máximo de uma partícula no centro do alcance. */
const FORCA = 26;
/** Quanto o valor corrente caminha para o alvo a cada quadro. */
const SUAVIZACAO = 0.12;
/** Abaixo disto o movimento é invisível e o laço pode dormir. */
const PARADO = 0.05;
/** Intervalo mínimo entre releituras de posição, em ms. */
const VALIDADE = 350;

interface Alvo {
    el: HTMLElement;
    /* Centro em coordenadas de viewport, já descontados a paralaxe do
       contêiner e o desvio da própria partícula — ou seja, onde ela
       estaria com a página no topo e o cursor longe. O que sobra aí
       dentro é a animação do CSS, que muda sozinha e por isso é
       relida de tempos em tempos. */
    cx: number;
    cy: number;
    px: number;
    py: number;
}

export function useAmbientMotion(
    raizRef: React.RefObject<HTMLElement | null>,
    quantidade: number,
): void {
    useEffect(() => {
        const raiz = raizRef.current;
        if (!raiz) return;

        const semMovimento = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (semMovimento) return;

        const particulas = raiz.querySelector<HTMLElement>(
            ".ambient__particles",
        );

        /* Ponteiro fino só: num toque não existe cursor pairando, e o
           desvio viraria um salto no momento do toque. */
        const temPonteiroFino = window.matchMedia("(pointer: fine)").matches;

        /* Amplitudes e períodos moram no CSS, junto da sangria que os
           acomoda — são a mesma decisão e não podem divergir. Lidos uma
           vez, no mount, nunca por quadro. */
        const css = getComputedStyle(raiz);
        const num = (nome: string, padrao: number) =>
            parseFloat(css.getPropertyValue(nome)) || padrao;
        const ampPerto = num("--ambient-drift-near", 7);
        const cicloPerto = num("--ambient-cycle-near", 2.2);

        /* Amplitude em % da altura da janela, período em número de telas.
           As duas dependem da janela, então mudam com ela — é o que faz a
           deriva ser proporcional no celular em vez de fixa em pixels. */
        let alturaJanela = window.innerHeight || 900;
        const deriva = (ampPct: number, ciclos: number, s: number) =>
            -((ampPct / 100) * alturaJanela) *
            Math.sin((2 * Math.PI * s) / (ciclos * alturaJanela));

        let mouseX = -9999;
        let mouseY = -9999;
        let rolagem = window.scrollY;
        let rolagemAplicada = -1;
        /* Quanto o contêiner de partículas já foi deslocado pela paralaxe.
           Sem isto o cursor é comparado com posições de antes da rolagem, e
           depois de descer meia tela nenhuma partícula parece estar por
           perto — foi exatamente o que quebrou a primeira versão. */
        let deslocamento = 0;
        let quadro = 0;
        let medidoEm = 0;

        let alvos: Alvo[] = [];

        /* Uma leitura de layout por partícula, todas seguidas e sem
           escrita no meio: o navegador recalcula uma vez, não 26. */
        const medir = () => {
            for (const a of alvos) {
                const r = a.el.getBoundingClientRect();
                a.cx = r.left + r.width / 2 - a.px;
                a.cy = r.top + r.height / 2 - a.py - deslocamento;
            }
            medidoEm = performance.now();
        };

        const montar = () => {
            if (!particulas) return;
            alvos = [...particulas.children].map((el) => ({
                el: el as HTMLElement,
                cx: 0,
                cy: 0,
                px: 0,
                py: 0,
            }));
            medir();
        };
        montar();

        const passo = () => {
            quadro = 0;

            /* Deriva — só escreve quando o valor mudou o suficiente para
               alguém ver. */
            if (rolagem !== rolagemAplicada) {
                rolagemAplicada = rolagem;

                const perto = deriva(ampPerto, cicloPerto, rolagem);
                if (Math.abs(perto - deslocamento) > LIMIAR_ESCRITA) {
                    deslocamento = perto;
                    if (particulas)
                        particulas.style.translate = `0 ${perto.toFixed(2)}px`;
                }
            }

            /* Desvio — caminha para o alvo e continua enquanto não
               chegar, para o retorno ser tão suave quanto a ida. */
            let emMovimento = false;
            if (temPonteiroFino) {
                for (const a of alvos) {
                    const dx = a.cx + a.px - mouseX;
                    const dy = a.cy + deslocamento + a.py - mouseY;
                    const d2 = dx * dx + dy * dy;

                    let ax = 0;
                    let ay = 0;
                    /* Compara o quadrado da distância para pagar a raiz
                       só nas poucas partículas que estão perto. */
                    if (d2 < RAIO * RAIO && d2 > 0.01) {
                        const dist = Math.sqrt(d2);
                        /* Decaimento quadrático: perto empurra bastante,
                           longe quase não empurra. */
                        const f = (1 - dist / RAIO) ** 2 * FORCA;
                        ax = (dx / dist) * f;
                        ay = (dy / dist) * f;
                    }

                    const nx = a.px + (ax - a.px) * SUAVIZACAO;
                    const ny = a.py + (ay - a.py) * SUAVIZACAO;

                    if (
                        Math.abs(nx - a.px) > PARADO ||
                        Math.abs(ny - a.py) > PARADO
                    ) {
                        a.px = nx;
                        a.py = ny;
                        a.el.style.translate = `${nx.toFixed(2)}px ${ny.toFixed(2)}px`;
                        emMovimento = true;
                    } else if (a.px !== 0 && ax === 0 && Math.abs(a.px) < 0.5) {
                        /* Encosta no zero em vez de parar num resto de
                           décimo de pixel, para o estilo poder sair do
                           elemento e a partícula voltar a ser só CSS. */
                        a.px = 0;
                        a.py = 0;
                        a.el.style.translate = "";
                    }
                }
            }

            if (emMovimento) agendar();
        };

        const agendar = () => {
            if (!quadro) quadro = requestAnimationFrame(passo);
        };

        const aoRolar = () => {
            rolagem = window.scrollY;
            agendar();
        };

        const aoMover = (e: PointerEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            /* As partículas andam sozinhas pelo CSS, então a posição
               guardada envelhece. Relê no máximo três vezes por segundo,
               e só enquanto há um cursor se mexendo: parado, ninguém
               está olhando para o desvio. */
            if (performance.now() - medidoEm > VALIDADE) medir();
            agendar();
        };

        const aoSair = () => {
            mouseX = -9999;
            mouseY = -9999;
            agendar();
        };

        const aoRedimensionar = () => {
            alturaJanela = window.innerHeight || alturaJanela;
            medir();
            rolagemAplicada = -1;
            agendar();
        };

        /* O componente re-semeia o campo quando a janela muda de forma, e
           essa re-semeadura é atrasada de propósito. Um `resize` aqui
           mediria os nós antigos. Observar a lista de filhos resolve sem
           os dois efeitos precisarem combinar tempo entre si. */
        const observador = particulas
            ? new MutationObserver(() => {
                  montar();
                  agendar();
              })
            : null;
        observador?.observe(particulas!, { childList: true });

        window.addEventListener("scroll", aoRolar, { passive: true });
        window.addEventListener("resize", aoRedimensionar, { passive: true });
        if (temPonteiroFino) {
            window.addEventListener("pointermove", aoMover, { passive: true });
            document.addEventListener("pointerleave", aoSair);
        }

        agendar();

        return () => {
            observador?.disconnect();
            if (quadro) cancelAnimationFrame(quadro);
            window.removeEventListener("scroll", aoRolar);
            window.removeEventListener("resize", aoRedimensionar);
            window.removeEventListener("pointermove", aoMover);
            document.removeEventListener("pointerleave", aoSair);
            for (const a of alvos) a.el.style.translate = "";
            if (particulas) particulas.style.translate = "";
        };
        /* `quantidade` entra como dependência porque trocá-la recria as
           partículas: sem isto o laço continuaria mirando nós que já
           saíram do documento. */
    }, [raizRef, quantidade]);
}
