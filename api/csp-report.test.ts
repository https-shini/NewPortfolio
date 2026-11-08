// @vitest-environment node

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { default: handler } = await import("./csp-report");

/** Espelha o par (req, res) que a Vercel entrega ao handler. */
function chamar(body: unknown, method = "POST") {
    const headers: Record<string, string> = {};
    let codigo = 0;
    let corpo: string | undefined;

    const res = {
        setHeader: (k: string, v: string) => {
            headers[k.toLowerCase()] = v;
        },
        status(c: number) {
            codigo = c;
            return this;
        },
        send: (b?: string) => {
            corpo = b;
        },
    };

    return handler({ method, headers: {}, body } as never, res as never).then(
        () => ({ headers, codigo, corpo }),
    );
}

let avisos: string[];

beforeEach(() => {
    avisos = [];
    vi.spyOn(console, "warn").mockImplementation((...a: unknown[]) => {
        avisos.push(a.join(" "));
    });
});

afterEach(() => vi.restoreAllMocks());

describe("/api/csp-report", () => {
    /* O formato do `report-uri`, que é o que a maioria dos navegadores
       ainda manda hoje. */
    it("registra a violação no formato report-uri", async () => {
        const r = await chamar({
            "csp-report": {
                "document-uri": "https://gcruz.dev.br/",
                "effective-directive": "img-src",
                "blocked-uri": "https://exemplo.invalido/pixel.gif",
                "original-policy": "default-src 'self'; img-src 'self'",
            },
        });

        expect(r.codigo).toBe(204);
        expect(avisos).toHaveLength(1);
        expect(avisos[0]).toContain("diretiva=img-src");
        expect(avisos[0]).toContain(
            "bloqueado=https://exemplo.invalido/pixel.gif",
        );
        expect(avisos[0]).toContain("documento=https://gcruz.dev.br/");
    });

    /* O formato do `report-to`: array, e os campos em camelCase. */
    it("registra cada violação de um lote no formato report-to", async () => {
        const r = await chamar([
            {
                type: "csp-violation",
                body: {
                    documentURL: "https://gcruz.dev.br/links",
                    effectiveDirective: "font-src",
                    blockedURL: "https://outro.invalido/f.woff2",
                },
            },
            {
                type: "csp-violation",
                body: {
                    documentURL: "https://gcruz.dev.br/",
                    effectiveDirective: "script-src-elem",
                    blockedURL: "inline",
                },
            },
        ]);

        expect(r.codigo).toBe(204);
        expect(avisos).toHaveLength(2);
        expect(avisos[0]).toContain("diretiva=font-src");
        expect(avisos[1]).toContain("bloqueado=inline");
    });

    /* Alguns runtimes entregam o corpo cru quando o content-type é
       `application/csp-report`, que eles não sabem parsear. */
    it("aceita o corpo como string JSON", async () => {
        const r = await chamar(
            JSON.stringify({
                "csp-report": {
                    "effective-directive": "style-src",
                    "blocked-uri": "inline",
                },
            }),
        );

        expect(r.codigo).toBe(204);
        expect(avisos[0]).toContain("diretiva=style-src");
    });

    /* A política inteira vem em todo relatório e repetiria centenas de
       caracteres iguais em cada linha do log. */
    it("não despeja a política inteira no log", async () => {
        const politica = "default-src 'self'; ".repeat(30);
        await chamar({
            "csp-report": {
                "effective-directive": "img-src",
                "blocked-uri": "data:",
                "original-policy": politica,
            },
        });

        expect(avisos[0]).not.toContain(politica);
        expect(avisos[0].length).toBeLessThan(300);
    });

    /* Relatório é entrega de mão única: o navegador não mostra falha a
       ninguém nem tenta de novo. Responder erro só polui o log. */
    it("não estoura com corpo que não dá para interpretar", async () => {
        const r = await chamar("isto não é json");

        expect(r.codigo).toBe(204);
        expect(avisos[0]).toContain("corpo não-JSON");
    });

    it("não estoura com um objeto sem violação nenhuma", async () => {
        const r = await chamar({ qualquer: "coisa" });

        expect(r.codigo).toBe(204);
        expect(avisos[0]).toContain("formato não reconhecido");
    });

    /* Erro visto em produção: POST sem corpo chegava com `body`
       indefinido e `JSON.stringify(undefined)` não tem `.slice`. */
    it("não estoura com POST sem corpo", async () => {
        const r = await chamar(undefined);

        expect(r.codigo).toBe(204);
        expect(avisos[0]).toContain("formato não reconhecido: undefined");
    });

    it("limita o número de violações registradas por envio", async () => {
        const lote = Array.from({ length: 500 }, (_, i) => ({
            type: "csp-violation",
            body: {
                effectiveDirective: "img-src",
                blockedURL: `https://x.test/${i}`,
            },
        }));
        const r = await chamar(lote);

        expect(r.codigo).toBe(204);
        expect(avisos).toHaveLength(21);
        expect(avisos.at(-1)).toContain("480 violação(ões) a mais");
    });

    it("descarta corpo grande demais sem interpretá-lo", async () => {
        const r = await chamar("x".repeat(64 * 1024));

        expect(r.codigo).toBe(204);
        expect(avisos).toHaveLength(1);
        expect(avisos[0]).toContain("corpo descartado");
    });

    it("não deixa um campo forjar linhas novas no log", async () => {
        await chamar({
            "csp-report": {
                "effective-directive": "script-src\n[csp] diretiva=falsa",
                "blocked-uri": "inline",
                "document-uri": "https://gcruz.dev.br/",
            },
        });

        expect(avisos).toHaveLength(1);
        expect(avisos[0]).not.toContain("\n");
    });

    it("recusa método diferente de POST, dizendo qual aceita", async () => {
        const r = await chamar(undefined, "GET");

        expect(r.codigo).toBe(405);
        expect(r.headers.allow).toBe("POST");
        expect(avisos).toHaveLength(0);
    });
});
