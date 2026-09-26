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

    /* ── Rodada 1: os dois suspeitos que a #31 nomeia ──────────────── */
    {
        nome: "sem vidro",
        css: "*, *::before, *::after { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }",
    },
    {
        nome: "sem atmosfera",
        css: ".ambient { display: none !important; }",
    },

    /* ── Rodada 2: dentro da atmosfera ─────────────────────────────────
       A rodada 1 aponta uma SUPERFÍCIE; o critério da #31 pede também a
       PROPRIEDADE. As três camadas do .ambient saem uma por vez, e a
       última separa a pergunta que decide a correção: o custo é a
       presença dos elementos, ou o fato de eles animarem?

       Se `sem animação` recuperar o mesmo tanto que `sem atmosfera`, o
       culpado é a keyframe — e a correção não é remover o efeito, é parar
       de animar propriedade que recalcula estilo. */
    {
        nome: "sem aurora",
        css: ".ambient__aurora { display: none !important; }",
    },
    {
        nome: "sem bokeh",
        css: ".ambient__bokeh { display: none !important; }",
    },
    {
        nome: "sem particulas",
        css: ".ambient__particles { display: none !important; }",
    },
    {
        nome: "sem animacao",
        css: ".ambient, .ambient *, .ambient::before, .ambient::after, .ambient__aurora::before, .ambient__aurora::after, .ambient__bokeh b { animation: none !important; transition: none !important; }",
    },
];

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
async function medir(css) {
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
    await page.evaluate(async () => {
        const alvo = Math.max(
            1,
            document.body.scrollHeight - window.innerHeight,
        );
        for (let i = 0; i <= 40; i++) {
            window.scrollTo(0, (alvo * i) / 40);
            window.dispatchEvent(
                new PointerEvent("pointermove", {
                    clientX: 200 + ((i * 25) % 900),
                    clientY: 300 + ((i * 17) % 500),
                    bubbles: true,
                }),
            );
            await new Promise((r) => setTimeout(r, 55));
        }
    });
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
        layout: Math.round(d("LayoutDuration")),
        ocupacao: +(d("TaskDuration") / 10 / janela).toFixed(1),
        vidros,
    };
}

/** Mediana por `estilo`, que é a grandeza sob julgamento. */
async function medianaDe(css) {
    const runs = [];
    for (let i = 0; i < REPETICOES; i++) runs.push(await medir(css));
    const ordenado = [...runs].sort((a, b) => a.estilo - b.estilo);
    return {
        ...ordenado[Math.floor(REPETICOES / 2)],
        /* A amplitude é o que diz se uma diferença entre cenários é sinal ou
           ruído. Sem ela, qualquer delta parece conclusão. */
        estiloMin: ordenado[0].estilo,
        estiloMax: ordenado[ordenado.length - 1].estilo,
    };
}

const resultados = [];
try {
    for (const { nome, css } of CENARIOS) {
        log(`medindo "${nome}" — ${REPETICOES} execuções…`);
        resultados.push({ cenario: nome, ...(await medianaDe(css)) });
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
    "cenário          script  estilo  layout  ocupação  vidros   Δestilo  faixa do estilo",
);
log("─".repeat(88));
for (const r of resultados) {
    const delta = r.cenario === base.cenario ? "—" : r.estilo - base.estilo;
    log(
        `${r.cenario.padEnd(15)} ${n(r.script, 5)}ms ${n(r.estilo, 6)}ms ` +
            `${n(r.layout, 6)}ms ${n(r.ocupacao, 8)}% ${n(r.vidros, 7)} ` +
            `${n(delta, 9)}${typeof delta === "number" ? "ms" : "  "}  ` +
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
