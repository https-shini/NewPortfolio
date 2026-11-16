// @vitest-environment node

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/* O SDK do Blob é substituído por um store de mentira em memória que
   imita as regras que a trava usa: `allowOverwrite: false` falha se o
   objeto existe, `ifMatch` falha se a ETag mudou. */
const blob = vi.hoisted(() => {
    class BlobError extends Error {}
    const objetos = new Map<string, { corpo: string; etag: string }>();
    let versao = 0;
    const put = vi.fn(
        async (
            chave: string,
            corpo: string,
            op: { allowOverwrite?: boolean; ifMatch?: string },
        ) => {
            const atual = objetos.get(chave);
            if (op.ifMatch !== undefined) {
                if (!atual || atual.etag !== op.ifMatch)
                    throw new BlobError("precondition failed");
            } else if (atual && !op.allowOverwrite) {
                throw new BlobError("already exists");
            }
            objetos.set(chave, { corpo, etag: `e${++versao}` });
            return { pathname: chave };
        },
    );
    const get = vi.fn(async (chave: string) => {
        const o = objetos.get(chave);
        if (!o) return null;
        return {
            statusCode: 200,
            stream: new Response(o.corpo).body,
            blob: { etag: o.etag },
        };
    });
    const del = vi.fn(async (chave: string) => {
        objetos.delete(chave);
    });
    return { BlobError, objetos, put, get, del };
});
vi.mock("@vercel/blob", () => ({
    BlobError: blob.BlobError,
    put: blob.put,
    get: blob.get,
    del: blob.del,
}));

const { CHAVES, criarStoreBlob, criarStoreMemoria, definirStore } =
    await import("./_devhub-store");
const { sincronizar, validarSnapshot, coletarDoGitHub, VALIDADE_TRAVA_MS } =
    await import("./_devhub-sync");
const { homepageValida, normalizarTopicos } = await import("./_github-repos");
const {
    default: devhub,
    _reiniciarLimite,
    _esquecerMemoria,
    CACHE_DEVHUB,
} = await import("./devhub");
const { default: devhubSync, autorizado } = await import("./devhub-sync");

import type { Coleta, Snapshot } from "./_devhub-sync";
import type { Repository } from "./_github-repos";

/* ─────────────────────────────────────────────────────────
   Fixtures
───────────────────────────────────────────────────────── */

function repo(name: string, extra: Partial<Repository> = {}): Repository {
    return {
        id: `R_${name}`,
        name,
        fullName: `https-shini/${name}`,
        description: `projeto ${name}`,
        url: `https://github.com/https-shini/${name}`,
        homepageUrl: null,
        stargazerCount: 0,
        forkCount: 0,
        isArchived: false,
        isFork: false,
        pushedAt: "2026-11-01T00:00:00Z",
        updatedAt: "2026-11-01T00:00:00Z",
        createdAt: "2026-01-01T00:00:00Z",
        topics: [],
        primaryLanguage: null,
        languages: [],
        defaultBranch: "main",
        openGraphImageUrl: null,
        licenseName: null,
        watcherCount: null,
        hasReadme: true,
        hasDocs: false,
        hasPages: false,
        diskUsageKb: null,
        cover: null,
        ...extra,
    };
}

function coleta(
    nomes: string[],
    quando = "2026-11-16T15:00:00.000Z",
    fixados: string[] = nomes.slice(0, 2),
): Coleta {
    const repos = nomes.map((n) => repo(n));
    return {
        snapshot: {
            version: 1,
            lastSyncedAt: quando,
            pinned: {
                repositories: repos.filter((r) => fixados.includes(r.name)),
                source: "pinned",
            },
            index: { repositories: repos, followers: 7 },
            profile: null,
        },
        detalhes: nomes.map((n) => ({
            name: n,
            syncedAt: quando,
            readmeHtml: `<p>${n}</p>`,
            stats: null,
        })),
        erros: [],
    };
}

/** Chama um handler com o par (req, res) que a Vercel entrega. */
async function chamar(
    h: (req: never, res: never) => Promise<void>,
    req: Record<string, unknown>,
) {
    const headers: Record<string, string> = {};
    let codigo = 0;
    let corpo: unknown;
    const res = {
        setHeader: (k: string, v: string) => {
            headers[k.toLowerCase()] = v;
        },
        status(c: number) {
            codigo = c;
            return this;
        },
        json: (b: unknown) => {
            corpo = b;
        },
    };
    await h(
        { method: "GET", query: {}, headers: {}, ...req } as never,
        res as never,
    );
    return { headers, codigo, corpo };
}

const relogio = (iso: string) => () => new Date(iso);

let erros: string[];

beforeEach(() => {
    _reiniciarLimite();
    _esquecerMemoria();
    blob.objetos.clear();
    blob.put.mockClear();
    blob.get.mockClear();
    blob.del.mockClear();
    erros = [];
    vi.spyOn(console, "error").mockImplementation((...a: unknown[]) => {
        erros.push(a.map(String).join(" "));
    });
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    definirStore(null);
    delete process.env.CRON_SECRET;
    delete process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.GITHUB_TOKEN;
});

/* ═════════════════════════════════════════════════════════
   1. Sincronização
   ═════════════════════════════════════════════════════════ */

describe("sincronização", () => {
    it("grava índice, detalhes e status com lastSyncedAt", async () => {
        const store = criarStoreMemoria();
        const r = await sincronizar({
            store,
            coletar: async () => coleta(["a", "b", "c"]),
            agora: relogio("2026-11-16T15:00:00Z"),
        });

        expect(r.resultado).toBe("ok");
        const s = await store.ler<Snapshot>(CHAVES.snapshot);
        expect(s?.index.repositories.map((x) => x.name)).toEqual([
            "a",
            "b",
            "c",
        ]);
        expect(s?.lastSyncedAt).toBe("2026-11-16T15:00:00.000Z");
        expect(await store.ler(CHAVES.detalhe("b"))).toMatchObject({
            readmeHtml: "<p>b</p>",
        });
        expect(await store.ler(CHAVES.status)).toMatchObject({
            ok: true,
            lastSyncedAt: "2026-11-16T15:00:00.000Z",
            repositories: 3,
            errors: [],
        });
        /* A trava foi liberada. */
        expect(store.dados.has(CHAVES.trava)).toBe(false);
    });

    it("grava o índice por último — é ele que publica a versão", async () => {
        const store = criarStoreMemoria();
        const ordem: string[] = [];
        const gravar = store.gravar.bind(store);
        store.gravar = async (k, v) => {
            ordem.push(k);
            return gravar(k, v);
        };
        await sincronizar({ store, coletar: async () => coleta(["a", "b"]) });

        const iSnap = ordem.indexOf(CHAVES.snapshot);
        expect(iSnap).toBeGreaterThan(ordem.indexOf(CHAVES.detalhe("a")));
        expect(iSnap).toBeGreaterThan(ordem.indexOf(CHAVES.detalhe("b")));
        expect(ordem.at(-1)).toBe(CHAVES.status);
    });

    it("erro num detalhe fica registrado sem derrubar a sincronização", async () => {
        const store = criarStoreMemoria();
        const c = coleta(["a", "b"]);
        c.erros.push({
            escopo: "detail:b",
            mensagem: "o GitHub não respondeu",
        });
        c.detalhes = c.detalhes.filter((d) => d.name !== "b");

        const r = await sincronizar({ store, coletar: async () => c });

        expect(r.resultado).toBe("ok");
        expect(await store.ler(CHAVES.status)).toMatchObject({
            ok: true,
            errors: [{ escopo: "detail:b" }],
        });
    });
});

/* ═════════════════════════════════════════════════════════
   2. Falha da API do GitHub — os últimos dados válidos ficam
   ═════════════════════════════════════════════════════════ */

describe("falha da API", () => {
    it("mantém o snapshot anterior e registra o erro", async () => {
        const store = criarStoreMemoria();
        await sincronizar({
            store,
            coletar: async () => coleta(["a", "b"], "2026-11-16T14:00:00.000Z"),
        });
        const antes = store.dados.get(CHAVES.snapshot);

        const r = await sincronizar({
            store,
            coletar: async () => {
                throw new Error("o GitHub não respondeu");
            },
            agora: relogio("2026-11-16T15:00:00Z"),
        });

        expect(r.resultado).toBe("falhou");
        /* Byte a byte o mesmo: nada foi sobrescrito. */
        expect(store.dados.get(CHAVES.snapshot)).toBe(antes);
        expect(await store.ler(CHAVES.status)).toMatchObject({
            ok: false,
            lastSyncedAt: "2026-11-16T14:00:00.000Z",
            lastAttemptAt: "2026-11-16T15:00:00.000Z",
            errors: [{ escopo: "sync", mensagem: "o GitHub não respondeu" }],
        });
        expect(store.dados.has(CHAVES.trava)).toBe(false);
    });

    it("GitHub fora do ar na coleta real não grava nada além do status", async () => {
        process.env.GITHUB_TOKEN = "x";
        vi.stubGlobal(
            "fetch",
            vi.fn(() => Promise.reject(new Error("ECONNREFUSED 140.82.121.6"))),
        );
        const store = criarStoreMemoria();
        const r = await sincronizar({ store });

        expect(r.resultado).toBe("falhou");
        expect(store.dados.has(CHAVES.snapshot)).toBe(false);
        /* O status guarda a mensagem pública, não o detalhe da rede. */
        const status = store.dados.get(CHAVES.status) ?? "";
        expect(status).not.toContain("140.82");
    });

    it("o site continua servindo os dados anteriores depois da falha", async () => {
        const store = criarStoreMemoria();
        definirStore(store);
        await sincronizar({ store, coletar: async () => coleta(["a", "b"]) });
        await sincronizar({
            store,
            coletar: async () => {
                throw new Error("rate limit");
            },
        });

        const { codigo, corpo } = await chamar(devhub, {
            query: { op: "index" },
        });
        expect(codigo).toBe(200);
        expect((corpo as Snapshot["index"]).repositories).toHaveLength(2);
    });

    it.each<[string, (c: Coleta) => void]>([
        ["acervo vazio", (c) => (c.snapshot.index.repositories = [])],
        [
            "URL fora do GitHub do dono",
            (c) =>
                (c.snapshot.index.repositories[0].url =
                    "https://evil.example/x"),
        ],
        [
            "repositório duplicado",
            (c) =>
                c.snapshot.index.repositories.push(
                    c.snapshot.index.repositories[0],
                ),
        ],
        [
            "mais de 6 fixados",
            (c) =>
                (c.snapshot.pinned.repositories = Array.from(
                    { length: 7 },
                    (_, i) => repo(`p${i}`),
                )),
        ],
    ])("recusa coleta inválida (%s) sem gravar", async (_, estragar) => {
        const store = criarStoreMemoria();
        const c = coleta(["a", "b", "c"]);
        estragar(c);
        const r = await sincronizar({ store, coletar: async () => c });

        expect(r.resultado).toBe("falhou");
        expect(store.dados.has(CHAVES.snapshot)).toBe(false);
        expect(store.dados.has(CHAVES.detalhe("a"))).toBe(false);
    });

    it("recusa um acervo que encolheu demais (paginação interrompida)", async () => {
        const nomes = Array.from({ length: 10 }, (_, i) => `r${i}`);
        const anterior = coleta(nomes).snapshot;
        expect(
            validarSnapshot(coleta(["r0", "r1"]).snapshot, anterior),
        ).toMatch(/encolheu/);
        expect(
            validarSnapshot(coleta(nomes.slice(0, 8)).snapshot, anterior),
        ).toBeNull();
    });
});

/* ═════════════════════════════════════════════════════════
   3. Trava contra sincronizações simultâneas
   ═════════════════════════════════════════════════════════ */

describe("trava", () => {
    it("uma segunda sincronização simultânea não roda", async () => {
        const store = criarStoreMemoria();
        let liberar!: () => void;
        const segura = new Promise<void>((r) => (liberar = r));
        const coletar = vi.fn(async () => {
            await segura;
            return coleta(["a"]);
        });

        const primeira = sincronizar({ store, coletar });
        await Promise.resolve();
        const segunda = await sincronizar({ store, coletar });
        liberar();

        expect(segunda.resultado).toBe("ocupado");
        expect((await primeira).resultado).toBe("ok");
        expect(coletar).toHaveBeenCalledTimes(1);
    });

    it("trava abandonada expira e é assumida", async () => {
        const store = criarStoreMemoria();
        await store.travar(
            CHAVES.trava,
            VALIDADE_TRAVA_MS,
            new Date("2026-11-16T10:00:00Z"),
        );

        const r = await sincronizar({
            store,
            coletar: async () => coleta(["a"]),
            agora: relogio("2026-11-16T11:00:00Z"),
        });
        expect(r.resultado).toBe("ok");
    });
});

/* ═════════════════════════════════════════════════════════
   4. Persistência do cache
   ═════════════════════════════════════════════════════════ */

describe("persistência", () => {
    it("o que uma instância gravou, outra lê — sem ir ao GitHub", async () => {
        process.env.BLOB_READ_WRITE_TOKEN = "teste";
        /* Instância A sincroniza no Blob. */
        await sincronizar({
            store: criarStoreBlob(),
            coletar: async () => coleta(["a", "b"]),
        });
        /* Instância B: store novo, mesma origem persistente. */
        definirStore(criarStoreBlob());
        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        const { codigo, corpo, headers } = await chamar(devhub, {
            query: { op: "catalog" },
        });
        expect(codigo).toBe(200);
        expect(corpo).toMatchObject({
            lastSyncedAt: "2026-11-16T15:00:00.000Z",
            index: { followers: 7 },
            pinned: { source: "pinned" },
        });
        expect(headers["cache-control"]).toBe(CACHE_DEVHUB);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("grava JSON por inteiro num único put (atômico)", async () => {
        process.env.BLOB_READ_WRITE_TOKEN = "teste";
        await sincronizar({
            store: criarStoreBlob(),
            coletar: async () => coleta(["a"]),
        });
        const chamadas = blob.put.mock.calls.filter(
            ([k]) => k === CHAVES.snapshot,
        );
        expect(chamadas).toHaveLength(1);
        expect(JSON.parse(String(chamadas[0][1]))).toMatchObject({
            version: 1,
        });
        expect(chamadas[0][2]).toMatchObject({
            access: "private",
            allowOverwrite: true,
        });
    });

    it("Blob: trava recente recusa; trava vencida é assumida com ifMatch", async () => {
        const store = criarStoreBlob();
        const t0 = new Date("2026-11-16T10:00:00Z");
        expect(await store.travar("devhub/lock.json", 60_000, t0)).toBe(true);
        expect(
            await store.travar(
                "devhub/lock.json",
                60_000,
                new Date("2026-11-16T10:00:30Z"),
            ),
        ).toBe(false);
        expect(
            await store.travar(
                "devhub/lock.json",
                60_000,
                new Date("2026-11-16T10:05:00Z"),
            ),
        ).toBe(true);
        expect(blob.put.mock.calls.at(-1)?.[2]).toHaveProperty("ifMatch");
    });
});

/* ═════════════════════════════════════════════════════════
   5. /api/devhub lê só do store
   ═════════════════════════════════════════════════════════ */

describe("/api/devhub", () => {
    beforeEach(async () => {
        const store = criarStoreMemoria();
        definirStore(store);
        await sincronizar({
            store,
            coletar: async () => coleta(["AuthService", "web-chat", "outro"]),
        });
        vi.stubGlobal("fetch", vi.fn());
    });

    it("antes da primeira sincronização responde 503, sem consultar o GitHub", async () => {
        definirStore(criarStoreMemoria());
        _esquecerMemoria();
        const { codigo, corpo, headers } = await chamar(devhub, {
            query: { op: "index" },
        });
        expect(codigo).toBe(503);
        expect(corpo).toMatchObject({
            error: { code: "sincronizacao_pendente" },
        });
        expect(headers["cache-control"]).toBe("no-store");
        expect(fetch).not.toHaveBeenCalled();
    });

    it("op=detail junta repositório, README e estatísticas do store", async () => {
        const { codigo, corpo } = await chamar(devhub, {
            query: { op: "detail", name: "web-chat" },
        });
        expect(codigo).toBe(200);
        expect(corpo).toMatchObject({
            name: "web-chat",
            url: "https://github.com/https-shini/web-chat",
            readmeHtml: "<p>web-chat</p>",
            stats: null,
        });
        expect(fetch).not.toHaveBeenCalled();
    });

    it("acha o projeto sem diferenciar caixa, como o GitHub", async () => {
        const { corpo } = await chamar(devhub, {
            query: { op: "project", name: "authservice" },
        });
        expect(corpo).toMatchObject({ name: "AuthService" });
    });

    it("projeto fora do acervo é null (inexistente e privado iguais)", async () => {
        const { codigo, corpo } = await chamar(devhub, {
            query: { op: "detail", name: "privado" },
        });
        expect(codigo).toBe(200);
        expect(corpo).toBeNull();
    });

    it("op=readme e op=stats leem o detalhe gravado", async () => {
        const readme = await chamar(devhub, {
            query: { op: "readme", name: "outro" },
        });
        expect(readme.corpo).toEqual({ html: "<p>outro</p>" });
        const stats = await chamar(devhub, {
            query: { op: "stats", name: "outro" },
        });
        expect(stats.corpo).toBeNull();
    });
});

/* ═════════════════════════════════════════════════════════
   6. /api/devhub-sync — agendado e manual, com CRON_SECRET
   ═════════════════════════════════════════════════════════ */

describe("/api/devhub-sync", () => {
    const segredo = "segredo-de-teste-123";

    it("sem CRON_SECRET configurado, recusa rodar", async () => {
        const { codigo } = await chamar(devhubSync, {
            headers: { authorization: "Bearer qualquer" },
        });
        expect(codigo).toBe(503);
    });

    it.each([
        ["sem cabeçalho", undefined],
        ["segredo errado", "Bearer outro"],
        ["sem o prefixo Bearer", segredo],
    ])("recusa %s com 401", async (_, authorization) => {
        process.env.CRON_SECRET = segredo;
        const { codigo, corpo } = await chamar(devhubSync, {
            headers: { authorization },
        });
        expect(codigo).toBe(401);
        expect(JSON.stringify(corpo)).not.toContain(segredo);
    });

    it("sem store persistente configurado, não finge que sincronizou", async () => {
        process.env.CRON_SECRET = segredo;
        const { codigo, corpo } = await chamar(devhubSync, {
            headers: { authorization: `Bearer ${segredo}` },
        });
        expect(codigo).toBe(503);
        expect(corpo).toMatchObject({
            error: { code: "store_nao_configurado" },
        });
    });

    it("com o segredo certo, sincroniza (falha do GitHub vira 502 com status)", async () => {
        process.env.CRON_SECRET = segredo;
        process.env.BLOB_READ_WRITE_TOKEN = "teste";
        definirStore(criarStoreMemoria());
        vi.stubGlobal(
            "fetch",
            vi.fn(() => Promise.reject(new Error("offline"))),
        );
        const { codigo, corpo, headers } = await chamar(devhubSync, {
            method: "POST",
            headers: { authorization: `Bearer ${segredo}` },
        });
        expect(codigo).toBe(502);
        expect(corpo).toMatchObject({
            result: "failed",
            status: { ok: false, lastSyncedAt: null },
        });
        expect(headers["cache-control"]).toBe("no-store");
    });

    it("sincronização em andamento responde 409", async () => {
        process.env.CRON_SECRET = segredo;
        process.env.BLOB_READ_WRITE_TOKEN = "teste";
        const store = criarStoreMemoria();
        definirStore(store);
        await store.travar(CHAVES.trava, VALIDADE_TRAVA_MS);
        const { codigo } = await chamar(devhubSync, {
            headers: { authorization: `Bearer ${segredo}` },
        });
        expect(codigo).toBe(409);
    });

    it("compara o segredo em tempo constante e exige o formato exato", () => {
        expect(autorizado(`Bearer ${segredo}`, segredo)).toBe(true);
        expect(autorizado(`Bearer ${segredo}x`, segredo)).toBe(false);
        expect(autorizado(`Bearer ${segredo}`, "")).toBe(false);
        expect(autorizado(["Bearer x"], segredo)).toBe(false);
    });
});

/* ═════════════════════════════════════════════════════════
   7. Coleta real (GitHub simulado) — fixados e metadados
   ═════════════════════════════════════════════════════════ */

describe("coleta no GitHub", () => {
    const no = (name: string, extra: Record<string, unknown> = {}) => ({
        id: `R_${name}`,
        name,
        nameWithOwner: `https-shini/${name}`,
        description: `d ${name}`,
        url: `https://github.com/https-shini/${name}`,
        homepageUrl: "",
        updatedAt: "2026-11-01T00:00:00Z",
        repositoryTopics: { nodes: [] },
        languages: { edges: [] },
        ...extra,
    });

    it("usa os fixados do GraphQL e só o homepageUrl válido", async () => {
        process.env.GITHUB_TOKEN = "x";
        vi.stubGlobal(
            "fetch",
            vi.fn(async (_url: string, init?: RequestInit) => {
                const corpo = JSON.parse(String(init?.body ?? "{}"));
                const q = String(corpo.query ?? "");
                const data = q.includes("pinnedItems")
                    ? {
                          user: {
                              pinnedItems: {
                                  nodes: [
                                      no("web-chat", {
                                          homepageUrl:
                                              "https://webchat.gcruz.dev.br/",
                                          repositoryTopics: {
                                              nodes: [
                                                  { topic: { name: "React" } },
                                                  { topic: { name: "react" } },
                                              ],
                                          },
                                      }),
                                      no("lixo", { homepageUrl: "em breve" }),
                                  ],
                              },
                          },
                      }
                    : q.includes("repositories(")
                      ? {
                            user: {
                                followers: { totalCount: 5 },
                                repositories: {
                                    pageInfo: { hasNextPage: false },
                                    nodes: [
                                        no("web-chat"),
                                        no("lixo"),
                                        no("x"),
                                    ],
                                },
                            },
                        }
                      : { repository: null };
                return new Response(JSON.stringify({ data }), {
                    status: 200,
                    headers: { "content-type": "application/json" },
                });
            }),
        );

        const c = await coletarDoGitHub(new Date("2026-11-16T15:00:00Z"));

        expect(c.snapshot.pinned.source).toBe("pinned");
        const [wc, lixo] = c.snapshot.pinned.repositories;
        expect(wc.name).toBe("web-chat");
        expect(wc.url).toBe("https://github.com/https-shini/web-chat");
        expect(wc.homepageUrl).toBe("https://webchat.gcruz.dev.br");
        expect(wc.topics).toEqual(["react"]);
        expect(lixo.homepageUrl).toBeNull();
        expect(c.snapshot.index.repositories).toHaveLength(3);
        expect(validarSnapshot(c.snapshot)).toBeNull();
    });
});

describe("normalização de metadados", () => {
    it.each([
        ["https://webchat.gcruz.dev.br/", "https://webchat.gcruz.dev.br"],
        ["  https://a.dev/docs  ", "https://a.dev/docs"],
        ["http://a.dev", "http://a.dev"],
        ["", null],
        [null, null],
        ["em breve", null],
        ["javascript:alert(1)", null],
        ["ftp://a.dev", null],
        ["https://localhost", null],
    ])("homepageValida(%j) → %j", (entrada, saida) => {
        expect(homepageValida(entrada as string | null)).toBe(saida);
    });

    it("tópicos em minúsculas, sem repetição e na ordem do dono", () => {
        expect(
            normalizarTopicos(["React", "react", " Vite ", "", 3, "ci cd"]),
        ).toEqual(["react", "vite", "ci-cd"]);
    });
});
