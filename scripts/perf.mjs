/**
 * Arranjo de performance — carga e rolagem.
 *
 * Duas medições, porque são dois defeitos diferentes:
 *
 *   carga    quanto tempo a tela fica branca (FCP) e quanto a thread
 *            principal fica bloqueada antes de responder ao primeiro
 *            clique (TBT)
 *   rolagem  quanto da thread principal a página consome enquanto
 *            alguém rola e mexe o ponteiro
 *
 * Mede ocupação da thread principal, e não quadros por segundo, por um
 * motivo concreto: em contêiner não há GPU, o Chromium rasteriza por
 * software (SwiftShader) e contar quadros mede o rasterizador, não a
 * página. Um `filter: blur` que na máquina de quem visita é trabalho de
 * compositor aparece ali como catástrofe. Já `script`, `estilo` e
 * `layout` são thread principal em qualquer lugar — comparáveis entre
 * execuções e entre máquinas.
 *
 * O parâmetro `--atraso` é o que separa problema de rede de problema de
 * código: ele empurra os hosts de terceiros para depois e mostra quanto
 * do tempo de tela branca é espera por gente de fora.
 */

import {
    startPreview,
    launchBrowser,
    THEME_KEY,
    LANG_KEY,
} from "./lib/browser.mjs";

const ROTAS = ["/", "/links", "/release-notes"];
const CPUS = [1, 4];
const REPETICOES = 3;

const args = process.argv.slice(2);
const json = args.includes("--json");
const atraso = Number(
    args.find((a) => a.startsWith("--atraso="))?.split("=")[1] ?? 0,
);

const preview = await startPreview();
const browser = await launchBrowser();

async function contexto(taxa) {
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
    /* Terceiros nunca respondem de verdade: uma medição não pode depender
       da fonte do dia. Com `--atraso` eles demoram antes de falhar, que é
       como se comporta um CDN lento. */
    await ctx.route("**/*", async (r) => {
        if (r.request().url().startsWith(preview.url)) return r.fallback();
        if (atraso) await new Promise((x) => setTimeout(x, atraso));
        return r.abort();
    });

    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Performance.enable");
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: taxa });
    return { ctx, page, cdp };
}

async function medirCarga(rota, taxa) {
    const { ctx, page } = await contexto(taxa);
    await page.addInitScript(() => {
        window.__longas = [];
        new PerformanceObserver((l) => {
            for (const e of l.getEntries())
                window.__longas.push({
                    inicio: Math.round(e.startTime),
                    dur: Math.round(e.duration),
                });
        }).observe({ type: "longtask", buffered: true });
    });

    await page.goto(`${preview.url}${rota}`, { waitUntil: "load" });
    await page.waitForTimeout(5000);

    const r = await page.evaluate(() => {
        const fcp =
            performance
                .getEntriesByType("paint")
                .find((p) => p.name === "first-contentful-paint")?.startTime ??
            0;
        const nav = performance.getEntriesByType("navigation")[0];
        const longas = window.__longas ?? [];
        return {
            fcp: Math.round(fcp),
            interativo: Math.round(nav.domInteractive),
            /* TBT soma só o excedente de 50ms de cada tarefa longa: é o
               que a pessoa sente como clique que não responde. */
            tbt: Math.round(
                longas.reduce((s, l) => s + Math.max(0, l.dur - 50), 0),
            ),
            longas: longas.length,
            pior: longas.length ? Math.max(...longas.map((l) => l.dur)) : 0,
        };
    });
    await ctx.close();
    return r;
}

async function medirRolagem(rota, taxa) {
    const { ctx, page, cdp } = await contexto(taxa);
    await page.goto(`${preview.url}${rota}`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("main, .linktree", { timeout: 30_000 });
    await page.waitForTimeout(2500); /* deixa o reveal assentar */

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

    await ctx.close();
    return {
        script: Math.round(d("ScriptDuration")),
        estilo: Math.round(d("RecalcStyleDuration")),
        layout: Math.round(d("LayoutDuration")),
        ocupacao: +(d("TaskDuration") / 10 / janela).toFixed(1),
    };
}

/** Mediana de N execuções: uma só oscila com o ruído da máquina. */
async function mediana(fn, chave) {
    const runs = [];
    for (let i = 0; i < REPETICOES; i++) runs.push(await fn());
    runs.sort((a, b) => a[chave] - b[chave]);
    return runs[Math.floor(REPETICOES / 2)];
}

const relatorio = [];
for (const rota of ROTAS) {
    for (const cpu of CPUS) {
        relatorio.push({
            rota,
            cpu,
            carga: await mediana(() => medirCarga(rota, cpu), "tbt"),
            rolagem: await mediana(() => medirRolagem(rota, cpu), "ocupacao"),
        });
    }
}

await browser.close();
await preview.stop();

if (json) {
    console.log(JSON.stringify({ atraso, entradas: relatorio }, null, 2));
} else {
    console.log(
        `Performance · terceiros com ${atraso}ms de atraso · mediana de ${REPETICOES}\n`,
    );
    console.log(
        "                    ── carga ──────────────────────   ── rolagem ───────────────────",
    );
    console.log(
        "rota            CPU     FCP  interat.    TBT   pior    script  estilo  layout  ocupação",
    );
    for (const e of relatorio) {
        const n = (v, w) => String(v).padStart(w);
        console.log(
            `${e.rota.padEnd(15)} ${n(e.cpu, 2)}x ${n(e.carga.fcp, 5)}ms ${n(e.carga.interativo, 6)}ms ` +
                `${n(e.carga.tbt, 5)}ms ${n(e.carga.pior, 4)}ms   ` +
                `${n(e.rolagem.script, 5)}ms ${n(e.rolagem.estilo, 6)}ms ${n(e.rolagem.layout, 6)}ms ` +
                `${n(e.rolagem.ocupacao, 7)}%`,
        );
    }
}
