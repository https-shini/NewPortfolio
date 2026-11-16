import assert from "node:assert/strict";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import {
    launchBrowser,
    newContext,
    startPreview,
    visit,
} from "./lib/browser.mjs";
const require = createRequire(import.meta.url);
const axe = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const server = await startPreview();
const browser = await launchBrowser();
const output = "artifacts/services-strategy/after";
mkdirSync(output, { recursive: true });
const results = [];
async function audit(page, label) {
    assert.equal(
        await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
        false,
        `overflow ${label}`,
    );
    const closedHeights = await page
        .locator('.services-question__panel[aria-hidden="true"]')
        .evaluateAll((nodes) =>
            nodes.map((n) => n.getBoundingClientRect().height),
        );
    assert(
        closedHeights.every((h) => h === 0),
        `closed panels leak content ${label}`,
    );
    await page.addScriptTag({ content: axe });
    const violations = await page.evaluate(async () =>
        (
            await window.axe.run(document, {
                runOnly: {
                    type: "tag",
                    values: ["wcag2a", "wcag2aa", "wcag21aa"],
                },
            })
        ).violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => n.target),
        })),
    );
    assert.deepEqual(violations, [], label);
}
try {
    for (const lang of ["pt", "en"])
        for (const theme of ["dark", "light"])
            for (const width of [360, 768, 1440]) {
                const { ctx, page } = await newContext(browser, {
                    baseUrl: server.url,
                    lang,
                    theme,
                    viewport: { width, height: 1000 },
                });
                const errors = [];
                page.on("pageerror", (e) => errors.push(e.message));
                await visit(
                    page,
                    server.url,
                    `/servicos${lang === "en" ? "?lang=en" : ""}`,
                );
                await page.locator(".services-strategy").waitFor();
                assert.equal(await page.locator("main>section").count(), 12);
                assert.equal(await page.locator("main form").count(), 0);
                const height = await page.evaluate(
                    () => document.documentElement.scrollHeight,
                );
                await page.screenshot({
                    path: `${output}/${lang}-${theme}-${width}.png`,
                });
                await audit(page, `services ${lang}/${theme}/${width}`);
                const q = page
                    .locator("#duvidas .services-question__trigger")
                    .first();
                await q.focus();
                await page.keyboard.press("Enter");
                assert.equal(await q.getAttribute("aria-expanded"), "true");
                await page.keyboard.press("Space");
                assert.equal(await q.getAttribute("aria-expanded"), "false");
                // Expanded catalog is checked too, not just the collapsed landing state.
                for (const trigger of await page
                    .locator("#personalizar .services-question__trigger")
                    .all())
                    if (
                        (await trigger.getAttribute("aria-expanded")) ===
                        "false"
                    )
                        await trigger.click();
                await audit(page, `expanded ${lang}/${theme}/${width}`);
                if (lang === "pt" && width === 1440) {
                    await page.locator("#web").scrollIntoViewIfNeeded();
                    await page.screenshot({
                        path: `${output}/plans-${theme}.png`,
                    });
                }
                await page.locator('#web a[href*="service=express"]').click();
                await page.locator(".quote-page").waitFor();
                assert.equal(new URL(page.url()).pathname, "/orcamento");
                assert.equal(
                    await page.locator("#estimate-service").inputValue(),
                    "express",
                );
                if (lang === "en")
                    assert.equal(
                        new URL(page.url()).searchParams.get("lang"),
                        "en",
                    );
                await page
                    .locator('#simulador input[type="checkbox"]')
                    .first()
                    .check();
                assert.match(
                    await page
                        .locator('[data-testid="estimate-subtotal"]')
                        .first()
                        .textContent(),
                    /1.340/,
                );
                await page.locator("#estimate-service").selectOption("premium");
                assert.equal(
                    await page
                        .locator('#simulador input[type="checkbox"]')
                        .count(),
                    3,
                );
                await page
                    .locator('.services-form button[type="submit"]')
                    .click();
                assert.equal(
                    await page
                        .locator("#quote-name")
                        .getAttribute("aria-invalid"),
                    "true",
                );
                await page.locator("#quote-name").fill("Teste local");
                await page.locator("#quote-email").fill("teste@example.com");
                await page
                    .locator("#quote-message")
                    .fill("Solicitação fictícia apenas para teste local.");
                await page.locator("#quote-consent").check();
                await page
                    .locator('.services-form button[type="submit"]')
                    .click();
                await page.locator(".services-draft").waitFor();
                assert.match(
                    await page
                        .locator('.services-draft a[href^="mailto:"]')
                        .getAttribute("href"),
                    /^mailto:contato@gcruz.dev.br/,
                );
                await audit(page, `quote ${lang}/${theme}/${width}`);
                await page.evaluate(() => window.scrollTo(0, 0));
                await page.screenshot({
                    path: `${output}/quote-${lang}-${theme}-${width}.png`,
                });
                await page.reload();
                await page.locator("#quote-name").waitFor();
                assert.equal(
                    await page.locator("#quote-name").inputValue(),
                    "",
                );
                assert.equal(
                    await page.locator("#estimate-service").inputValue(),
                    "express",
                );
                assert.deepEqual(errors, []);
                results.push({
                    lang,
                    theme,
                    width,
                    height,
                    overflow: false,
                    violations: 0,
                });
                await ctx.close();
            }
    const { ctx, page } = await newContext(browser, {
        baseUrl: server.url,
        lang: "pt",
        theme: "dark",
        viewport: { width: 1440, height: 1000 },
    });
    await visit(page, server.url, "/");
    await page.locator('main a[href="/servicos"]').click();
    await page.locator(".services-strategy").waitFor();
    // Verify every public contracting CTA uses a registered request URL.
    const links = await page
        .locator('main a[href^="/orcamento"]')
        .evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    assert(links.some((s) => s.includes("bespoke-website")));
    assert(links.some((s) => s.includes("custom-it")));
    for (const [href, field, value] of [
        [
            "/orcamento?service=bespoke-website",
            "#estimate-service",
            "bespoke-website",
        ],
        ["/orcamento?service=custom-it", "#estimate-service", "custom-it"],
        ["/orcamento?addon=maintenance", "#estimate-service", "addons-only"],
        ["/orcamento?interest=referral", "#quote-interest", "referral"],
        ["/orcamento?interest=partner", "#quote-interest", "partner"],
    ]) {
        await page.goto(`${server.url}${href}`);
        await page.locator(field).waitFor();
        assert.equal(await page.locator(field).inputValue(), value);
        if (value === "addons-only")
            assert.match(
                await page
                    .locator('[data-testid="estimate-monthly"]')
                    .first()
                    .textContent(),
                /149/,
            );
    }
    await visit(page, server.url, "/servicos");
    // Skip link remains hidden until keyboard focus; Enter reaches main.
    assert.equal(
        await page
            .locator(".skip-link")
            .evaluate((el) => el.getBoundingClientRect().bottom <= 0),
        true,
    );
    await page.keyboard.press("Tab");
    assert.equal(
        await page
            .locator(".skip-link")
            .evaluate((el) => el.matches(":focus-visible")),
        true,
    );
    await page.keyboard.press("Enter");
    assert.equal(
        await page
            .locator("main")
            .evaluate((el) => el === document.activeElement),
        true,
    );
    await page.locator("#experiencia .services-question__trigger").click();
    await page.locator(".services-project img").scrollIntoViewIfNeeded();
    await page.waitForFunction(
        () =>
            document.querySelector(".services-project img")?.naturalWidth ===
            1920,
    );
    await page.goto(`${server.url}/rota-desconhecida`);
    await page.getByRole("heading", { level: 1 }).waitFor();
    assert.equal(await page.locator(".services-page").count(), 0);
    const html = await (await fetch(`${server.url}/services.html`)).text();
    assert.match(html, /<title>GCRUZ/);
    assert.match(html, /"@type":"Service"/);
    const quote = await (await fetch(`${server.url}/quote.html`)).text();
    assert.match(quote, /<title>Solicitar orçamento/);
    assert.match(quote, /noindex, follow/);
    assert.doesNotMatch(quote, /"@type":"Person"/);
    assert.match(
        await (await fetch(`${server.url}/sitemap.xml`)).text(),
        /servicos/,
    );
    await ctx.close();
    writeFileSync(`${output}/audit.json`, JSON.stringify(results, null, 2));
    console.log(
        JSON.stringify({
            status: "passed",
            profiles: results.length,
            checks: "both routes, 3 widths, 2 themes, 2 languages, axe document + expanded content, keyboard FAQ, CTA selections, reload, compatible extras, honest email draft, no PII storage, skip link, images, 404, static SEO",
        }),
    );
} finally {
    await browser.close();
    await server.stop();
}
