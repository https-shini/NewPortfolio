import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/* O feed atravessa a fronteira entre api/ e frontend/src: importa a
   camada editorial e a função de fusão de verdade, em vez de repetir o
   formato. Este teste existe principalmente para provar que essa travessia
   resolve — se algum dia um import de valor entrar no caminho e quebrar o
   empacotamento da Vercel, ele falha aqui e não em produção. */

const releasesFalsas = vi.hoisted(() => ({ atual: [] as unknown[] }));

vi.mock("./_releases", () => ({
    fetchGithubReleases: async () => releasesFalsas.atual,
}));

const { default: handler } = await import("./feed");

function resposta() {
    const headers: Record<string, string> = {};
    let corpo = "";
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
        send: (b: string) => {
            corpo = b;
        },
    };
}

const req = { query: {} };

beforeEach(() => {
    releasesFalsas.atual = [];
});
afterEach(() => vi.restoreAllMocks());

describe("/api/feed", () => {
    it("emite Atom válido a partir da camada local, sem GitHub", async () => {
        const res = resposta();
        await handler(req, res as never);

        expect(res.codigo).toBe(200);
        expect(res.headers["Content-Type"]).toContain("application/atom+xml");
        expect(res.corpo).toMatch(/^<\?xml version="1\.0" encoding="utf-8"\?>/);
        expect(res.corpo).toContain(
            '<feed xmlns="http://www.w3.org/2005/Atom"',
        );
        expect(res.corpo.trimEnd()).toMatch(/<\/feed>$/);
    });

    it("gera uma entrada por versão, com id igual ao permalink", async () => {
        const res = resposta();
        await handler(req, res as never);

        const entradas = res.corpo.match(/<entry>/g) ?? [];
        expect(entradas.length).toBeGreaterThan(0);

        const ids = [...res.corpo.matchAll(/<id>(.*?)<\/id>/g)].map((m) => m[1]);
        /* O primeiro <id> é o do feed; os demais, das entradas. */
        for (const id of ids.slice(1)) {
            expect(id).toMatch(/\/release-notes\/v\d/);
        }
        expect(new Set(ids).size).toBe(ids.length);
    });

    it("usa RFC 3339 em todo <updated>", async () => {
        const res = resposta();
        await handler(req, res as never);

        const datas = [...res.corpo.matchAll(/<updated>(.*?)<\/updated>/g)].map(
            (m) => m[1]!,
        );
        expect(datas.length).toBeGreaterThan(0);
        for (const d of datas) {
            expect(d).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/);
        }
    });

    it("escapa o que quebraria o XML", async () => {
        releasesFalsas.atual = [
            {
                version: "9.9.9",
                date: "2026-01-02T03:04:05Z",
                title: 'Fusão & <script> "aspas"',
                html: "<p>corpo & cia</p>",
                url: "https://exemplo.test/r?a=1&b=2",
            },
        ];

        const res = resposta();
        await handler(req, res as never);

        expect(res.corpo).toContain("Fusão &amp; &lt;script&gt;");
        /* Nenhum & solto sobrou: todos viraram entidade. */
        expect(/&(?!(amp|lt|gt|quot|apos);)/.test(res.corpo)).toBe(false);
    });

    it("a release do GitHub entra mesmo sem par na camada local", async () => {
        releasesFalsas.atual = [
            {
                version: "9.9.9",
                date: "2026-01-02T03:04:05Z",
                title: "Só no GitHub",
                html: "<p>publicada depois do último deploy</p>",
                url: "https://exemplo.test/r",
            },
        ];

        const res = resposta();
        await handler(req, res as never);

        /* É a razão de o feed ser função e não arquivo de build. */
        expect(res.corpo).toContain("Só no GitHub");
        expect(res.corpo).toContain("/release-notes/v9.9.9");
    });
});
