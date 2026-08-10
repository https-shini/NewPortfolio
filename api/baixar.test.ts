import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler, { permitido } from "./baixar";

/* ─────────────────────────────────────────────────────────
   /api/baixar — o que este endpoint aceita entregar
   ─────────────────────────────────────────────────────────
   Este é o único caminho de download depois que o repositório fecha, e
   ele fala com a API do GitHub usando um token. Duas coisas precisam
   valer sempre: o que entra é um nome de arquivo e nada além disso, e o
   que sai é instalador ou metadado de atualização — nunca um arquivo
   qualquer do repositório.
───────────────────────────────────────────────────────── */

function resposta() {
    const headers: Record<string, string> = {};
    let corpo: unknown = null;
    let codigo = 0;
    return {
        headers,
        get corpo() {
            return corpo;
        },
        get codigo() {
            return codigo;
        },
        setHeader: (k: string, v: string) => {
            headers[k] = v;
        },
        status(c: number) {
            codigo = c;
            return this;
        },
        json: (b: unknown) => {
            corpo = b;
        },
        end: () => {},
    };
}

const req = (arquivo?: string | string[]) => ({
    query: arquivo === undefined ? {} : { arquivo },
});

describe("permitido", () => {
    it("aceita os instaladores que a página lista", () => {
        for (const nome of [
            "portfolio-desktop-2.1.0-win-x64.exe",
            "portfolio-desktop-2.1.0-mac-arm64.dmg",
            "portfolio-desktop-2.1.0-linux-x64.AppImage",
            "portfolio-desktop-2.1.0-linux-amd64.deb",
            "portfolio-2.1.0-android.apk",
        ]) {
            expect(permitido(nome), nome).toBe(true);
        }
    });

    it("aceita os metadados que o electron-updater lê", () => {
        /* Não aparecem na página, mas sem eles a atualização automática
           volta a depender do repositório aberto. */
        expect(permitido("latest.yml")).toBe(true);
        expect(permitido("latest-linux.yml")).toBe(true);
        expect(permitido("latest-mac.yml")).toBe(true);
        expect(permitido("portfolio-desktop-2.1.0-win-x64.exe.blockmap")).toBe(
            true,
        );
    });

    it("recusa qualquer outra coisa que caia numa release", () => {
        /* A v2.1.0 saiu com o build inteiro do site anexado. Mesmo que
           isso volte a acontecer, nada disso é entregável por aqui. */
        for (const nome of [
            "index.html",
            "sitemap.xml",
            "Curriculo_PTBR.pdf",
            "vendor-C9qBkTug.js",
            "builder-debug.yml",
            "og-preview.jpg",
        ]) {
            expect(permitido(nome), nome).toBe(false);
        }
    });

    it("não confunde builder-debug.yml com um latest.yml", () => {
        /* A regra é ancorada no começo: `latest` tem que iniciar o nome. */
        expect(permitido("builder-debug.yml")).toBe(false);
        expect(permitido("nao-latest.yml")).toBe(false);
    });
});

describe("handler", () => {
    const tokenOriginal = process.env.GITHUB_TOKEN;

    beforeEach(() => {
        process.env.GITHUB_TOKEN = "token-de-teste";
        vi.spyOn(console, "warn").mockImplementation(() => {});
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        if (tokenOriginal === undefined) delete process.env.GITHUB_TOKEN;
        else process.env.GITHUB_TOKEN = tokenOriginal;
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("400 sem o parâmetro", async () => {
        const res = resposta();
        await handler(req(), res);
        expect(res.codigo).toBe(400);
    });

    it("400 em travessia de caminho", async () => {
        /* Antes de qualquer requisição: a validação não depende de o
           passo seguinte estar correto. */
        for (const ruim of [
            "../../etc/passwd",
            "pasta/arquivo.exe",
            "..\\windows\\system32",
            ".env",
        ]) {
            const res = resposta();
            await handler(req(ruim), res);
            expect(res.codigo, ruim).toBe(400);
        }
    });

    it("404 para arquivo que existe mas não é entregável", async () => {
        const res = resposta();
        await handler(req("Curriculo_PTBR.pdf"), res);
        /* 404 e não 403: dizer "existe, mas você não pode" descreveria o
           repositório para quem está sondando. */
        expect(res.codigo).toBe(404);
    });

    it("503 quando falta o token, em vez de 404", async () => {
        /* 404 faria parecer que a release é que não existe, e mandaria
           quem investiga para o lado errado. */
        delete process.env.GITHUB_TOKEN;
        const res = resposta();
        await handler(req("portfolio-desktop-2.1.0-win-x64.exe"), res);
        expect(res.codigo).toBe(503);
    });

    it("redireciona para a URL assinada, sem repassar o token", async () => {
        const assinada =
            "https://objects.githubusercontent.com/instalador?token=abc";

        vi.stubGlobal(
            "fetch",
            vi.fn(async (url: string, init?: RequestInit) => {
                if (String(url).includes("/releases?")) {
                    return {
                        ok: true,
                        json: async () => [
                            {
                                draft: false,
                                assets: [
                                    {
                                        id: 42,
                                        name: "portfolio-desktop-2.1.0-win-x64.exe",
                                    },
                                ],
                            },
                        ],
                    };
                }
                /* Só responde 302 quando o Accept pede o binário. */
                expect((init?.headers as Record<string, string>).Accept).toBe(
                    "application/octet-stream",
                );
                expect(init?.redirect).toBe("manual");
                return {
                    status: 302,
                    headers: {
                        get: (k: string) =>
                            k === "location" ? assinada : null,
                    },
                };
            }),
        );

        const res = resposta();
        await handler(req("portfolio-desktop-2.1.0-win-x64.exe"), res);

        expect(res.codigo).toBe(302);
        expect(res.headers.Location).toBe(assinada);
        /* A URL assinada expira em minutos; guardá-la em CDN entregaria
           um endereço morto para todo mundo depois do primeiro acesso. */
        expect(res.headers["Cache-Control"]).toBe("no-store");
    });

    it("404 quando o arquivo não está em nenhuma release", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => ({ ok: true, json: async () => [] })),
        );
        const res = resposta();
        await handler(req("portfolio-desktop-9.9.9-win-x64.exe"), res);
        expect(res.codigo).toBe(404);
    });

    it("502 quando o GitHub falha, e não 404", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => ({
                ok: false,
                status: 500,
                json: async () => ({}),
            })),
        );
        const res = resposta();
        await handler(req("portfolio-desktop-2.1.0-win-x64.exe"), res);
        expect(res.codigo).toBe(502);
    });

    it("ignora release em rascunho", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => ({
                ok: true,
                json: async () => [
                    {
                        draft: true,
                        assets: [
                            {
                                id: 7,
                                name: "portfolio-desktop-2.1.0-win-x64.exe",
                            },
                        ],
                    },
                ],
            })),
        );
        const res = resposta();
        await handler(req("portfolio-desktop-2.1.0-win-x64.exe"), res);
        expect(res.codigo).toBe(404);
    });
});
