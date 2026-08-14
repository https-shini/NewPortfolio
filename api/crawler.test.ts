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

    it("cada rota rende um cartão diferente", async () => {
        /* É a razão de o arquivo existir: hoje as três compartilham o
           mesmo título, a mesma descrição e a mesma imagem. */
        const titulos = await Promise.all(
            ["/links", "/release-notes", "/release-notes/v2.0.0"].map(
                async (p) => meta((await pedir(p)).corpo, "og:title"),
            ),
        );
        expect(new Set(titulos).size).toBe(3);
    });

    it("versão inexistente cai no cartão padrão, sem quebrar", async () => {
        const { corpo } = await pedir("/release-notes/v0.0.0-nao-existe");
        expect(meta(corpo, "og:title")).toContain("Guilherme Cruz");
        expect(meta(corpo, "og:type")).toBe("website");
    });

    /* O histórico do site é curado: a camada local é a lista de permissão
       (ver mergeReleaseNotes). Uma release publicada no GitHub que não
       conste dela não vira página, e portanto não vira cartão. */
    it("a release que só existe no GitHub não ganha cartão", async () => {
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
        expect(meta(corpo, "og:title")).not.toContain("9.9.9");
        expect(corpo).not.toContain("Publicada depois do deploy");
    });

    /* Antes este caso injetava um título hostil por uma release só do
       GitHub — caminho que a lista de permissão fechou. O que importa
       continua valendo e passou a ser verificado no conteúdo real: os
       atributos saem sempre bem formados. */
    it("os atributos saem bem formados, sem aspas ou & soltos", async () => {
        const { corpo } = await pedir("/release-notes/v2.0.0");

        for (const nome of ["og:title", "og:description", "og:url"]) {
            expect(meta(corpo, nome)).not.toContain('"');
        }
        /* Nenhum & solto sobrou: todos viraram entidade. */
        expect(/&(?!(amp|lt|gt|quot|apos|#\d+);)/.test(corpo)).toBe(false);
    });

    it("não deixa a ênfase do corpo editorial vazar para a descrição", async () => {
        const { corpo } = await pedir("/release-notes/v2.0.0");
        const desc = meta(corpo, "og:description") ?? "";
        expect(desc).not.toContain("**");
        expect(desc).not.toContain("`");
        expect(desc.length).toBeLessThanOrEqual(200);
    });
});
