/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { writeFile, readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Versão da aplicação — fonte única. Lida do package.json e injetada como
   __APP_VERSION__ para que nenhum arquivo do src precise digitá-la. */
const { version: APP_VERSION } = createRequire(import.meta.url)(
    "./package.json",
) as { version: string };

/* Domínio canônico — fonte única para o index.html (SEO/OG/JSON-LD).
   Sobrescrevível por VITE_SITE_URL em previews; mesmo default de profile.ts. */
const SITE_URL = process.env.VITE_SITE_URL || "https://gcruz.dev.br";

/** Injeta __SITE_URL__ no index.html no build (canonical, Open Graph, JSON-LD).
    order: "pre" garante a substituição antes do parser de HTML/URL do Vite. */
function siteUrlHtmlPlugin() {
    return {
        name: "inject-site-url",
        transformIndexHtml: {
            order: "pre" as const,
            handler(html: string) {
                return html.replaceAll("__SITE_URL__", SITE_URL);
            },
        },
    };
}

/* ── Sitemap e robots ────────────────────────────────────────────────────
 *
 * Antes o `public/sitemap.xml` era escrito à mão e só as páginas de versão
 * saíam do código. As datas envelheciam sozinhas: a home ficou parada em
 * 2026-07-17 enquanto mudava dezenas de vezes, e as oito âncoras repetiam
 * `SECTION_IDS` letra por letra. Agora o arquivo inteiro nasce do build, e
 * o `<lastmod>` vem do git — a única fonte que não depende de alguém
 * lembrar de atualizar.
 */

/** Data do último commit que tocou qualquer um dos caminhos (YYYY-MM-DD). */
function lastModified(paths: string[]): string | null {
    try {
        const out = execFileSync(
            "git",
            ["log", "-1", "--format=%cs", "--", ...paths],
            {
                cwd: path.resolve(__dirname, ".."),
                encoding: "utf8",
                /* Fora de um clone o git reclama no stderr; o build já
                   trata a ausência, então o aviso só polui o log. */
                stdio: ["ignore", "pipe", "ignore"],
            },
        ).trim();
        return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : null;
    } catch {
        /* Sem git: repositório raso no CI (`fetch-depth: 1`), tarball, ou
           build fora de um clone. Quem chama decide o que fazer. */
        return null;
    }
}

/** `&`, `<` e `>` quebram o XML; versões e caminhos passam por aqui. */
function escapeXml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

interface SitemapEntry {
    loc: string;
    lastmod: string | null;
    changefreq: string;
    priority: string;
}

function renderUrl(
    { loc, lastmod, changefreq, priority }: SitemapEntry,
    alternativas: { hreflang: string; href: string }[],
) {
    /* <lastmod> é opcional na especificação. Sem data confiável, omitir é
       melhor do que inventar: um valor errado desorienta o rastreador mais
       do que a ausência. */
    return [
        "    <url>",
        `        <loc>${escapeXml(loc)}</loc>`,
        ...(lastmod ? [`        <lastmod>${lastmod}</lastmod>`] : []),
        `        <changefreq>${changefreq}</changefreq>`,
        `        <priority>${priority}</priority>`,
        /* Sem isto, as duas formas da mesma página competem entre si nos
           resultados em vez de se declararem equivalentes. O x-default
           aponta para a URL limpa, que é a canônica. */
        ...alternativas.map(
            (a) =>
                `        <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${escapeXml(a.href)}"/>`,
        ),
        "    </url>",
    ].join("\n");
}

function sitemapPlugin() {
    return {
        name: "sitemap",
        async closeBundle() {
            const { RELEASE_NOTES } =
                await import("./src/shared/config/releaseNotes");
            const {
                SECTION_IDS,
                releaseNotePath,
                releaseNotesPagePath,
                releaseNotesTotalPages,
                HREFLANG,
                withLang,
            } = await import("./src/shared/config/routes");

            /* Data de cada rota: o commit mais recente entre os caminhos que
               a compõem. Widgets entram na home porque é lá que aparecem. */
            const homeDate = lastModified([
                "apps/web/src/pages/Home",
                "apps/web/src/widgets",
                "apps/web/src/shared/lib/translations.ts",
            ]);

            const entries: SitemapEntry[] = [
                {
                    loc: `${SITE_URL}/`,
                    lastmod: homeDate,
                    changefreq: "monthly",
                    priority: "1.0",
                },
                {
                    loc: `${SITE_URL}/links`,
                    lastmod: lastModified([
                        "apps/web/src/pages/Links",
                        "apps/web/src/shared/config/links.ts",
                    ]),
                    changefreq: "monthly",
                    priority: "0.9",
                },
                {
                    loc: `${SITE_URL}/release-notes`,
                    lastmod: lastModified([
                        "apps/web/src/pages/ReleaseNotes",
                        "apps/web/src/shared/config/releaseNotes.ts",
                    ]),
                    changefreq: "weekly",
                    priority: "0.7",
                },
            ];

            /* Âncoras da home — geradas de SECTION_IDS, não copiadas. */
            for (const id of Object.values(SECTION_IDS)) {
                entries.push({
                    loc: `${SITE_URL}/#${id}`,
                    lastmod: homeDate,
                    changefreq: "monthly",
                    priority: "0.8",
                });
            }

            /* Índice paginado: a página 1 é o próprio /release-notes, já
               listado acima, então o laço começa na 2.

               O `- 1` é a versão mais recente, que ocupa o topo do índice e
               não entra na paginação. Sem ele a conta daqui divergia da do
               widget e o sitemap chegava a anunciar uma página que o site
               devolve como a anterior. */
            const totalPages = releaseNotesTotalPages(RELEASE_NOTES.length - 1);
            for (let page = 2; page <= totalPages; page++) {
                entries.push({
                    loc: `${SITE_URL}${releaseNotesPagePath(page)}`,
                    lastmod: lastModified([
                        "apps/web/src/shared/config/releaseNotes.ts",
                    ]),
                    changefreq: "weekly",
                    priority: "0.5",
                });
            }

            for (const entry of RELEASE_NOTES) {
                if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
                    throw new Error(
                        `[sitemap] a versão ${entry.version} tem data "${entry.date}", ` +
                            `fora do formato YYYY-MM-DD exigido por <lastmod>.`,
                    );
                }
                entries.push({
                    loc: `${SITE_URL}${releaseNotePath(entry.version)}`,
                    lastmod: entry.date,
                    changefreq: "yearly",
                    priority: "0.6",
                });
            }

            const xml = [
                '<?xml version="1.0" encoding="UTF-8"?>',
                "<!--",
                `    Gerado no build por vite.config.ts — não editar à mão.`,
                `    As datas vêm do git; as âncoras, de SECTION_IDS.`,
                "-->",
                '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
                '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
                ...entries.map((e) =>
                    renderUrl(e, [
                        { hreflang: HREFLANG.pt, href: e.loc },
                        { hreflang: HREFLANG.en, href: withLang(e.loc, "en") },
                        { hreflang: "x-default", href: e.loc },
                    ]),
                ),
                "</urlset>",
                "",
            ].join("\n");

            await writeFile(
                path.resolve(__dirname, "./dist/sitemap.xml"),
                xml,
                "utf8",
            );

            /* O robots.txt trazia o domínio fixo e não passa pelo
               transformIndexHtml, que só alcança HTML. */
            await writeFile(
                path.resolve(__dirname, "./dist/robots.txt"),
                `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
                "utf8",
            );
        },
    };
}

/* ── Um documento por rota ───────────────────────────────────────────────
 *
 * Havia um `index.html` só, e o `vercel.json` reescrevia as três rotas
 * para ele. Duas consequências, as duas medidas:
 *
 *   1. quem abria `/links` baixava e compilava a home inteira — 21 KiB de
 *      JS e 22 KiB de CSS que o PageSpeed contava como não usados;
 *   2. título, descrição e canônica eram os da home para todo mundo, e só
 *      o `useDocumentMeta` corrigia, depois do JavaScript.
 *
 * Com um documento por rota, cada uma recebe o seu pedaço e a sua folha
 * ligados no HTML — e as fichas de SEO certas antes de qualquer script.
 *
 * Por que não bastava pôr a home em `lazy`: com `cssCodeSplit`, a folha de
 * um pedaço dinâmico não entra no HTML — quem a pede é o carregador, em
 * execução. A folha da home passaria a ser descoberta depois de baixar e
 * executar 54 KB de JavaScript, o que no celular é regressão de FCP na
 * rota de maior tráfego.
 */
const ROTAS_HTML = [
    {
        arquivo: "index.html",
        entrada: "/src/main.tsx",
        caminho: "/",
        titulo: "Guilherme Cruz — Desenvolvedor de Software | React, TypeScript & Node.js",
        tituloCurto: "Guilherme Cruz — Desenvolvedor de Software",
        descricao:
            "Portfólio profissional de Guilherme Cruz — Desenvolvedor Full Stack especializado em React, TypeScript, Node.js e Python. Projetos reais, experiência e formação.",
        resumo: "Desenvolvedor Full Stack especializado em React, TypeScript, Node.js e interfaces de alta performance.",
    },
    {
        arquivo: "links.html",
        entrada: "/src/entradas/links.tsx",
        caminho: "/links",
        titulo: "Links — Guilherme Cruz",
        tituloCurto: "Links — Guilherme Cruz",
        descricao:
            "Todos os canais de contato e presença de Guilherme Cruz — portfólio, GitHub, LinkedIn, currículo e e-mail, em um lugar só.",
        resumo: "Portfólio, GitHub, LinkedIn, currículo e contato de Guilherme Cruz, em um lugar só.",
    },
    {
        arquivo: "release-notes.html",
        entrada: "/src/entradas/release-notes.tsx",
        caminho: "/release-notes",
        titulo: "Notas de versão — Guilherme Cruz",
        tituloCurto: "Notas de versão — Guilherme Cruz",
        descricao:
            "Histórico de versões de gcruz.dev.br: o que mudou em cada release, com as decisões por trás de cada uma.",
        resumo: "O que mudou em cada versão de gcruz.dev.br, com as decisões por trás de cada uma.",
    },
] as const;

/** Os HTML derivados moram no diretório do app, ao lado do index.html. */
const htmlDe = (arquivo: string) => path.resolve(__dirname, arquivo);

function rotaHtmlPlugin() {
    return {
        name: "documento-por-rota",

        /* `serve.json` no dist para que o servidor estático das
           auditorias reescreva como a Vercel reescreve. Sem isto o
           `/release-notes/v2.0.0` devolve 404 no `serve`, e a auditoria
           mediria um erro achando que media a página.

           Só esta regra: o `cleanUrls` do `serve` já mapeia `/links` e
           `/release-notes` para os arquivos de mesmo nome sozinho, e a
           Vercel faz o equivalente pelos rewrites do `vercel.json`. O que
           nenhum dos dois cobre por padrão é o segmento a mais. */
        async closeBundle() {
            await writeFile(
                path.resolve(__dirname, "./dist/serve.json"),
                JSON.stringify(
                    {
                        rewrites: [
                            {
                                source: "/release-notes/**",
                                destination: "/release-notes.html",
                            },
                        ],
                    },
                    null,
                    2,
                ) + "\n",
                "utf8",
            );
        },

        /* Os derivados nascem antes do Rollup ler as entradas. São cópias
           do index.html com o `src` do módulo trocado — o resto (fontes,
           JSON-LD, bootstrap de tema) continua com fonte única. */
        async buildStart() {
            const modelo = await readFile(htmlDe("index.html"), "utf8");
            for (const rota of ROTAS_HTML) {
                if (rota.arquivo === "index.html") continue;
                await writeFile(
                    htmlDe(rota.arquivo),
                    modelo.replace("/src/main.tsx", rota.entrada),
                    "utf8",
                );
            }
        },

        /* As fichas `__ROTA_*__` do modelo viram os valores da rota. O
           `ctx.filename` é o caminho absoluto do HTML em processamento. */
        transformIndexHtml: {
            order: "pre" as const,
            handler(html: string, ctx: { filename: string }) {
                const rota =
                    ROTAS_HTML.find((r) => ctx.filename.endsWith(r.arquivo)) ??
                    ROTAS_HTML[0];

                return html
                    .replaceAll("__ROTA_TITULO_CURTO__", rota.tituloCurto)
                    .replaceAll("__ROTA_TITULO__", rota.titulo)
                    .replaceAll("__ROTA_DESCRICAO__", rota.descricao)
                    .replaceAll("__ROTA_RESUMO__", rota.resumo)
                    .replaceAll(
                        "__ROTA_CAMINHO__",
                        rota.caminho === "/" ? "/" : rota.caminho,
                    );
            },
        },
    };
}

export default defineConfig({
    plugins: [
        react({
            jsxRuntime: "automatic",
        }),
        rotaHtmlPlugin(),
        siteUrlHtmlPlugin(),
        sitemapPlugin(),
    ],

    /* Constante de build — ver a declaração em src/vite-env.d.ts. */
    define: {
        __APP_VERSION__: JSON.stringify(APP_VERSION),
    },

    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },

    /* Assets estáticos servidos na raiz do site (favicons, manifest,
       robots, sitemap, og-preview, docs/*.pdf). */
    publicDir: path.resolve(__dirname, "./public"),

    server: {
        port: 5173,
        open: true,
        strictPort: true,
        /* A raiz do repositório contém a pasta api/, cujo conversor de
           markdown entra na suíte de testes (ver `test.include`). */
        fs: { allow: ["../.."] },
    },

    preview: {
        port: 4173,
        strictPort: true,
    },

    build: {
        outDir: "dist",
        emptyOutDir: true,
        sourcemap: false,
        target: "es2020",
        minify: "esbuild",

        cssCodeSplit: true,

        rollupOptions: {
            /* Uma entrada por documento — ver `rotaHtmlPlugin`. */
            input: Object.fromEntries(
                ROTAS_HTML.map((r) => [
                    r.arquivo.replace(/\.html$/, ""),
                    htmlDe(r.arquivo),
                ]),
            ),

            output: {
                /* React/ReactDOM raramente mudam — isolá-los preserva o
                   cache do usuário entre deploys do código da aplicação. */
                manualChunks: {
                    vendor: ["react", "react-dom", "react-dom/client"],
                },

                entryFileNames: "assets/js/[name]-[hash].js",
                chunkFileNames: "assets/js/[name]-[hash].js",

                assetFileNames: ({ name }) => {
                    if (!name) return "assets/[name]-[hash][extname]";

                    if (/\.(css)$/.test(name)) {
                        return "assets/css/[name]-[hash][extname]";
                    }

                    if (/\.(png|jpe?g|svg|gif|webp|avif)$/.test(name)) {
                        return "assets/img/[name]-[hash][extname]";
                    }

                    if (/\.(woff2?|ttf|otf)$/.test(name)) {
                        return "assets/fonts/[name]-[hash][extname]";
                    }

                    return "assets/[name]-[hash][extname]";
                },
            },
        },

        chunkSizeWarningLimit: 1000,
    },

    optimizeDeps: {
        include: ["react", "react-dom"],
    },

    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: "./src/test/setup.ts",
        css: false,
        /* A pasta api/ mora na raiz do repositório (é de lá que a Vercel
           lê as funções), mas o conversor de markdown é código de
           segurança e precisa da mesma suíte. */
        include: ["src/**/*.test.{ts,tsx}", "../../api/**/*.test.ts"],
    },
});
