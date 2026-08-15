/**
 * Notas de versão, ponta a ponta — índice e página por versão.
 *
 *   node scripts/e2e-release-notes.mjs      # ou npm run audit:release-notes
 *
 * Junta os dois roteiros que antes viviam separados no scratchpad: o do
 * índice (`/release-notes`) e o da página de cada versão. Separados eles
 * repetiam o mesmo arranque, o mesmo bloqueio de rede e as mesmas
 * asserções de rodapé — e divergiam sempre que só um dos dois era
 * corrigido.
 *
 * A rota da versão é a única do site que depende de dado externo. Aqui a
 * API responde lista vazia de propósito: o que se verifica é que a camada
 * local sustenta a página sozinha, que é o que acontece na prática
 * enquanto não há release publicada.
 */

import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
    launchBrowser,
    newContext,
    startPreview,
    visit,
} from "./lib/browser.mjs";

/* As versões saem do RELEASE_NOTES, não do texto deste arquivo. Estavam
   fixas em v2.0.0 e v2.0.0-rc.1, e a asserção "a mais recente não oferece
   versão mais nova" passava só enquanto a 2.0.0 fosse o topo — publicar
   qualquer versão nova quebrava o roteiro sem que nada tivesse quebrado
   no site. Mesmo import do changelog.mjs, com --experimental-strip-types. */
const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { RELEASE_NOTES } = await import(
    resolve(raiz, "apps/web/src/shared/config/releaseNotes.ts")
);

const [MAIS_RECENTE, ANTERIOR] = RELEASE_NOTES;
const ROTA_RECENTE = `/release-notes/v${MAIS_RECENTE.version}`;
const ROTA_ANTERIOR = `/release-notes/v${ANTERIOR.version}`;

const resultados = [];
const check = (nome, ok, detalhe = "") => {
    resultados.push({ nome, ok, detalhe });
    console.log(
        `${ok ? "  ok " : "FALHA"}  ${nome}${detalhe ? `  (${detalhe})` : ""}`,
    );
};

const preview = await startPreview();
const browser = await launchBrowser();

/** Erros de console que importam — ruído de rede bloqueada não conta. */
function coletarErros(page) {
    const erros = [];
    page.on("console", (m) => {
        if (m.type() !== "error") return;
        const t = m.text();
        if (/net::ERR_FAILED|Failed to load resource/i.test(t)) return;
        erros.push(t);
    });
    return erros;
}

try {
    /* ══ Índice ══════════════════════════════════════════════════ */
    {
        const { ctx, page } = await newContext(browser, {
            baseUrl: preview.url,
            theme: "dark",
            lang: "pt",
            viewport: { width: 1280, height: 900 },
        });
        const erros = coletarErros(page);

        const r = await page.goto(`${preview.url}/release-notes`, {
            waitUntil: "domcontentloaded",
        });
        check(
            "GET /release-notes responde 200",
            r.status() === 200,
            r.status(),
        );

        await page.waitForSelector(".release-page, main", { timeout: 25_000 });
        await page.waitForTimeout(500);

        check(
            "título da aba identifica a rota",
            /notas de vers|release notes/i.test(await page.title()),
            await page.title(),
        );

        const canonical = await page
            .locator('link[rel="canonical"]')
            .getAttribute("href")
            .catch(() => "");
        check(
            "canonical aponta para a rota",
            /\/release-notes$/.test(canonical ?? ""),
            canonical ?? "ausente",
        );

        check("índice tem um h1", (await page.locator("h1").count()) === 1);

        /* A mais recente fica aberta no topo (.release-notes__entry) e o
           resto vira acordeão (.release-item) — contar só a primeira daria
           1 e esconderia o histórico inteiro. */
        const cartoes = await page
            .locator(".release-notes__entry, .release-item")
            .count();
        check(
            "a camada local sustenta a timeline sem o GitHub",
            cartoes >= 4,
            `${cartoes} entradas`,
        );

        check(
            "selo de sincronização presente",
            (await page.locator(".release-notes__sync").count()) > 0,
        );

        const chips = page.locator('[role="group"] button, .tag-filter button');
        check(
            "chips de filtro renderizam",
            (await chips.count()) >= 2,
            `${await chips.count()} chips`,
        );

        /* Este caso assertava o oposto — "histórico curto não pagina" —
           quando o tamanho de página era 50. Com 4 por página o índice
           passa a ter mais de uma, e o que importa verificar é que a
           paginação aparece, marca a página corrente e leva à seguinte. */
        const paginacao = page.locator('[class*="pagination"]');
        check("o índice pagina", (await paginacao.count()) === 1);

        const dots = page.locator(".release-notes__dot");
        check(
            "um ponto por página, um deles marcado",
            (await dots.count()) >= 2 &&
                (await page.locator(".release-notes__dot.is-current").count()) ===
                    1,
            `${await dots.count()} pontos`,
        );

        const primeiraPagina = await page.locator(".release-item").count();
        await page.locator('[class*="pagination"] a').last().click();
        await page.waitForTimeout(600);
        check(
            "avançar de página troca o conteúdo",
            new URL(page.url()).pathname.includes("/page/2") &&
                (await page.locator(".release-item").count()) > 0 &&
                (await page.locator(".release-item").count()) <= primeiraPagina,
            new URL(page.url()).pathname,
        );

        /* Volta ao índice para os casos seguintes. */
        await page.goto(`${preview.url}/release-notes`, {
            waitUntil: "domcontentloaded",
        });
        await page.waitForTimeout(500);

        /* O permalink precisa levar à versão certa, não só existir. Os
           ids trocam ponto por traço, porque ponto tem significado em
           seletor CSS e quebraria querySelector. */
        await page.goto(`${preview.url}/release-notes#v2-0-0-beta-3`, {
            waitUntil: "domcontentloaded",
        });
        await page.waitForTimeout(800);
        const alvoVisivel = await page
            .locator("#v2-0-0-beta-3")
            .isVisible()
            .catch(() => false);
        check("permalink alcança a versão", alvoVisivel);

        check(
            "console sem erros no índice",
            erros.length === 0,
            erros.join(" | "),
        );
        await ctx.close();
    }

    /* ══ Página de versão ════════════════════════════════════════ */
    {
        const { ctx, page } = await newContext(browser, {
            baseUrl: preview.url,
            theme: "dark",
            lang: "pt",
            viewport: { width: 1280, height: 900 },
        });
        const erros = coletarErros(page);

        await visit(page, preview.url, ROTA_RECENTE);

        const h1 = page.locator("h1").first();
        check("a versão monta com h1", await h1.isVisible());
        /* O h1 é a versão — ela identifica a página e é a mesma nos dois
           idiomas. O título editorial desceu para o h2 logo abaixo, e o
           caso confere os dois para que a hierarquia não se perca. */
        check(
            "o h1 é o número da versão",
            (await h1.innerText()).trim() === `v${MAIS_RECENTE.version}`,
            (await h1.innerText()).slice(0, 40),
        );
        const h2 = page.locator(".release-note__title").first();
        check(
            "o título da versão vem no h2",
            (await h2.innerText()).trim() === MAIS_RECENTE.title.pt,
            (await h2.innerText()).slice(0, 40),
        );

        check(
            "a trilha situa a página",
            (await page.locator(".release-note__crumbs").count()) === 1,
        );
        check(
            "título da aba traz a versão",
            (await page.title()).includes(`v${MAIS_RECENTE.version}`),
            await page.title(),
        );

        const canonical = await page
            .locator('link[rel="canonical"]')
            .getAttribute("href")
            .catch(() => "");
        check(
            "canonical é o da versão",
            (canonical ?? "").endsWith(ROTA_RECENTE),
            canonical ?? "ausente",
        );

        check(
            "cabeçalho do site presente",
            (await page.locator("#site-header, header").count()) > 0,
        );
        check(
            "rodapé do site presente",
            (await page.locator("footer").count()) > 0,
        );

        /* Navegação entre versões: a mais recente não tem "mais nova". */
        check(
            "a mais recente não oferece versão mais nova",
            (await page.locator('[class*="nav-link--next"]').count()) === 0,
        );

        const anterior = page.locator('[class*="nav-link--prev"]');
        check("aponta para a versão anterior", (await anterior.count()) > 0);

        if (await anterior.count()) {
            await anterior.first().click();
            await page.waitForTimeout(600);
            check(
                "navegar entre versões troca a URL",
                new URL(page.url()).pathname === ROTA_ANTERIOR,
                new URL(page.url()).pathname,
            );
            check(
                "a versão do meio tem os dois vizinhos",
                (await page.locator('[class*="nav-link--prev"]').count()) > 0 &&
                    (await page.locator('[class*="nav-link--next"]').count()) >
                        0,
            );
        }

        /* Versão inexistente informa, em vez de quebrar. */
        await page.goto(`${preview.url}/release-notes/v0.0.0-nao-existe`, {
            waitUntil: "domcontentloaded",
        });
        await page.waitForTimeout(600);
        /* O h1, e não o corpo inteiro: procurar no body deixava o teste
           passar por causa de qualquer texto solto da página. */
        const h1NaoEncontrada = await page
            .locator("h1")
            .first()
            .innerText()
            .catch(() => "");
        check(
            "versão inexistente informa no h1, sem quebrar",
            /não encontrad|not found/i.test(h1NaoEncontrada),
            h1NaoEncontrada,
        );

        check(
            "console sem erros na versão",
            erros.length === 0,
            erros.join(" | "),
        );
        await ctx.close();
    }

    /* ══ Rodapé: o selo de versão leva ao índice ═════════════════ */
    {
        const { ctx, page } = await newContext(browser, {
            baseUrl: preview.url,
            theme: "dark",
            viewport: { width: 1280, height: 900 },
        });
        await visit(page, preview.url, "/");

        const selo = page.locator('footer a[href="/release-notes"]');
        check("o selo de versão do rodapé é link", (await selo.count()) >= 1);

        if (await selo.count()) {
            await selo.first().click();
            await page.waitForTimeout(600);
            check(
                "o selo navega para o índice",
                new URL(page.url()).pathname === "/release-notes",
                new URL(page.url()).pathname,
            );
        }
        await ctx.close();
    }

    /* ══ Idioma e tema nas duas rotas ════════════════════════════ */
    {
        /* Qual elemento carrega a manchete traduzida em cada rota: no
           índice é o próprio h1; na página da versão o h1 é o número
           `vX.Y.Z`, igual nos dois idiomas — quem traduz é o h2. */
        const manchete = {
            "/release-notes": "h1",
            [ROTA_RECENTE]: ".release-note__title",
        };

        for (const rota of ["/release-notes", ROTA_RECENTE]) {
            const alvo = manchete[rota];

            const pt = await newContext(browser, {
                baseUrl: preview.url,
                theme: "dark",
                lang: "pt",
                viewport: { width: 1280, height: 900 },
            });
            await visit(pt.page, preview.url, rota);
            const emPt = await pt.page.locator(alvo).first().innerText();
            await pt.ctx.close();

            const en = await newContext(browser, {
                baseUrl: preview.url,
                theme: "dark",
                lang: "en",
                viewport: { width: 1280, height: 900 },
            });
            await visit(en.page, preview.url, rota);
            const emEn = await en.page.locator(alvo).first().innerText();
            const langDoc = await en.page.evaluate(
                () => document.documentElement.lang,
            );
            await en.ctx.close();

            check(
                `${rota} traduz a manchete`,
                emPt !== emEn,
                `"${emPt.slice(0, 24)}" → "${emEn.slice(0, 24)}"`,
            );
            check(
                `${rota} declara o idioma renderizado`,
                langDoc.toLowerCase().startsWith("en"),
                langDoc,
            );
        }
    }
} finally {
    await browser.close();
    await preview.stop();
}

const falhas = resultados.filter((r) => !r.ok);
console.log(
    `\n${resultados.length - falhas.length}/${resultados.length} verificações passaram`,
);
process.exit(falhas.length ? 1 : 0);
