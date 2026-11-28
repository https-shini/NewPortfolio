#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────
   audit-csp — o site inteiro sob a CSP, registrando violações
   ─────────────────────────────────────────────────────────
   Percorre as rotas (PT/EN × escuro/claro), exercita as interações que
   carregam recurso ou rodam script — ampliação das capturas, abas do
   panorama, paleta Ctrl+K, troca de tema — e coleta cada evento
   `securitypolicyviolation`. Falha se houver qualquer um.

     BASE_URL=http://127.0.0.1:4181 npm run audit:csp

   O servidor precisa enviar a CSP do vercel.json (o `vite preview` não
   envia). Contra um deploy real funciona igual; contra uma simulação
   local, sirva o dist/ com os cabeçalhos do vercel.json.

   A folha do Fontshare é respondida localmente: sem isso o `onload` do
   <link> nunca dispara num ambiente sem rede, e um handler inline
   barrado pela CSP passaria despercebido.
───────────────────────────────────────────────────────── */

import { launchBrowser } from "./lib/browser.mjs";

const base = (process.env.BASE_URL ?? "").replace(/\/$/, "");
if (!/^https?:\/\//.test(base)) {
    console.error("Defina BASE_URL, ex.: BASE_URL=http://127.0.0.1:4181");
    process.exit(2);
}

const ROTAS = [
    "/",
    "/projetos",
    "/projetos/NewPortfolio",
    "/projects/firecode",
    "/contato",
    "/links",
    "/release-notes",
    "/rota-que-nao-existe",
];

const browser = await launchBrowser();
const violacoes = [];
let paginas = 0;

for (const lang of ["pt", "en"]) {
    for (const tema of ["dark", "light"]) {
        const ctx = await browser.newContext({
            viewport: { width: 1280, height: 900 },
        });
        await ctx.addInitScript(
            ([t, l]) => {
                try {
                    localStorage.setItem("portfolio-theme", t);
                    localStorage.setItem("portfolio-lang", l);
                } catch {}
                document.addEventListener("securitypolicyviolation", (e) => {
                    (window.__csp ??= []).push({
                        diretiva: e.effectiveDirective,
                        bloqueado: e.blockedURI || "(inline)",
                        amostra: e.sample,
                        origem: `${e.sourceFile}:${e.lineNumber}`,
                        modo: e.disposition,
                    });
                });
            },
            [tema, lang],
        );
        await ctx.route("https://api.fontshare.com/**", (r) =>
            r.fulfill({
                contentType: "text/css",
                body: "/* fontshare local */",
            }),
        );
        await ctx.route("https://cdn.fontshare.com/**", (r) => r.abort());

        for (const rota of ROTAS) {
            const p = await ctx.newPage();
            await p.goto(base + rota, { waitUntil: "networkidle" });
            await p.waitForTimeout(400);

            if (rota === "/") {
                const shot = p.locator(".featured__shot").first();
                if (await shot.count()) {
                    await shot.scrollIntoViewIfNeeded();
                    await shot.click();
                    await p.waitForTimeout(500);
                    await p.keyboard.press("Escape");
                }
                await p.keyboard.press("Control+k");
                await p.waitForTimeout(300);
                await p.keyboard.press("Escape");
                const tema_ = p
                    .getByRole("button", { name: /tema|theme/i })
                    .first();
                if (await tema_.count()) await tema_.click();
                await p.waitForTimeout(300);
            }
            if (rota === "/projetos") {
                for (const aba of await p.getByRole("tab").all()) {
                    await aba.click().catch(() => {});
                    await p.waitForTimeout(150);
                }
            }
            if (rota === "/projects/firecode") {
                const img = p.locator(".codex__image").first();
                if (await img.count()) {
                    await img.click();
                    await p.waitForTimeout(400);
                    await p.keyboard.press("Escape");
                }
            }

            const v = await p.evaluate(() => window.__csp ?? []);
            for (const item of v) violacoes.push({ rota, lang, tema, ...item });
            paginas += 1;
            await p.close();
        }
        await ctx.close();
    }
}
await browser.close();

const unicas = new Map();
for (const v of violacoes) {
    const chave = `${v.diretiva} | ${v.bloqueado} | ${v.amostra ?? ""}`;
    const atual = unicas.get(chave) ?? { ...v, vezes: 0, rotas: new Set() };
    atual.vezes += 1;
    atual.rotas.add(v.rota);
    unicas.set(chave, atual);
}
for (const [chave, v] of unicas)
    console.log(
        `VIOLAÇÃO ${chave} — ${v.vezes}× em ${[...v.rotas].join(", ")} (${v.modo})`,
    );
console.log(
    unicas.size
        ? `\n${unicas.size} violação(ões) distinta(s) em ${paginas} páginas`
        : `\nNenhuma violação em ${paginas} páginas (8 rotas × 2 idiomas × 2 temas).`,
);
process.exit(unicas.size ? 1 : 0);
