/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { readFile, writeFile } from "node:fs/promises";

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

/**
 * Acrescenta ao sitemap uma URL por versão publicada.
 *
 * O `public/sitemap.xml` continua sendo a fonte das rotas fixas e das
 * âncoras da home, escritas à mão. As notas de versão, não: cada entrada
 * nova em `RELEASE_NOTES` viraria uma linha a lembrar de copiar. Aqui elas
 * saem da própria lista, no build — acrescentar uma versão continua sendo
 * mexer num arquivo só.
 */
function releaseNotesSitemapPlugin() {
    return {
        name: "release-notes-sitemap",
        async closeBundle() {
            const { RELEASE_NOTES } =
                await import("./src/shared/config/releaseNotes");
            const file = path.resolve(__dirname, "./dist/sitemap.xml");

            const xml = await readFile(file, "utf8").catch(() => null);
            if (!xml) return;

            const urls = RELEASE_NOTES.map(
                (entry) => `    <url>
        <loc>${SITE_URL}/release-notes/v${entry.version}</loc>
        <lastmod>${entry.date}</lastmod>
        <changefreq>yearly</changefreq>
        <priority>0.6</priority>
    </url>`,
            ).join("\n");

            await writeFile(
                file,
                xml.replace("</urlset>", `${urls}\n</urlset>`),
                "utf8",
            );
        },
    };
}

export default defineConfig({
    plugins: [
        react({
            jsxRuntime: "automatic",
        }),
        siteUrlHtmlPlugin(),
        releaseNotesSitemapPlugin(),
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
        fs: { allow: [".."] },
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
        include: ["src/**/*.test.{ts,tsx}", "../api/**/*.test.ts"],
    },
});
