// @vitest-environment node

import { describe, it, expect } from "vitest";

/* Ambiente node de propósito. Sob jsdom o resolvedor escolhe a variante
   WebAssembly do rasterizador, que não inicializa fora de um runtime
   edge de verdade — o teste falharia por causa do ambiente, não do
   código, que é o tipo de teste que ensina a ignorar teste. */

const { default: handler } = await import("./og");

async function gerar(url: string) {
    const res = await handler(new Request(url));
    const bytes = new Uint8Array(await res.arrayBuffer());
    return { res, bytes };
}

/** Os oito primeiros bytes de todo PNG. */
const ASSINATURA_PNG = [137, 80, 78, 71, 13, 10, 26, 10];

describe("/api/og", () => {
    it("rende um PNG de verdade para uma versão conhecida", async () => {
        const { res, bytes } = await gerar("https://x.test/api/og?v=2.0.0");

        expect(res.status).toBe(200);
        expect(res.headers.get("content-type")).toContain("image/png");
        expect([...bytes.slice(0, 8)]).toEqual(ASSINATURA_PNG);
        /* Um cartão com texto não cabe em poucos bytes; abaixo disso
           provavelmente saiu vazio. */
        expect(bytes.length).toBeGreaterThan(5000);
    }, 60_000);

    it("versão desconhecida ainda rende cartão, em vez de quebrar", async () => {
        /* Pode ser uma release publicada no GitHub depois do último
           deploy: um cartão genérico é melhor que imagem faltando. */
        const { res, bytes } = await gerar("https://x.test/api/og?v=99.0.0");

        expect(res.status).toBe(200);
        expect([...bytes.slice(0, 8)]).toEqual(ASSINATURA_PNG);
    }, 60_000);

    it("sem parâmetro nenhum não estoura", async () => {
        const { res, bytes } = await gerar("https://x.test/api/og");

        expect(res.status).toBe(200);
        expect([...bytes.slice(0, 8)]).toEqual(ASSINATURA_PNG);
    }, 60_000);

    it("aceita a versão com o v na frente", async () => {
        const { bytes: comV } = await gerar("https://x.test/api/og?v=v2.0.0");
        const { bytes: semV } = await gerar("https://x.test/api/og?v=2.0.0");

        expect(comV.length).toBe(semV.length);
    }, 60_000);

    it("declara cache — a imagem não muda depois de publicada", async () => {
        const { res } = await gerar("https://x.test/api/og?v=2.0.0");
        expect(res.headers.get("cache-control")).toContain("s-maxage");
    }, 60_000);
});
