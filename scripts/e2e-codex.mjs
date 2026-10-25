import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import {
    launchBrowser,
    newContext,
    startPreview,
    visit,
} from "./lib/browser.mjs";

const require = createRequire(import.meta.url);
const axe = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const preview = await startPreview();
const browser = await launchBrowser();
const route = "/projects/codex/readme.html";
try {
    for (const theme of ["dark", "light"]) {
        for (const lang of ["pt", "en"]) {
            const { ctx, page } = await newContext(browser, {
                baseUrl: preview.url,
                theme,
                lang,
                viewport: { width: 1440, height: 1000 },
            });
            const errors = [];
            page.on("pageerror", (e) => errors.push(e.message));
            await visit(page, preview.url, route);
            await page.locator(".codex h1").waitFor();
            assert.match(await page.locator("h1").innerText(), /Codex/);
            assert.equal(await page.locator(".codex__image img").count(), 4);
            for (const img of await page.locator(".codex__image img").all()) {
                await img.scrollIntoViewIfNeeded();
                await img.evaluate(async (el) => {
                    await el.decode();
                });
                assert.deepEqual(
                    await img.evaluate((el) => [
                        el.naturalWidth,
                        el.naturalHeight,
                    ]),
                    [1920, 1080],
                );
            }
            for (const a of await page.locator(".codex__nav a").all()) {
                const href = await a.getAttribute("href");
                assert.equal(await page.locator(href).count(), 1);
            }
            await page.locator('.codex__nav a[href="#engenharia"]').click();
            assert.ok(page.url().endsWith("#engenharia"));
            await page.locator(".codex__image").first().click();
            await page.getByRole("dialog").waitFor();
            await page.keyboard.press("ArrowRight");
            assert.equal(
                await page.locator(".fl-counter-current").innerText(),
                "02",
            );
            await page.keyboard.press("Escape");
            await page.getByRole("dialog").waitFor({ state: "hidden" });
            assert.ok(
                await page
                    .locator(".codex__image")
                    .first()
                    .evaluate((el) => el === document.activeElement),
            );
            assert.equal(
                await page
                    .locator(
                        'a[href*="README.md" i], a[href*="ABOUT.md" i], .codex a[download]',
                    )
                    .count(),
                0,
            );
            assert.equal(
                (await page.locator("#implementacao code").count()) > 5,
                true,
            );
            assert.doesNotMatch(
                await page.locator(".codex").innerText(),
                /README|SaaS|roadmap/i,
            );
            for (const file of ["README.md", "ABOUT.md"]) {
                // Vite's SPA fallback can return index.html for Accept: */*.
                // A document request must never receive the removed Markdown.
                const response = await page.request.get(
                    `${preview.url}/projects/codex/${file}`,
                    { headers: { Accept: "text/markdown" } },
                );
                assert.equal(response.status(), 404);
            }
            await page.addScriptTag({ content: axe });
            const violations = await page.evaluate(async () =>
                (
                    await window.axe.run(document, {
                        runOnly: {
                            type: "tag",
                            values: [
                                "wcag2a",
                                "wcag2aa",
                                "wcag21aa",
                                "wcag22aa",
                            ],
                        },
                    })
                ).violations.map((v) => ({
                    id: v.id,
                    targets: v.nodes.map((n) => n.target),
                })),
            );
            assert.deepEqual(violations, [], `${theme}/${lang} accessibility`);
            for (const width of [320, 375, 768, 1440]) {
                await page.setViewportSize({ width, height: 900 });
                assert.ok(
                    await page.evaluate(
                        () =>
                            document.documentElement.scrollWidth <= innerWidth,
                    ),
                    `${theme}/${lang}/${width} overflow`,
                );
            }
            assert.deepEqual(errors, []);
            const logo = page.locator(".header__logo");
            assert.equal(
                await logo.getAttribute("href"),
                lang === "en" ? "/?lang=en#inicio" : "/#inicio",
            );
            await logo.click();
            await page.locator("#hero-name").waitFor();
            assert.equal(
                await page
                    .locator('a[href*="README.md" i], a[href*="ABOUT.md" i]')
                    .count(),
                0,
            );
            assert.equal(
                await page
                    .locator(
                        '.featured__actions a[href^="/projects/codex/readme.html"]',
                    )
                    .count(),
                1,
            );
            const feature = page.locator("#destaque");
            await feature.scrollIntoViewIfNeeded();
            assert.equal(
                await feature.locator(".featured__thumbnail").count(),
                4,
            );
            await feature.locator(".featured__thumbnail").nth(2).click();
            assert.equal(
                await feature
                    .locator(".featured__thumbnail")
                    .nth(2)
                    .getAttribute("aria-pressed"),
                "true",
            );
            await feature
                .locator(".featured__thumbnail")
                .nth(2)
                .press("ArrowRight");
            assert.equal(
                await feature
                    .locator(".featured__thumbnail")
                    .nth(3)
                    .getAttribute("aria-pressed"),
                "true",
            );
            for (const arrow of await feature
                .locator(".featured__arrow")
                .all()) {
                const bounds = await arrow.boundingBox();
                assert.ok(
                    bounds.width >= 44 && bounds.height >= 44,
                    "featured touch controls",
                );
            }
            await feature.locator(".featured__arrow").last().click();
            assert.equal(
                await feature
                    .locator(".featured__thumbnail")
                    .first()
                    .getAttribute("aria-pressed"),
                "true",
            );
            const featureTrigger = feature.locator(".featured__slide-trigger");
            await featureTrigger.click();
            await page.getByRole("dialog").waitFor();
            await page.keyboard.press("Escape");
            await page.getByRole("dialog").waitFor({ state: "hidden" });
            assert.ok(
                await featureTrigger.evaluate(
                    (el) => el === document.activeElement,
                ),
            );
            await page.addScriptTag({ content: axe });
            assert.deepEqual(
                await page.evaluate(async () =>
                    (
                        await window.axe.run(
                            document.querySelector("#destaque"),
                            {
                                runOnly: {
                                    type: "tag",
                                    values: [
                                        "wcag2a",
                                        "wcag2aa",
                                        "wcag21aa",
                                        "wcag22aa",
                                    ],
                                },
                            },
                        )
                    ).violations.map((v) => v.id),
                ),
                [],
            );
            for (const width of [320, 375, 768, 1440]) {
                await page.setViewportSize({ width, height: 900 });
                assert.ok(
                    await feature.evaluate(
                        (el) => el.scrollWidth <= el.clientWidth,
                    ),
                    `featured ${theme}/${lang}/${width} overflow`,
                );
            }
            await page.goBack();
            await page.locator(".codex h1").waitFor();
            await page.reload();
            await page.locator(".codex h1").waitFor();
            for (const alias of [
                "/projects/codex/",
                "/projects/codex/index.html",
            ]) {
                await visit(page, preview.url, alias);
                await page.locator(".codex h1").waitFor();
                assert.ok(
                    (
                        await page
                            .locator('link[rel="canonical"]')
                            .getAttribute("href")
                    ).endsWith(route),
                );
            }
            // Direct browser visits may use Vite's SPA fallback, but never reveal a document.
            await visit(page, preview.url, "/projects/codex/README.md");
            await page.locator(".not-found__title").waitFor();
            console.log(
                `ok ${theme}/${lang}: 4 imagens Full HD, galeria, teclado, navegação, ausência de documentos públicos, acessibilidade e 4 larguras`,
            );
            await ctx.close();
        }
    }
} finally {
    await browser.close();
    await preview.stop();
}
