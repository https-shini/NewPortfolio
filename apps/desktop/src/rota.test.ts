import { describe, it, expect } from "vitest";
// @ts-expect-error — módulo CommonJS do processo principal, sem tipos
import { resolver } from "./rota.js";

/* ─────────────────────────────────────────────────────────
   Resolução de rota do protocolo `app://`
   ─────────────────────────────────────────────────────────
   O app empacotado não tem servidor: quem decide o que responder a cada
   caminho é esta função. Errar aqui não aparece em desenvolvimento — o
   Vite serve tudo — e só se manifesta depois de instalado.
───────────────────────────────────────────────────────── */

const RAIZ = "/app/resources/web";

/** Um dist plausível: o que existe em disco, e só isso. */
const NO_DISCO = new Set([
    "/app/resources/web/index.html",
    "/app/resources/web/favicon.ico",
    "/app/resources/web/assets/js/index-abc.js",
    "/app/resources/web/assets/css/index-abc.css",
]);
const existe = (caminho: string) => NO_DISCO.has(caminho);

const tipoDe = (pathname: string) =>
    resolver(pathname, RAIZ, existe).tipo as string;

describe("resolver", () => {
    it("entrega os arquivos que existem", () => {
        expect(resolver("/favicon.ico", RAIZ, existe)).toEqual({
            tipo: "arquivo",
            caminho: "/app/resources/web/favicon.ico",
        });
        expect(tipoDe("/assets/js/index-abc.js")).toBe("arquivo");
    });

    it("manda as rotas do site para o index.html", () => {
        for (const rota of ["/", "/links", "/downloads", "/release-notes"]) {
            expect(resolver(rota, RAIZ, existe), rota).toEqual({
                tipo: "indice",
                caminho: "/app/resources/web/index.html",
            });
        }
    });

    it("trata rota de versão como rota, e não como arquivo", () => {
        /* O bug que motivou este arquivo: a decisão era por
           `path.extname`, e `path.extname("/release-notes/v2.1.0")` é
           ".0". A rota virava pedido de um arquivo inexistente e a página
           não carregava — só no app empacotado, e só ao recarregar
           estando nela. */
        for (const rota of [
            "/release-notes/v2.1.0",
            "/release-notes/v2.0.0-rc.1",
            "/release-notes/v10.20.30",
        ]) {
            expect(tipoDe(rota), rota).toBe("indice");
        }
    });

    it("não deixa sair da pasta do site", () => {
        /* Mesmo que o alvo exista no disco de verdade, fora da raiz não
           se entrega nada: cai no index.html. */
        for (const ataque of [
            "/../../etc/passwd",
            "/..%2f..%2fetc%2fpasswd",
            "/assets/../../../../etc/shadow",
        ]) {
            expect(tipoDe(ataque), ataque).toBe("indice");
        }
    });

    it("separa as chamadas de API de tudo o mais", () => {
        /* Sem isto elas caíam no fallback e recebiam HTML onde o hook
           espera JSON — a /downloads dentro do app mostrava erro. */
        expect(tipoDe("/api/downloads")).toBe("api");
        expect(tipoDe("/api/release-notes")).toBe("api");
        expect(tipoDe("/api/baixar")).toBe("api");
    });

    it("não confunde uma rota parecida com a API", () => {
        /* `/apitude` não é `/api/`. A checagem é pelo separador. */
        expect(tipoDe("/apitude")).toBe("indice");
        expect(tipoDe("/api")).toBe("indice");
    });
});
