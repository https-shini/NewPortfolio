/** Página 404 no build: recuperação, idiomas, metadados e conteúdo sem JS.
 * O status HTTP do fallback pertence à hospedagem; vite preview/serve
 * respondem 200 para a SPA e não simulam o roteamento da Vercel. */
import assert from "node:assert/strict";
import { launchBrowser, newContext, startPreview, visit } from "./lib/browser.mjs";

const preview = await startPreview();
const browser = await launchBrowser();

try {
    for (const lang of ["pt", "en"]) {
        const { ctx, page } = await newContext(browser, {
            baseUrl: preview.url,
            theme: "dark",
            lang,
        });
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        const homeLabel = lang === "pt" ? "Voltar ao início" : "Back to home";
        const linksLabel = lang === "pt" ? "Explorar meus links" : "Explore my links";
        const title = lang === "pt" ? "Página não encontrada" : "Page not found";
        await visit(page, preview.url, `/endereco/inexistente${lang === "en" ? "?lang=en" : ""}`);
        assert.match(await page.locator("h1").innerText(), new RegExp(title));
        assert.equal(await page.locator('meta[name="robots"]').getAttribute("content"), "noindex, follow");
        await page.getByRole("link", { name: homeLabel, exact: true }).click();
        assert.equal(new URL(page.url()).pathname, "/");
        assert.equal(await page.locator('meta[name="robots"]').getAttribute("content"), "index, follow");
        if (lang === "en") assert.equal(new URL(page.url()).searchParams.get("lang"), "en");
        await page.goBack();
        await page.getByRole("heading", { level: 1, name: new RegExp(title) }).waitFor();
        await page.getByRole("link", { name: linksLabel, exact: true }).click();
        await page.locator("main.linktree").waitFor();
        assert.equal(new URL(page.url()).pathname, "/links");
        assert.equal(await page.locator('meta[name="robots"]').getAttribute("content"), "index, follow");
        assert.deepEqual(errors, []);
        await ctx.close();
        console.log(`ok  404 → início → voltar → links · ${lang}`);
    }

    // Carrega o arquivo real gerado, não o fallback do dev server.
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(`${preview.url}/404.html`);
    assert.equal(await page.locator("h1").innerText(), "Página não encontrada");
    assert.equal(await page.locator('meta[name="robots"]').getAttribute("content"), "noindex, follow");
    assert.equal(await page.locator('script[type="application/ld+json"]').count(), 0);
    assert.equal(await page.getByRole("link", { name: "Voltar ao início" }).getAttribute("href"), "/");
    assert.match(await page.locator('script[type="module"]').getAttribute("src"), /^\/assets\/js\//);
    await ctx.close();
    console.log("ok  404.html gerado: assets absolutos, noindex e recuperação sem JavaScript");
} finally {
    await browser.close();
    await preview.stop();
}
