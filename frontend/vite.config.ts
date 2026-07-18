import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    plugins: [
        react({
            jsxRuntime: "automatic",
        }),
    ],

    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    
    publicDir: path.resolve(__dirname, "./src/public"),

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
});
