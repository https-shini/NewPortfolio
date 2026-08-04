/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

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

export default defineConfig({
    plugins: [
        react({
            jsxRuntime: "automatic",
        }),
        siteUrlHtmlPlugin(),
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
        include: ["src/**/*.test.{ts,tsx}"],
    },
});
