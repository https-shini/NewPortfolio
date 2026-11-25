#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────
   audit-urls — endereços públicos contra um deploy real
   ─────────────────────────────────────────────────────────
   O `vite preview` não aplica o vercel.json (redirects, rewrites,
   trailingSlash), então este roteiro roda contra a Vercel:

     BASE_URL=https://gcruz.dev.br npm run audit:urls

   Confere (seguindo até 3 redirecionamentos e exigindo que sejam
   permanentes):
   - cada rota pública responde 200, com a própria canonical;
   - arquivos gerados pelo build e endereços antigos redirecionam
     (308) para o endereço limpo;
   - barra final redireciona para a forma sem barra;
   - rota inexistente responde 404 de verdade;
   - arquivos de código, configuração e segredos não são servidos;
   - cabeçalhos de segurança presentes.

   Sai com código 1 se qualquer verificação falhar.
───────────────────────────────────────────────────────── */

const base = (process.env.BASE_URL ?? "").replace(/\/$/, "");
if (!/^https?:\/\//.test(base)) {
    console.error("Defina BASE_URL, ex.: BASE_URL=https://gcruz.dev.br");
    process.exit(2);
}
const extra = process.env.AUDIT_HEADERS
    ? JSON.parse(process.env.AUDIT_HEADERS)
    : {};

let falhas = 0;
const ok = (msg) => console.log(`ok   ${msg}`);
const erro = (msg) => {
    falhas += 1;
    console.log(`FALHA ${msg}`);
};

async function pedir(caminho) {
    return fetch(`${base}${caminho}`, {
        redirect: "manual",
        headers: { "user-agent": "audit-urls/1.0", ...extra },
    });
}

/** Segue até 3 redirecionamentos (ex.: barra final → endereço antigo →
    endereço novo) e devolve a cadeia e a resposta final. */
async function seguir(caminho) {
    const saltos = [];
    let atual = caminho;
    let r = await pedir(atual);
    while ([301, 302, 307, 308].includes(r.status) && saltos.length < 3) {
        const proximo = new URL(r.headers.get("location") ?? "/", base);
        if (proximo.origin !== new URL(base).origin) break;
        saltos.push(`${r.status} ${proximo.pathname}`);
        atual = proximo.pathname;
        r = await pedir(atual);
    }
    return { saltos, final: atual, r };
}

/** Rotas válidas: 200, HTML e canonical apontando para si mesmas. */
const PAGINAS = [
    ["/", "/"],
    ["/projetos", "/projetos"],
    ["/contato", "/contato"],
    ["/links", "/links"],
    ["/release-notes", "/release-notes"],
    ["/projects/firecode", "/projects/firecode"],
];

/** Origem → destino esperado do redirecionamento permanente. */
const REDIRECTS = [
    ["/index.html", "/"],
    ["/404.html", "/404"],
    ["/rotas/projetos.html", "/projetos"],
    ["/rotas/contato.html", "/contato"],
    ["/rotas/links.html", "/links"],
    ["/rotas/release-notes.html", "/release-notes"],
    ["/projects/firecode/index.html", "/projects/firecode"],
    ["/projects/firecode/readme.html", "/projects/firecode"],
    ["/projects/firecode/", "/projects/firecode"],
    ["/projects/codex", "/projects/firecode"],
    ["/projects/codex/", "/projects/firecode"],
    ["/projects/codex/readme.html", "/projects/firecode"],
    ["/projects/codex/index.html", "/projects/firecode"],
    ["/projects/codex/overview.webp", "/projects/firecode/overview.webp"],
    ["/projects", "/projetos"],
    ["/projetos/", "/projetos"],
    ["/links/", "/links"],
    ["/contato/", "/contato"],
];

/** Nunca devem ser servidos (qualquer coisa diferente de 404 falha). */
const PRIVADOS = [
    "/.env",
    "/.env.local",
    "/.env.production",
    "/.git/config",
    "/package.json",
    "/package-lock.json",
    "/vercel.json",
    "/tsconfig.json",
    "/vite.config.ts",
    "/apps/web/index.html",
    "/apps/web/vite.config.ts",
    "/src/main.tsx",
    "/api/_github.ts",
    "/api/devhub.ts",
    "/scripts/audit-urls.mjs",
    "/docs/README.md",
    "/README.md",
    "/projects/firecode/README.md",
    "/projects/firecode/code-validator.zip",
    "/node_modules/react/package.json",
    "/assets/js/main.js.map",
    "/rotas/",
    "/rota-que-nao-existe",
];

/** Recursos públicos legítimos: precisam continuar acessíveis. */
const PUBLICOS = [
    "/robots.txt",
    "/sitemap.xml",
    "/manifest.webmanifest",
    "/favicon.svg",
    "/og-preview.jpg",
    "/projects/firecode/overview.webp",
    "/docs/Curriculo_PTBR.pdf",
];

const CABECALHOS = [
    "x-content-type-options",
    "x-frame-options",
    "referrer-policy",
    "strict-transport-security",
    "permissions-policy",
];

for (const [caminho, canonica] of PAGINAS) {
    const r = await pedir(caminho);
    const html = r.status === 200 ? await r.text() : "";
    const c = html.match(/rel="canonical" href="([^"]+)"/)?.[1] ?? "";
    if (r.status !== 200) erro(`${caminho} → ${r.status} (esperado 200)`);
    else if (!c.endsWith(canonica === "/" ? "/" : canonica))
        erro(`${caminho} canonical ${c || "(ausente)"}`);
    else ok(`${caminho} 200, canonical ${new URL(c).pathname}`);
    if (caminho === "/") {
        for (const h of CABECALHOS)
            if (!r.headers.get(h)) erro(`cabeçalho ${h} ausente em /`);
        ok(`cabeçalhos de segurança em / (${CABECALHOS.length})`);
    }
}

for (const [origem, destino] of REDIRECTS) {
    const { saltos, final, r } = await seguir(origem);
    if (!saltos.length)
        erro(`${origem} → ${r.status} (esperado redirecionamento)`);
    else if (!saltos.every((salto) => /^(301|308) /.test(salto)))
        erro(`${origem} redireciona sem ser permanente: ${saltos.join(" → ")}`);
    /* `/404` existe para responder 404 de verdade; os demais destinos, 200. */
    else if (final !== destino || r.status !== (destino === "/404" ? 404 : 200))
        erro(`${origem} → ${final} ${r.status} (esperado ${destino})`);
    else ok(`${origem} → ${saltos.join(" → ")} (${r.status})`);
}

for (const caminho of PRIVADOS) {
    const { saltos, r } = await seguir(caminho);
    const via = saltos.length ? ` via ${saltos.join(" → ")}` : "";
    if (r.status === 404) ok(`${caminho} 404${via}`);
    else erro(`${caminho} → ${r.status}${via} (deveria ser 404)`);
}

for (const caminho of PUBLICOS) {
    const r = await pedir(caminho);
    if (r.status === 200)
        ok(`${caminho} 200 (${r.headers.get("content-type")})`);
    else
        erro(
            `${caminho} → ${r.status} (recurso público precisa responder 200)`,
        );
}

/* O 404 de verdade serve a página bilíngue com noindex. */
{
    const r = await pedir("/404");
    const html = await r.text();
    if (r.status === 404 && /noindex/.test(html))
        ok("/404 responde 404 com a página de recuperação (noindex)");
    else erro(`/404 → ${r.status}`);
}

console.log(
    falhas ? `\n${falhas} falha(s)` : "\nTodas as verificações passaram.",
);
process.exit(falhas ? 1 : 0);
