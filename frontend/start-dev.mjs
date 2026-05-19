import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = await createServer({
    configFile: false,
    root: __dirname,
    plugins: [react({ jsxRuntime: "automatic" })],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        port: 5173,
        open: false,
        strictPort: true,
        host: "localhost",
    },
    cacheDir: path.join(os.tmpdir(), "vite-portfolio-cache"),
    optimizeDeps: {
        include: ["react", "react-dom"],
    },
    build: {
        outDir: "dist",
        target: "es2020",
    },
});

await server.listen();
server.printUrls();
