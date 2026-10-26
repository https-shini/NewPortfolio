/** Nenhuma saída para o perfil ocorre antes da confirmação, inclusive
 * quando o visitante abre o link em outra aba. Rede externa simulada. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import {
    launchBrowser,
    newContext,
    startPreview,
    visit,
} from "./lib/browser.mjs";

const preview = await startPreview();
const browser = await launchBrowser();

try {
    const { ctx, page } = await newContext(browser, {
        baseUrl: preview.url,
        theme: "dark",
        lang: "pt",
        viewport: { width: 1440, height: 1000 },
    });
    const requests = [];
    ctx.on("request", (request) => {
        const url = new URL(request.url());
        if (
            ["linkedin.com", "www.linkedin.com"].includes(url.hostname) &&
            url.pathname.startsWith("/in/oguilherme-cruz")
        )
            requests.push(request.url());
    });
    await ctx.route(/^https:\/\/(www\.)?linkedin\.com\//, (route) =>
        route.fulfill({
            contentType: "text/html",
            body: "<title>LinkedIn destination stub</title>",
        }),
    );

    for (const path of [
        "/",
        "/links",
        "/release-notes",
        "/pagina-inexistente",
    ]) {
        await visit(page, preview.url, path);
        assert.equal(
            await page
                .locator(
                    'a[href^="https://linkedin.com/in/oguilherme-cruz"], a[href^="https://www.linkedin.com/in/oguilherme-cruz"]',
                )
                .count(),
            0,
        );
        const links = page.locator('a[href^="/linkedin?"]');
        const count = await links.count();
        assert.ok(count > 0, `links protegidos em ${path}`);
        for (let index = 0; index < count; index++) {
            const link = links.nth(index);
            if (!(await link.isVisible())) continue;
            const destination = new URL(
                await link.getAttribute("href"),
                preview.url,
            ).searchParams.get("to");
            await link.click();
            const dialog = page.getByRole("dialog");
            await dialog.waitFor();
            assert.match(await dialog.innerText(), /verificação de identidade/);
            assert.equal(
                await dialog
                    .getByRole("link", { name: /Continuar para o LinkedIn/ })
                    .getAttribute("href"),
                destination,
            );
            assert.equal(requests.length, 0);
            await page.keyboard.press("Escape");
            await dialog.waitFor({ state: "detached" });
        }
        console.log(`ok  todos os links protegidos · ${path}`);
    }

    await visit(page, preview.url, "/");
    const popupPromise = ctx.waitForEvent("page");
    await page
        .locator('.hero__social a[href^="/linkedin?"]')
        .click({ modifiers: ["Control"] });
    const popup = await popupPromise;
    await popup.bringToFront();
    await popup.getByRole("dialog").waitFor();
    assert.equal(new URL(popup.url()).pathname, "/linkedin");
    assert.equal(requests.length, 0);
    await popup.close();
    console.log("ok  Ctrl+clique abre o aviso, sem acessar o LinkedIn");

    const destination =
        "https://www.linkedin.com/in/oguilherme-cruz/details/certifications/";
    await page.goto(
        `${preview.url}/linkedin?${new URLSearchParams({ to: destination, lang: "en" })}`,
    );
    const dialog = page.getByRole("dialog");
    await dialog.waitFor();
    assert.match(await dialog.innerText(), /identity verification/);
    assert.equal(requests.length, 0);
    const confirmedPopup = ctx.waitForEvent("page");
    await dialog.getByRole("link", { name: /Continue to LinkedIn/ }).click();
    const confirmed = await confirmedPopup;
    await confirmed.waitForLoadState("domcontentloaded");
    assert.equal(confirmed.url(), destination);
    assert.deepEqual(requests, [destination]);
    await ctx.close();
    console.log(
        "ok  confirmação explícita preserva o destino e abre em nova aba",
    );

    const require = createRequire(import.meta.url);
    const axe = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
    for (const theme of ["dark", "light"]) {
        for (const lang of ["pt", "en"]) {
            const { ctx, page } = await newContext(browser, {
                baseUrl: preview.url,
                theme,
                lang,
                viewport: { width: 360, height: 320 },
            });
            await visit(page, preview.url, "/linkedin");
            await page.getByRole("dialog").waitFor();
            await page.addScriptTag({ content: axe });
            const violations = await page.evaluate(async () =>
                (
                    await window.axe.run(document, {
                        runOnly: {
                            type: "tag",
                            values: [
                                "wcag2a",
                                "wcag2aa",
                                "wcag21a",
                                "wcag21aa",
                                "wcag22aa",
                            ],
                        },
                    })
                ).violations.map((v) => ({ id: v.id, impact: v.impact })),
            );
            assert.deepEqual(violations, []);
            const bounds = await page.getByRole("dialog").boundingBox();
            assert.ok(
                bounds.x >= 0 &&
                    bounds.y >= 0 &&
                    bounds.x + bounds.width <= 361 &&
                    bounds.y + bounds.height <= 321,
            );
            await page.locator(".linkedin-notice__body").evaluate((element) => {
                element.scrollTop = element.scrollHeight;
            });
            await page
                .locator(".linkedin-notice__continue")
                .waitFor({ state: "visible" });
            assert.ok(
                await page.locator(".linkedin-notice__close").isVisible(),
            );
            await ctx.close();
            console.log(`ok  acessibilidade e tela baixa · ${theme} · ${lang}`);
        }
    }
} finally {
    await browser.close();
    await preview.stop();
}
