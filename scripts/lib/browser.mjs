/**
 * Base compartilhada dos arranjos de auditoria.
 *
 * Resolve o Chromium, sobe o preview e cria contextos já preparados —
 * tema e idioma semeados antes do primeiro script rodar, chamadas de API
 * previsíveis e rede externa bloqueada, para que duas execuções da mesma
 * auditoria comparem a mesma coisa.
 */

import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

/* Espelham shared/config/constants.ts — se mudarem lá, mudam aqui. */
export const THEME_KEY = "portfolio-theme";
export const LANG_KEY = "portfolio-lang";

export const ROUTES = {
    home: "/",
    links: "/links",
    contato: "/contato",
    releaseNotes: "/release-notes",
    releaseVersion: "/release-notes/v2.0.0",
    notFound: "/pagina-inexistente",
};

/**
 * O caminho do Chromium varia conforme quem instalou: `npx playwright
 * install` numa máquina de trabalho, imagem pré-montada num contêiner.
 * Tenta as três origens antes de desistir, e a mensagem de erro diz o
 * que fazer em vez de só reclamar.
 */
function resolveChromium() {
    if (process.env.PW_CHROMIUM_PATH) return process.env.PW_CHROMIUM_PATH;

    const root = process.env.PLAYWRIGHT_BROWSERS_PATH;
    if (root && existsSync(root)) {
        const candidates = readdirSync(root)
            .filter((d) => d.startsWith("chromium-"))
            .sort()
            .reverse()
            .map((d) => join(root, d, "chrome-linux", "chrome"))
            .filter((p) => existsSync(p));
        if (candidates.length) return candidates[0];
    }
    return null; // deixa o Playwright resolver sozinho
}

export async function launchBrowser() {
    const executablePath = resolveChromium();
    try {
        // headless-shell pode deixar Ctrl+clique em abas novas sem carregar.
        // O canal chromium usa o navegador completo, também instalado pelo
        // comando playwright install chromium, com o comportamento real.
        return await chromium.launch(
            executablePath ? { executablePath } : { channel: "chromium" },
        );
    } catch (err) {
        throw new Error(
            `Não foi possível abrir o Chromium.\n` +
                `Tente 'npx playwright install chromium', ou aponte PW_CHROMIUM_PATH ` +
                `para um binário existente.\n\nCausa: ${err.message.split("\n")[0]}`,
        );
    }
}

/**
 * Sobe `vite preview` e espera a porta responder.
 *
 * Se BASE_URL já estiver no ambiente, usa o servidor de quem chamou e não
 * derruba nada ao final — quem subiu é quem derruba.
 */
export async function startPreview({ timeoutMs = 60_000 } = {}) {
    if (process.env.BASE_URL) {
        return { url: process.env.BASE_URL, stop: async () => {} };
    }

    const url = "http://localhost:4173";
    let occupied = false;
    try {
        await fetch(url, { signal: AbortSignal.timeout(1000) });
        occupied = true;
    } catch {
        /* porta livre */
    }
    if (occupied)
        throw new Error(
            "A porta 4173 já está em uso. Defina BASE_URL para usar esse servidor ou encerre seu preview antes da auditoria.",
        );
    const app = resolve(
        dirname(fileURLToPath(import.meta.url)),
        "../../apps/web",
    );
    const require = createRequire(resolve(app, "package.json"));
    const cli = join(
        dirname(require.resolve("vite/package.json")),
        "bin/vite.js",
    );
    const child = spawn(
        process.execPath,
        [cli, "preview", "--host", "127.0.0.1"],
        {
            cwd: app,
            windowsHide: true,
            stdio: ["ignore", "pipe", "pipe"],
        },
    );
    let output = "";
    child.stdout.on("data", (data) => {
        output = (output + data).slice(-3000);
    });
    child.stderr.on("data", (data) => {
        output = (output + data).slice(-3000);
    });
    let spawnError;
    child.on("error", (error) => {
        spawnError = error;
    });
    const stop = async () => {
        if (child.exitCode !== null || child.signalCode !== null || !child.pid)
            return;
        await new Promise((done) => {
            const timer = setTimeout(() => {
                child.kill("SIGKILL");
                done();
            }, 3000);
            child.once("exit", () => {
                clearTimeout(timer);
                done();
            });
            child.kill("SIGTERM");
        });
    };

    const deadline = Date.now() + timeoutMs;
    for (;;) {
        if (spawnError || child.exitCode !== null) {
            await stop();
            throw new Error(
                `Não foi possível iniciar o preview: ${spawnError?.message ?? output}`,
            );
        }
        try {
            const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
            if (res.ok) break;
        } catch {
            /* ainda subindo */
        }
        if (Date.now() > deadline) {
            await stop();
            throw new Error(
                `O preview não respondeu em ${timeoutMs / 1000}s. ` +
                    `Rode 'npm run build' antes, ou aponte BASE_URL para um servidor de pé.`,
            );
        }
        await new Promise((r) => setTimeout(r, 400));
    }

    return {
        url,
        stop,
    };
}

/**
 * Contexto com tema e idioma semeados antes de qualquer script da página
 * rodar, para que a primeira pintura já saia no estado pedido.
 *
 * As chamadas de API respondem lista vazia por padrão: a auditoria mede o
 * layout e a acessibilidade do site, não a disponibilidade do GitHub.
 */
export async function newContext(
    browser,
    { baseUrl, theme, lang, apiBody, ...opts } = {},
) {
    /* Sem isto, a auditoria pega o reveal de [data-reveal] no meio do fade e
       mede cores mescladas: o contraste do mesmo botão muda conforme o
       instante da medição, e o resultado deixa de ser reproduzível. O site
       honra prefers-reduced-motion, então o estado assentado é o real. */
    const ctx = await browser.newContext({ reducedMotion: "reduce", ...opts });

    await ctx.addInitScript(
        ([themeKey, themeVal, langKey, langVal]) => {
            if (themeVal) localStorage.setItem(themeKey, themeVal);
            if (langVal) localStorage.setItem(langKey, langVal);
        },
        [THEME_KEY, theme, LANG_KEY, lang],
    );

    await ctx.route("**/api/**", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: apiBody ?? '{"releases":[]}',
        }),
    );
    /* Nada sai para a internet: uma auditoria não pode depender de rede. */
    await ctx.route("**/*", (route) =>
        route.request().url().startsWith(baseUrl)
            ? route.fallback()
            : route.abort(),
    );

    const page = await ctx.newPage();
    page.setDefaultNavigationTimeout(60_000);
    page.setDefaultTimeout(15_000);
    return { ctx, page };
}

/** Navega e espera a rota estar realmente montada, não só respondida. */
export async function visit(page, baseUrl, route) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("main, .links-page, .release-page", {
        timeout: 25_000,
    });
    await page
        .waitForFunction(() => document.fonts?.status === "loaded", null, {
            timeout: 10_000,
        })
        .catch(() => {}); /* fontes são otimização, não requisito */

    /* Nada opaco pela metade na hora de medir cor. */
    await page
        .waitForFunction(
            () =>
                [...document.querySelectorAll("[data-reveal]")].every((el) => {
                    const r = el.getBoundingClientRect();
                    const foraDaTela =
                        r.bottom < 0 || r.top > window.innerHeight;
                    return foraDaTela || getComputedStyle(el).opacity === "1";
                }),
            null,
            { timeout: 10_000 },
        )
        .catch(() => {});
    await page.waitForTimeout(300);
}
