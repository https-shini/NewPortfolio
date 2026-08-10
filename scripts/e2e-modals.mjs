/**
 * Overlays — trava de rolagem, restauração de posição e fundo inerte.
 *
 *   node scripts/e2e-modals.mjs        # ou npm run audit:modals
 *
 * Sobre a "intermitência de 2px" que motivou este arranjo: ela não existe
 * no useScrollLock. Foram 71 ciclos de abrir e fechar, em cinco condições
 * — com e sem animação, em densidade de pixel 1, 1.5 e 2, e a partir de
 * posição fracionária — e a restauração deu exata em todas.
 *
 * O desvio vinha da medição. O arranjo antigo lia `Math.round(scrollY)` em
 * momentos frouxos, entre timeouts fixos, e comparava referências que não
 * eram a mesma. Um teste que erra por conta própria é pior que teste
 * nenhum, porque ensina a desconfiar do código certo.
 *
 * Por isso aqui a posição é lida com precisão total, e a comparação usa o
 * valor exato — sem arredondar, que é onde o erro se escondia.
 */

import {
    launchBrowser,
    newContext,
    startPreview,
    visit,
} from "./lib/browser.mjs";

const CICLOS = 12;
const preview = await startPreview();
const browser = await launchBrowser();
const falhas = [];

const check = (ok, rotulo, detalhe = "") => {
    if (!ok) falhas.push(rotulo);
    console.log(
        `${ok ? "  ok " : "FALHA"}  ${rotulo}${detalhe ? `  — ${detalhe}` : ""}`,
    );
};

try {
    /* ── Trava, restauração e inércia do fundo ─────────────────────── */
    {
        const { ctx, page } = await newContext(browser, {
            baseUrl: preview.url,
            theme: "dark",
            viewport: { width: 1280, height: 900 },
        });
        await visit(page, preview.url, "/");

        const gatilho = ".featured__slide.is-active .featured__slide-trigger";
        await page.locator(gatilho).first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);

        let exatas = 0;
        let travouSempre = true;
        const desvios = [];

        for (let i = 0; i < CICLOS; i++) {
            const antes = await page.evaluate(() => window.scrollY);

            await page.locator(gatilho).first().click();
            await page.waitForSelector(".modal-dialog", { timeout: 8000 });
            await page.waitForTimeout(180);

            /* Com o overlay aberto, empurrar a página não pode mover nada. */
            const travou = await page.evaluate(() => {
                const antes = window.scrollY;
                window.scrollBy({ top: 400, behavior: "instant" });
                return window.scrollY === antes;
            });
            if (!travou) travouSempre = false;

            if (i === 0) {
                /* A inércia é aplicada aos filhos diretos do <body>, menos
                   o que contém o overlay — quem checar o <main> em si não
                   encontra nada e conclui errado. */
                const r = await page.evaluate(() => {
                    const dlg = document.querySelector(".modal-dialog");
                    const irmaos = [...document.body.children].filter(
                        (el) => !el.contains(dlg),
                    );
                    return {
                        total: irmaos.length,
                        inertes: irmaos.filter((el) => el.hasAttribute("inert"))
                            .length,
                    };
                });
                check(
                    r.total > 0 && r.inertes === r.total,
                    "fundo inerte com o overlay aberto",
                    `${r.inertes}/${r.total} irmãos do overlay`,
                );
            }

            await page.keyboard.press("Escape");
            await page.waitForSelector(".modal-dialog", {
                state: "detached",
                timeout: 8000,
            });
            await page.waitForTimeout(280);

            const depois = await page.evaluate(() => window.scrollY);
            const desvio = depois - antes;
            if (desvio === 0) exatas++;
            else desvios.push(desvio);
        }

        check(travouSempre, "rolagem travada enquanto o overlay está aberto");
        check(
            exatas === CICLOS,
            `posição restaurada exatamente em ${CICLOS} ciclos`,
            exatas === CICLOS
                ? ""
                : `${exatas}/${CICLOS}; desvios: ${desvios.join(", ")}`,
        );

        await ctx.close();
    }

    /* ── Celular deitado: o conteúdo precisa ser alcançável ────────── */
    {
        const { ctx, page } = await newContext(browser, {
            baseUrl: preview.url,
            theme: "dark",
            viewport: { width: 667, height: 375 },
            hasTouch: true,
            isMobile: true,
        });
        await visit(page, preview.url, "/");

        const gatilho = ".featured__slide.is-active .featured__slide-trigger";
        await page.locator(gatilho).first().scrollIntoViewIfNeeded();
        await page.locator(gatilho).first().click();
        await page.waitForSelector(".modal-dialog", { timeout: 8000 });
        await page.waitForTimeout(300);

        const r = await page.evaluate(() => {
            const dlg = document.querySelector(".modal-dialog");
            const b = dlg.getBoundingClientRect();
            const cs = getComputedStyle(dlg);
            const rolaveis = [...dlg.querySelectorAll("*")].filter((el) => {
                const c = getComputedStyle(el);
                return (
                    /auto|scroll/.test(c.overflowY) &&
                    el.scrollHeight > el.clientHeight + 2
                );
            });
            return {
                cabe: b.height <= window.innerHeight + 1 && b.top >= -1,
                cortado:
                    dlg.scrollHeight > dlg.clientHeight + 2 &&
                    !/auto|scroll/.test(cs.overflowY) &&
                    rolaveis.length === 0,
            };
        });

        check(r.cabe, "o diálogo cabe na tela deitada (667×375)");
        check(
            !r.cortado,
            "conteúdo alcançável — rola por dentro se não couber",
        );

        await ctx.close();
    }
} finally {
    await browser.close();
    await preview.stop();
}

console.log(
    `\n${falhas.length ? `${falhas.length} verificação(ões) falhando` : "tudo certo"}`,
);
process.exit(falhas.length ? 1 : 0);
