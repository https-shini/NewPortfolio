import { describe, it, expect, vi, beforeEach } from "vitest";

/* Os rastreadores que montam o cartão de compartilhamento não executam
   JavaScript. Todo o valor deste arquivo está em devolver, por rota, um
   HTML cujas meta tags já estejam certas — por isso o que se testa aqui
   é o conteúdo das tags, não o caminho feliz do handler. */

const releasesFalsas = vi.hoisted(() => ({ atual: [] as unknown[] }));

vi.mock("./_releases", () => ({
    fetchGithubReleases: async () => releasesFalsas.atual,
}));

const { default: handler } = await import("./crawler");

function resposta() {
    const headers: Record<string, string> = {};
    let corpo = "";
    return {
        headers,
        get corpo() {
            return corpo;
        },
        setHeader: (k: string, v: string) => {
            headers[k] = v;
        },
        status() {
            return this;
        },
        send: (b: string) => {
            corpo = b;
        },
    };
}

async function pedir(path: string) {
    const res = resposta();
    await handler({ query: { path }, headers: {} }, res as never);
    return res;
}

/** Lê o content de uma meta pelo atributo que a identifica. */
function meta(html: string, chave: string): string | null {
    const re = new RegExp(
        `<meta (?:property|name)="${chave}" content="([^"]*)"`,
        "i",
    );
    return re.exec(html)?.[1] ?? null;
}

beforeEach(() => {
    releasesFalsas.atual = [];
});

describe("/api/crawler", () => {
    it("dá título e descrição próprios à página de links", async () => {
        const { corpo } = await pedir("/links");
        expect(meta(corpo, "og:title")).toContain("Links");
        expect(meta(corpo, "og:url")).toMatch(/\/links$/);
        expect(meta(corpo, "og:type")).toBe("website");
    });

    it("dá título próprio ao índice de notas de versão", async () => {
        const { corpo } = await pedir("/release-notes");
        expect(meta(corpo, "og:title")).toContain("Notas de versão");
        expect(meta(corpo, "og:url")).toMatch(/\/release-notes$/);
    });

    it("a página de versão recebe título, imagem e data próprios", async () => {
        const { corpo } = await pedir("/release-notes/v2.0.0");

        expect(meta(corpo, "og:title")).toContain("v2.0.0");
        expect(meta(corpo, "og:type")).toBe("article");
        expect(meta(corpo, "og:image")).toContain("/api/og?v=2.0.0");
        expect(meta(corpo, "article:published_time")).toMatch(/^\d{4}-\d{2}/);
    });

    it("a página de downloads não empresta o cartão da home", async () => {
        /* É o endereço que o QR code do rodapé espalha, e sem um ramo
           próprio ele cairia no PADRÃO — cujo og:url aponta para `/`.
           Um cartão que afirma ser outra página é pior que nenhum. */
        const { corpo } = await pedir("/downloads");
        expect(meta(corpo, "og:title")).toContain("Downloads");
        expect(meta(corpo, "og:url")).toMatch(/\/downloads$/);
    });

    it("cada rota rende um cartão diferente", async () => {
        /* É a razão de o arquivo existir: hoje as três compartilham o
           mesmo título, a mesma descrição e a mesma imagem. */
        const titulos = await Promise.all(
            [
                "/links",
                "/release-notes",
                "/release-notes/v2.0.0",
                "/downloads",
            ].map(async (p) => meta((await pedir(p)).corpo, "og:title")),
        );
        expect(new Set(titulos).size).toBe(4);
    });

    it("versão inexistente cai no cartão padrão, sem quebrar", async () => {
        const { corpo } = await pedir("/release-notes/v0.0.0-nao-existe");
        expect(meta(corpo, "og:title")).toContain("Guilherme Cruz");
        expect(meta(corpo, "og:type")).toBe("website");
    });

    it("a release que só existe no GitHub também ganha cartão", async () => {
        releasesFalsas.atual = [
            {
                version: "9.9.9",
                date: "2026-01-02T03:04:05Z",
                title: "Publicada depois do deploy",
                html: "<p>corpo</p>",
                url: "https://exemplo.test/r",
            },
        ];
        const { corpo } = await pedir("/release-notes/v9.9.9");
        expect(meta(corpo, "og:title")).toContain("v9.9.9");
        expect(meta(corpo, "og:image")).toContain("v=9.9.9");
    });

    it("escapa aspas e sinais que quebrariam o atributo", async () => {
        releasesFalsas.atual = [
            {
                version: "8.8.8",
                date: "2026-01-02T03:04:05Z",
                title: 'Fusão & "aspas" <script>',
                html: "<p>corpo</p>",
                url: "https://exemplo.test/r",
            },
        ];
        const { corpo } = await pedir("/release-notes/v8.8.8");
        expect(corpo).toContain("&quot;aspas&quot;");
        expect(corpo).not.toContain('<script>"');
        expect(meta(corpo, "og:title")).not.toContain('"');
    });

    it("não deixa a ênfase do corpo editorial vazar para a descrição", async () => {
        const { corpo } = await pedir("/release-notes/v2.0.0");
        const desc = meta(corpo, "og:description") ?? "";
        expect(desc).not.toContain("**");
        expect(desc).not.toContain("`");
        expect(desc.length).toBeLessThanOrEqual(200);
    });
});
