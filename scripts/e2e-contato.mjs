/** A rota /contato existe de verdade, e o caminho que o visitante percorre
 * até ela funciona.
 *
 * Esta auditoria nasceu de um defeito real: a consolidação do portfólio
 * removeu o caso de /contato do roteador e a reescrita do vercel.json, mas
 * deixou de pé tudo o que aponta para lá — a constante em ROUTES, o link
 * visível no rodapé, os metadados em api/crawler.ts e a própria página em
 * pages/Contact. O resultado é que o endereço respondia a página 404, e
 * nenhum portão reprovava: os testes de unidade não navegam, e as outras
 * auditorias de navegador não visitavam /contato.
 *
 * O que se verifica aqui é, nessa ordem: o endereço direto monta a página
 * de contato e não a 404; o link do rodapé leva até lá a partir da home;
 * e a página é indexável e acessível nos dois temas e nos dois idiomas.
 * Rede externa simulada. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import {
    launchBrowser,
    newContext,
    startPreview,
    visit,
} from "./lib/browser.mjs";

/* Espelham shared/lib/translations.json — se mudarem lá, mudam aqui. */
const TITULO_CONTATO = {
    pt: "Vamos trabalhar juntos",
    en: "Let's work together",
};
const TITULO_404 = { pt: "Página não encontrada", en: "Page not found" };
const ROTULO_RODAPE = { pt: "Contato", en: "Contact" };

const preview = await startPreview();
const browser = await launchBrowser();

try {
    for (const lang of ["pt", "en"]) {
        const { ctx, page } = await newContext(browser, {
            baseUrl: preview.url,
            theme: "dark",
            lang,
            viewport: { width: 1440, height: 1000 },
        });
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));

        /* ── O endereço direto ─────────────────────────────────────────
           O defeito aparecia exatamente aqui, e com a 404 respondendo em
           silêncio: por isso se assere o título certo E a ausência do
           título da 404. Uma asserção só de "tem h1" passaria quebrada. */
        await visit(page, preview.url, "/contato");
        const titulo = await page.locator("h1").innerText();
        assert.equal(titulo, TITULO_CONTATO[lang]);
        assert.notEqual(titulo, TITULO_404[lang]);
        assert.equal(await page.locator("h1").count(), 1);

        /* A página é conteúdo real e completo, então entra no índice — o
           cabeçalho de pages/Contact diz isso e esta linha o cobra. */
        assert.equal(
            await page.locator('meta[name="robots"]').getAttribute("content"),
            "index, follow",
        );

        /* A seção vem do widget reaproveitado, não de uma cópia. */
        assert.equal(await page.locator("section.contact").count(), 1);

        /* ── O caminho do visitante ────────────────────────────────────
           É o link do rodapé que estava levando à 404. Partir da home e
           clicar nele é o que reproduz o relato original. */
        await visit(page, preview.url, "/");
        const linkRodape = page
            .locator('a[href="/contato"]')
            .filter({ hasText: ROTULO_RODAPE[lang] });
        assert.equal(await linkRodape.count(), 1);
        assert.ok(await linkRodape.isVisible(), "o link do rodapé é visível");
        await linkRodape.click();
        await page
            .getByRole("heading", { level: 1, name: TITULO_CONTATO[lang] })
            .waitFor();
        assert.equal(new URL(page.url()).pathname, "/contato");

        /* Voltar precisa devolver a home, e não deixar o histórico preso
           numa rota que o roteador não reconhece. */
        await page.goBack();
        assert.equal(new URL(page.url()).pathname, "/");

        assert.deepEqual(errors, []);
        await ctx.close();
        console.log(`ok  /contato pelo endereço e pelo rodapé · ${lang}`);
    }

    const require = createRequire(import.meta.url);
    const axe = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
    for (const theme of ["dark", "light"]) {
        for (const lang of ["pt", "en"]) {
            const { ctx, page } = await newContext(browser, {
                baseUrl: preview.url,
                theme,
                lang,
                viewport: { width: 390, height: 844 },
            });
            await visit(page, preview.url, "/contato");
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
            await ctx.close();
            console.log(
                `ok  acessibilidade em tela estreita · ${theme} · ${lang}`,
            );
        }
    }
} finally {
    await browser.close();
    await preview.stop();
}
