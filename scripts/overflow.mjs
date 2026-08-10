/**
 * Rolagem horizontal — a asserção que não precisa de linha de base.
 *
 *   node scripts/overflow.mjs
 *
 * O diff de geometria completo compara 92.820 caixas contra uma base
 * gravada, e por isso precisa que a base seja regravada a cada mudança
 * visual proposital. Num PR, isso vira um job que falha por construção e
 * que todo mundo aprende a ignorar.
 *
 * Esta verificação cobre o defeito que mais dói — conteúdo escapando da
 * largura da tela — sem base nenhuma: ou o documento é mais largo que a
 * janela, ou não é. Não existe falso positivo, e nada precisa ser
 * atualizado quando o layout muda de propósito.
 */

import {
    launchBrowser,
    newContext,
    startPreview,
    visit,
    ROUTES,
} from "./lib/browser.mjs";

/* Da menor largura que vale suportar ao desktop grande, passando pelos
   pontos onde o layout troca de arranjo. */
const LARGURAS = [320, 375, 768, 1024, 1440];

/* Um pixel de sobra é arredondamento de subpixel, não vazamento. */
const TOLERANCIA = 1;

const preview = await startPreview();
const browser = await launchBrowser();
const falhas = [];

try {
    for (const route of Object.values(ROUTES)) {
        for (const width of LARGURAS) {
            const { ctx, page } = await newContext(browser, {
                baseUrl: preview.url,
                theme: "dark",
                viewport: { width, height: 900 },
            });

            await visit(page, preview.url, route);

            const r = await page.evaluate((tol) => {
                const doc = document.documentElement;
                const excesso = doc.scrollWidth - doc.clientWidth;
                if (excesso <= tol) return { excesso, culpados: [] };

                /* Quem é mais largo que a janela, ou começa depois da borda
                   direita. Só os visíveis: o que está oculto não empurra. */
                const culpados = [...document.querySelectorAll("body *")]
                    .filter((el) => {
                        const cs = getComputedStyle(el);
                        if (cs.display === "none" || cs.visibility === "hidden")
                            return false;
                        const b = el.getBoundingClientRect();
                        return b.width > 0 && b.right > doc.clientWidth + tol;
                    })
                    .slice(0, 5)
                    .map((el) => {
                        const b = el.getBoundingClientRect();
                        const nome = `${el.tagName.toLowerCase()}.${
                            (el.className || "").toString().split(" ")[0] || "?"
                        }`;
                        return `${nome} vai até ${Math.round(b.right)}px`;
                    });

                return { excesso, culpados };
            }, TOLERANCIA);

            const rotulo = `${route} @ ${width}px`;
            if (r.excesso > TOLERANCIA) {
                falhas.push({ rotulo, ...r });
                console.log(`FALHA  ${rotulo} — ${r.excesso}px além da janela`);
                r.culpados.forEach((c) => console.log(`         ${c}`));
            } else {
                console.log(`  ok   ${rotulo}`);
            }
            await ctx.close();
        }
    }
} finally {
    await browser.close();
    await preview.stop();
}

const total = Object.keys(ROUTES).length * LARGURAS.length;
console.log(
    `\n${total - falhas.length}/${total} combinações sem rolagem horizontal`,
);
process.exit(falhas.length ? 1 : 0);
