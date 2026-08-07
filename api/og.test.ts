// @vitest-environment node

import { describe, it, expect } from "vitest";

/* Ambiente node de propósito, e a função também roda em node na Vercel.
   O @vercel/og troca o rasterizador conforme o runtime — nativo no node,
   WebAssembly no edge —, e validar um caminho enquanto se publica o outro
   não é validação. Aqui teste e produção exercitam a mesma variante. */

const { default: handler } = await import("./og");

/** Espelha o par (req, res) que a Vercel entrega ao handler. */
function chamar(url: string) {
    const headers: Record<string, string> = {};
    let corpo = Buffer.alloc(0);
    let codigo = 0;

    const res = {
        headers,
        setHeader: (k: string, v: string) => {
            headers[k.toLowerCase()] = v;
        },
        status(c: number) {
            codigo = c;
            return this;
        },
        send: (b: Buffer) => {
            corpo = b;
        },
    };

    return handler({ url, headers: {} } as never, res as never).then(() => ({
        headers,
        get codigo() {
            return codigo;
        },
        get bytes() {
            return corpo;
        },
    }));
}

/** Os oito primeiros bytes de todo PNG. */
const ASSINATURA_PNG = [137, 80, 78, 71, 13, 10, 26, 10];

describe("/api/og", () => {
    it("rende um PNG de verdade para uma versão conhecida", async () => {
        const r = await chamar("/api/og?v=2.0.0");

        expect(r.codigo).toBe(200);
        expect(r.headers["content-type"]).toContain("image/png");
        expect([...r.bytes.subarray(0, 8)]).toEqual(ASSINATURA_PNG);
        /* Um cartão com texto não cabe em poucos bytes; abaixo disso
           provavelmente saiu vazio. */
        expect(r.bytes.length).toBeGreaterThan(5000);
    }, 60_000);

    it("versão desconhecida ainda rende cartão, em vez de quebrar", async () => {
        /* Pode ser uma release publicada no GitHub depois do último
           deploy: um cartão genérico é melhor que imagem faltando. */
        const r = await chamar("/api/og?v=99.0.0");

        expect(r.codigo).toBe(200);
        expect([...r.bytes.subarray(0, 8)]).toEqual(ASSINATURA_PNG);
    }, 60_000);

    it("sem parâmetro nenhum não estoura", async () => {
        const r = await chamar("/api/og");

        expect(r.codigo).toBe(200);
        expect([...r.bytes.subarray(0, 8)]).toEqual(ASSINATURA_PNG);
    }, 60_000);

    it("aceita a versão com o v na frente", async () => {
        const comV = await chamar("/api/og?v=v2.0.0");
        const semV = await chamar("/api/og?v=2.0.0");

        expect(comV.bytes.length).toBe(semV.bytes.length);
    }, 60_000);

    it("declara cache — a imagem não muda depois de publicada", async () => {
        const r = await chamar("/api/og?v=2.0.0");
        expect(r.headers["cache-control"]).toContain("s-maxage");
    }, 60_000);
});
