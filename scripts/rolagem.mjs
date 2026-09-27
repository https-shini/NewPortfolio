/**
 * Atribuição do custo de estilo na rolagem da home.
 *
 *   npm run build && node scripts/rolagem.mjs
 *   node scripts/rolagem.mjs --json
 *
 * ── Por que existe, tendo perf.mjs ───────────────────────────────────
 *
 * O `perf.mjs` responde QUANTO a rolagem custa, decomposto em script,
 * estilo e layout. Não responde QUEM custa. "Estilo: 900 ms" não diz em
 * que superfície mexer, e mexer no lugar errado é pior que não mexer —
 * gasta o orçamento de mudança e não move o número.
 *
 * Aqui a pergunta é outra: desligando um suspeito, quanto do custo
 * desaparece? A diferença é a atribuição.
 *
 * ── O método, e por que ele é comparável ─────────────────────────────
 *
 * Mesma coleta do perf.mjs, de propósito: `Performance.getMetrics` do CDP,
 * ocupação da thread principal em vez de quadros por segundo. Em contêiner
 * não há GPU e o Chromium rasteriza por software, então contar quadros
 * mediria o rasterizador. `RecalcStyleDuration` é thread principal em
 * qualquer máquina.
 *
 * Mediana de três execuções por cenário. A regra vem do próprio histórico:
 * `docs/reference/PERFORMANCE-2026-08.md` registra que duas conclusões da
 * série saíram de execução única e uma delas estava errada.
 *
 * ── Por que CSS injetado, e não build separado ───────────────────────
 *
 * Um build por cenário mudaria o bundle, o hash dos arquivos e a ordem de
 * carga — e aí a comparação mediria também isso. Injetar CSS no documento
 * já construído altera só o que se quer isolar. `!important` no final da
 * cascata vence qualquer declaração da folha, sem precisar saber qual
 * seletor a produziu.
 *
 * ── O que este arranjo NÃO mede ──────────────────────────────────────
 *
 * Trabalho de compositor. Parte do custo de `backdrop-filter` vive lá, e
 * fora da thread principal — então um suspeito pode sair absolvido aqui e
 * ainda pesar no aparelho de quem visita. O que este arranjo afirma é sobre
 * recálculo de estilo e layout, não sobre pintura.
 */

import {
    startPreview,
    launchBrowser,
    THEME_KEY,
    LANG_KEY,
} from "./lib/browser.mjs";

const ROTA = "/";
const CPU = 4;
const REPETICOES = 3;

const json = process.argv.includes("--json");
/* `--contagem` troca o conjunto de cenários pela CURVA de quantas partículas
   ficam animando. É a alavanca que a atribuição isolou, e a única com
   consequência visual — então ela tem conjunto próprio, para poder ser medida
   sem esperar os doze cenários de diagnóstico. */
const curva = process.argv.includes("--contagem");
const log = (...a) => !json && console.log(...a);

/**
 * Os cenários. `css` entra depois de a página montar, no fim da cascata.
 *
 * Os dois suspeitos são os que a #31 nomeia, e os dois existem no código:
 * `backdrop-filter` tem 30 declarações em 11 arquivos de CSS, e o
 * AmbientBackground é uma instância montada em app/routes.tsx para todas as
 * rotas.
 */
const CENARIOS = [
    { nome: "base", css: null },

    /* ── Os dois suspeitos que a #31 nomeava ───────────────────────── */
    {
        nome: "sem vidro",
        css: "*, *::before, *::after { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }",
    },
    {
        nome: "sem particulas",
        css: ".ambient__particles { display: none !important; }",
    },
    {
        nome: "sem animacao",
        css: ".ambient, .ambient *, .ambient::before, .ambient::after, .ambient__aurora::before, .ambient__aurora::after, .ambient__bokeh b { animation: none !important; transition: none !important; }",
    },

    /* ── Os dois MECANISMOS, separados ─────────────────────────────────
       A #31 apontou a superfície; estes dois cenários apontam a causa.

       A · as keyframes interpolam `transform` E `opacity` através de
           `calc()` sobre `var()` (AmbientBackground.css:352-400). O
           navegador não compõe animação cujo valor de keyframe depende de
           propriedade personalizada — a substituição acontece na resolução
           de estilo, na thread principal. "keyframes literais" reescreve as
           duas keyframes com número puro e mede se compor ajudaria.

       B · useAmbientMotion.ts:205 escreve `style.translate` POR PARTÍCULA
           num laço de quadro, para as próximas ao ponteiro. Escrever estilo
           inline num elemento com animação rodando invalida o estilo dele.
           "sem ponteiro" rola sem mover o ponteiro, e o empurrão não
           acontece.

       Por que separar: o arranjo dispara `pointermove` em todos os 40
       passos, o que é realista para mouse e SUPER-REPRESENTA o mecanismo B
       em relação a uma rolagem por toque. Sem separar, não se sabe qual
       pagar. */
    { nome: "sem ponteiro", css: null, ponteiro: false },

    /* ── Qual METADE da animação custa ─────────────────────────────────
       A correção óbvia — cozinhar tudo em número literal — tem um conflito:
       `--ambient-peak` vem do TEMA (`[data-theme="light"] .ambient`, linha
       418), e cozinhar a opacidade quebraria a troca de tema ao vivo.

       Já `--mx`, `--dx` e `--dy` são constantes POR PARTÍCULA, escritas na
       semeadura e independentes de tema. Fazê-las literais preserva
       comportamento.

       Então a pergunta que decide a correção é: o custo está na metade que
       dá para consertar sem efeito colateral, ou na outra? */
    {
        nome: "transform literal",
        css: "@keyframes ambient-float{0%{transform:translate(0,0) scale(.85);opacity:0}12%{opacity:calc(var(--peak,.45)*var(--ambient-peak)*var(--ambient-gain))}50%{transform:translate(26px,-86px) scale(1.2);opacity:calc(var(--peak,.45)*var(--ambient-peak)*var(--ambient-gain))}88%{opacity:calc(var(--peak,.45)*var(--ambient-peak)*var(--ambient-gain)*.35)}100%{transform:translate(0,-156px) scale(.9);opacity:0}}@keyframes ambient-orb{0%{transform:translate(0,0) scale(1);opacity:0}20%,80%{opacity:calc(var(--peak,.2)*var(--ambient-peak)*var(--ambient-gain))}50%{transform:translate(26px,-62px) scale(1.4);opacity:calc(var(--peak,.2)*var(--ambient-peak)*var(--ambient-gain))}100%{transform:translate(0,-104px) scale(1);opacity:0}}",
    },
    {
        nome: "opacidade literal",
        css: "@keyframes ambient-float{0%{transform:translate(0,0) scale(.85);opacity:0}12%{opacity:.4}50%{transform:translate(var(--mx,26px),calc(var(--dy,-156px)*.55)) scale(1.2);opacity:.4}88%{opacity:.14}100%{transform:translate(var(--dx,0),var(--dy,-156px)) scale(.9);opacity:0}}@keyframes ambient-orb{0%{transform:translate(0,0) scale(1);opacity:0}20%,80%{opacity:.18}50%{transform:translate(var(--mx,26px),calc(var(--dy,-104px)*.6)) scale(1.4);opacity:.18}100%{transform:translate(var(--dx,0),var(--dy,-104px)) scale(1);opacity:0}}",
    },
    {
        nome: "keyframes literais",
        css: "@keyframes ambient-float{0%{transform:translate(0,0) scale(.85);opacity:0}12%{opacity:.4}50%{transform:translate(26px,-86px) scale(1.2);opacity:.4}88%{opacity:.14}100%{transform:translate(0,-156px) scale(.9);opacity:0}}@keyframes ambient-orb{0%{transform:translate(0,0) scale(1);opacity:0}20%,80%{opacity:.18}50%{transform:translate(26px,-62px) scale(1.4);opacity:.18}100%{transform:translate(0,-104px) scale(1);opacity:0}}",
    },
    {
        nome: "literais sem ponteiro",
        css: "@keyframes ambient-float{0%{transform:translate(0,0) scale(.85);opacity:0}12%{opacity:.4}50%{transform:translate(26px,-86px) scale(1.2);opacity:.4}88%{opacity:.14}100%{transform:translate(0,-156px) scale(.9);opacity:0}}@keyframes ambient-orb{0%{transform:translate(0,0) scale(1);opacity:0}20%,80%{opacity:.18}50%{transform:translate(26px,-62px) scale(1.4);opacity:.18}100%{transform:translate(0,-104px) scale(1);opacity:0}}",
        ponteiro: false,
    },
];

/* Reduzir por `:nth-child` e não pelo `count` do componente: a prop exigiria
   remontar a página por cenário, e aí a comparação mediria a remontagem
   também. O que importa aqui é quantos elementos ANIMAM, e é isso que o
   seletor controla. A distribuição espacial fica ligeiramente diferente de uma
   semeadura com `count` menor — é aproximação, e está dito. */
const CURVA = [39, 28, 20, 12, 6, 0].map((n) => ({
    nome: n === 39 ? "39 (hoje)" : `${n} partículas`,
    css:
        n === 39
            ? null
            : n === 0
              ? ".ambient__particles { display: none !important; }"
              : `.ambient__particle:nth-child(n+${n + 1}) { display: none !important; }`,
}));

const ATIVOS = curva ? CURVA : CENARIOS;

const preview = await startPreview();
const browser = await launchBrowser();

async function contexto() {
    const ctx = await browser.newContext({
        viewport: { width: 1280, height: 900 },
    });
    await ctx.addInitScript(
        ([tk, lk]) => {
            localStorage.setItem(tk, "dark");
            localStorage.setItem(lk, "pt");
        },
        [THEME_KEY, LANG_KEY],
    );
    await ctx.route("**/api/**", (r) =>
        r.fulfill({
            status: 200,
            contentType: "application/json",
            body: '{"releases":[]}',
        }),
    );
    /* Terceiros nunca respondem: uma medição não pode depender da fonte do
       dia nem da latência do CDN. */
    await ctx.route("**/*", (r) =>
        r.request().url().startsWith(preview.url) ? r.fallback() : r.abort(),
    );

    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Performance.enable");
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU });
    return { ctx, page, cdp };
}

/** Uma execução de um cenário. Mesma rolagem do perf.mjs, passo a passo. */
async function medir(css, ponteiro = true) {
    const { ctx, page, cdp } = await contexto();

    await page.goto(`${preview.url}${ROTA}`, { waitUntil: "load" });
    if (css) await page.addStyleTag({ content: css });
    /* Assenta o que a carga deixou pendente, para a janela medir rolagem e
       não o rabo da montagem. */
    await page.waitForTimeout(1500);

    const ler = async () =>
        Object.fromEntries(
            (await cdp.send("Performance.getMetrics")).metrics.map((m) => [
                m.name,
                m.value,
            ]),
        );

    const antes = await ler();
    const t0 = Date.now();
    await page.evaluate(async (comPonteiro) => {
        const alvo = Math.max(
            1,
            document.body.scrollHeight - window.innerHeight,
        );
        for (let i = 0; i <= 40; i++) {
            window.scrollTo(0, (alvo * i) / 40);
            /* O ponteiro é separável de propósito: quem rola com o dedo não
               move ponteiro, e o empurrão por proximidade só existe quando
               ele se move. Medir os dois juntos esconde qual custa. */
            if (comPonteiro)
                window.dispatchEvent(
                    new PointerEvent("pointermove", {
                        clientX: 200 + ((i * 25) % 900),
                        clientY: 300 + ((i * 17) % 500),
                        bubbles: true,
                    }),
                );
            await new Promise((r) => setTimeout(r, 55));
        }
    }, ponteiro);
    const depois = await ler();
    const janela = (Date.now() - t0) / 1000;
    const d = (k) => ((depois[k] ?? 0) - (antes[k] ?? 0)) * 1000;

    /* Quantos elementos de fato pintavam vidro neste cenário: é o que
       transforma "sem vidro" de intenção em fato observado. */
    const vidros = await page.evaluate(
        () =>
            [...document.querySelectorAll("*")].filter((el) => {
                const s = getComputedStyle(el);
                const bf = s.backdropFilter || s.webkitBackdropFilter;
                return bf && bf !== "none";
            }).length,
    );

    await ctx.close();
    return {
        script: Math.round(d("ScriptDuration")),
        estilo: Math.round(d("RecalcStyleDuration")),
        /* Normalizado pela janela, e isto NÃO é firula.
           Descobri medindo: o cenário "sem ponteiro" deu +268ms de estilo
           absoluto, o que parecia dizer que o ponteiro ALIVIA o custo. Não
           diz. Sem eventos de ponteiro o navegador gasta menos em
           hit-testing e sobra orçamento para mais quadros de animação — e
           mais quadros é mais recálculo, na mesma janela de relógio.
           Comparar milissegundos absolutos entre cenários de densidade
           diferente compara a densidade, não o custo. */
        estiloPorSeg: Math.round(d("RecalcStyleDuration") / janela),
        janela: +janela.toFixed(2),
        layout: Math.round(d("LayoutDuration")),
        ocupacao: +(d("TaskDuration") / 10 / janela).toFixed(1),
        vidros,
    };
}

/** Mediana por `estiloPorSeg`: é a grandeza comparável entre cenários. */
async function medianaDe(css, ponteiro = true) {
    const runs = [];
    for (let i = 0; i < REPETICOES; i++) runs.push(await medir(css, ponteiro));
    const ordenado = [...runs].sort((a, b) => a.estiloPorSeg - b.estiloPorSeg);
    return {
        ...ordenado[Math.floor(REPETICOES / 2)],
        /* A amplitude é o que diz se uma diferença entre cenários é sinal ou
           ruído. Sem ela, qualquer delta parece conclusão. */
        estiloMin: ordenado[0].estiloPorSeg,
        estiloMax: ordenado[ordenado.length - 1].estiloPorSeg,
    };
}

const resultados = [];
try {
    for (const { nome, css, ponteiro = true } of ATIVOS) {
        log(`medindo "${nome}" — ${REPETICOES} execuções…`);
        resultados.push({ cenario: nome, ...(await medianaDe(css, ponteiro)) });
    }
} finally {
    await browser.close();
    await preview.stop();
}

if (json) {
    console.log(JSON.stringify(resultados, null, 2));
    process.exit(0);
}

const n = (v, w) => String(v).padStart(w);
const base = resultados[0];

log("");
log(`Rolagem da home · CPU ${CPU}× · mediana de ${REPETICOES} · ${ROTA}`);
log("");
log(
    "cenário                 script  estilo/s  ocupação  vidros  janela   Δ/s   faixa/s",
);
log("─".repeat(92));
for (const r of resultados) {
    const delta =
        r.cenario === base.cenario ? "—" : r.estiloPorSeg - base.estiloPorSeg;
    log(
        `${r.cenario.padEnd(22)} ${n(r.script, 5)}ms ${n(r.estiloPorSeg, 7)}ms ` +
            `${n(r.ocupacao, 8)}% ${n(r.vidros, 6)} ${n(r.janela, 6)}s ` +
            `${n(delta, 6)}${typeof delta === "number" ? "ms" : "  "} ` +
            `${r.estiloMin}–${r.estiloMax}ms`,
    );
}

/* A leitura que evita a conclusão apressada: se o delta de um cenário não
   sai da amplitude do próprio base, ele não é evidência de nada. */
const ruido = base.estiloMax - base.estiloMin;
log("");
log(`Amplitude do base entre execuções: ${ruido}ms.`);
log("Delta menor que isso não é atribuição — é a máquina. Qualquer conclusão");
log("precisa de diferença maior que a amplitude, não só maior que zero.");
