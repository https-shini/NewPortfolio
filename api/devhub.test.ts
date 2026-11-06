// @vitest-environment node

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { default: handler, _reiniciarLimite } = await import("./devhub");

/* ─────────────────────────────────────────────────────────
   O que estes testes vigiam
   ─────────────────────────────────────────────────────────
   A fronteira, não a funcionalidade. O endpoint anterior foi
   substituído porque repassava ao GitHub o corpo que o cliente
   mandasse; o risco de uma reescrita futura é alguém reabrir
   essa porta sem perceber.

   Daí a ênfase: o que o cliente consegue fazer o servidor
   executar, o que vaza numa resposta de erro, e se as duas
   origens (GraphQL autenticado e REST público) chegam ao mesmo
   contrato.
───────────────────────────────────────────────────────── */

/**
 * Token de mentira, montado em tempo de execução.
 *
 * O valor precisa ter a forma de um token real — é justamente o prefixo
 * `ghp_` que as asserções abaixo procuram não encontrar nas respostas.
 * Mas escrevê-lo como literal põe no repositório uma string que o
 * secret scanning do GitHub reconhece como credencial: a varredura não
 * sabe que este token nunca existiu, e bloquearia o push.
 *
 * Juntar as duas metades resolve os dois lados — em execução o valor é
 * idêntico, e no arquivo não há nada que se pareça com um segredo.
 */
const TOKEN_FALSO = ["ghp", "tokenDeTesteQueNaoPodeVazar123456789"].join("_");

/** Espelha o par (req, res) que a Vercel entrega ao handler. */
function chamar(
    query: Record<string, string | string[] | undefined>,
    method = "GET",
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

    return handler({ method, query } as never, res as never).then(() => ({
        headers,
        codigo,
        corpo,
    }));
}

/** Resposta de rede com corpo JSON. */
const json = (body: unknown, status = 200) =>
    Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(body),
        text: () => Promise.resolve(String(body)),
    } as Response);

/** Resposta de rede com corpo de texto (o README cru). */
const texto = (body: string, status = 200) =>
    Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.reject(new Error("não é json")),
        text: () => Promise.resolve(body),
    } as Response);

const REPO_GQL = {
    id: "R_1",
    name: "AuthService",
    nameWithOwner: "https-shini/AuthService",
    description: "autenticação",
    url: "https://github.com/https-shini/AuthService",
    homepageUrl: "https://authservice.example",
    stargazerCount: 3,
    forkCount: 1,
    isArchived: false,
    isFork: false,
    pushedAt: "2026-02-18T00:00:00Z",
    updatedAt: "2026-02-18T00:00:00Z",
    createdAt: "2026-01-01T00:00:00Z",
    openGraphImageUrl: "https://opengraph.githubassets.com/x/y",
    defaultBranchRef: { name: "main" },
    licenseInfo: { name: "MIT" },
    repositoryTopics: { nodes: [{ topic: { name: "jwt" } }] },
    primaryLanguage: { name: "Python", color: "#3572A5" },
    languages: { edges: [{ size: 10, node: { name: "Python", color: null } }] },
};

const REPO_REST = {
    id: 1,
    name: "AuthService",
    full_name: "https-shini/AuthService",
    description: "autenticação",
    html_url: "https://github.com/https-shini/AuthService",
    homepage: "https://authservice.example",
    stargazers_count: 3,
    forks_count: 1,
    archived: false,
    fork: false,
    private: false,
    pushed_at: "2026-02-18T00:00:00Z",
    updated_at: "2026-02-18T00:00:00Z",
    created_at: "2026-01-01T00:00:00Z",
    default_branch: "main",
    language: "Python",
    license: { name: "MIT" },
    topics: ["jwt"],
};

let erros: string[];

beforeEach(() => {
    _reiniciarLimite();
    delete process.env.GITHUB_TOKEN;
    erros = [];
    vi.spyOn(console, "error").mockImplementation((...a: unknown[]) => {
        erros.push(a.map(String).join(" "));
    });
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete process.env.GITHUB_TOKEN;
});

/* ═════════════════════════════════════════════════════════
   1. A porta: o que o cliente NÃO consegue fazer
   ═════════════════════════════════════════════════════════ */

describe("fronteira de confiança", () => {
    it("não executa query enviada pelo cliente", async () => {
        process.env.GITHUB_TOKEN = TOKEN_FALSO;
        const fetchMock = vi.fn(() => json({ data: { user: null } }));
        vi.stubGlobal("fetch", fetchMock);

        /* A tentativa clássica contra o endpoint antigo. */
        const { codigo, corpo } = await chamar({
            op: "index",
            query: "{ viewer { login email } }",
        });

        expect(codigo).toBe(400);
        expect(corpo).toMatchObject({
            error: { code: "parametro_invalido" },
        });
        /* E, acima de tudo: nada saiu para o GitHub. */
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it.each([
        ["mutation", { op: "index", mutation: "{ deleteRepository }" }],
        ["variables", { op: "index", variables: '{"a":1}' }],
        ["endpoint", { op: "index", endpoint: "https://evil.example" }],
        ["fields", { op: "index", fields: "id,name" }],
        ["owner", { op: "project", name: "x", owner: "outra-pessoa" }],
    ])("recusa o parâmetro extra %s sem chamar o GitHub", async (_, q) => {
        const fetchMock = vi.fn(() => json({}));
        vi.stubGlobal("fetch", fetchMock);

        const { codigo } = await chamar(q);

        expect(codigo).toBe(400);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("aceita somente as operações da lista fechada", async () => {
        const fetchMock = vi.fn(() => json({}));
        vi.stubGlobal("fetch", fetchMock);

        for (const op of [
            "graphql",
            "raw",
            "proxy",
            "INDEX",
            "",
            "__proto__",
        ]) {
            const { codigo, corpo } = await chamar({ op });
            expect(codigo).toBe(400);
            expect(corpo).toMatchObject({
                error: { code: "operacao_invalida" },
            });
        }
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("recusa operação repetida em vez de escolher uma", async () => {
        const fetchMock = vi.fn(() => json({}));
        vi.stubGlobal("fetch", fetchMock);

        const { codigo } = await chamar({ op: ["index", "project"] });

        expect(codigo).toBe(400);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("recusa verbo de escrita", async () => {
        const fetchMock = vi.fn(() => json({}));
        vi.stubGlobal("fetch", fetchMock);

        const { codigo, headers } = await chamar({ op: "index" }, "POST");

        expect(codigo).toBe(405);
        expect(headers.allow).toBe("GET, HEAD");
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("não reflete de volta o que o cliente mandou", async () => {
        /* Devolver a entrada na mensagem faria a resposta carregar texto
           escolhido por quem chamou. */
        const { corpo } = await chamar({ op: "<script>alert(1)</script>" });
        expect(JSON.stringify(corpo)).not.toContain("script");
    });
});

/* ═════════════════════════════════════════════════════════
   2. Validação do parâmetro `name`
   ═════════════════════════════════════════════════════════ */

describe("validação de `name`", () => {
    it.each([
        ["ausente", undefined],
        ["vazio", ""],
        ["travessia de caminho", "../../etc/passwd"],
        ["barra", "dono/repo"],
        ["espaço", "meu repo"],
        ["caractere de consulta", "repo?x=1"],
        ["nova linha", "repo\nX-Injected: 1"],
        ["longo demais", "a".repeat(101)],
        ["repetido", ["a", "b"] as string[]],
    ])("recusa nome %s antes de qualquer ida à rede", async (_, name) => {
        const fetchMock = vi.fn(() => json({}));
        vi.stubGlobal("fetch", fetchMock);

        const { codigo, corpo } = await chamar({ op: "project", name });

        expect(codigo).toBe(400);
        expect(corpo).toMatchObject({ error: { code: "parametro_invalido" } });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("recusa `name` na operação que não o usa", async () => {
        const fetchMock = vi.fn(() => json({}));
        vi.stubGlobal("fetch", fetchMock);

        const { codigo } = await chamar({ op: "index", name: "AuthService" });

        expect(codigo).toBe(400);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("aceita os nomes que o GitHub de fato permite", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => json(REPO_REST)),
        );

        for (const name of ["AuthService", "web-chat", "a.b_c-1", "x"]) {
            const { codigo } = await chamar({ op: "project", name });
            expect(codigo).toBe(200);
        }
    });
});

/* ═════════════════════════════════════════════════════════
   3. O token
   ═════════════════════════════════════════════════════════ */

describe("token", () => {
    it("nunca aparece na resposta, nem no caminho de erro", async () => {
        process.env.GITHUB_TOKEN = TOKEN_FALSO;
        vi.stubGlobal(
            "fetch",
            vi.fn(() =>
                json({
                    errors: [{ message: `token ${TOKEN_FALSO} sem escopo` }],
                }),
            ),
        );

        const { codigo, corpo } = await chamar({ op: "index" });

        expect(codigo).toBe(502);
        expect(JSON.stringify(corpo)).not.toContain(TOKEN_FALSO);
        expect(JSON.stringify(corpo)).not.toContain("ghp_");
    });

    it("vai no header Authorization, e só lá", async () => {
        process.env.GITHUB_TOKEN = TOKEN_FALSO;
        const fetchMock = vi.fn(() =>
            json({ data: { user: { repositories: { nodes: [REPO_GQL] } } } }),
        );
        vi.stubGlobal("fetch", fetchMock);

        await chamar({ op: "index" });

        const [url, init] = fetchMock.mock.calls[0] as unknown as [
            string,
            RequestInit,
        ];
        const headers = init.headers as Record<string, string>;
        expect(headers.Authorization).toBe(`Bearer ${TOKEN_FALSO}`);
        /* E não vazou para a URL, onde acabaria em log de proxy. */
        expect(url).not.toContain(TOKEN_FALSO);
        expect(String(init.body)).not.toContain(TOKEN_FALSO);
    });

    it("sem token, usa o caminho público e não manda Authorization", async () => {
        const fetchMock = vi.fn(() => json([REPO_REST]));
        vi.stubGlobal("fetch", fetchMock);

        const { codigo } = await chamar({ op: "index" });

        expect(codigo).toBe(200);
        const [url, init] = fetchMock.mock.calls[0] as unknown as [
            string,
            RequestInit,
        ];
        expect(url).toContain("/users/https-shini/repos");
        expect(
            (init.headers as Record<string, string>).Authorization,
        ).toBeUndefined();
    });
});

/* ═════════════════════════════════════════════════════════
   4. GraphQL e REST chegam ao mesmo contrato
   ═════════════════════════════════════════════════════════ */

describe("normalização", () => {
    /** Os campos que o frontend consome; o resto é detalhe de origem. */
    const CHAVES = [
        "id",
        "name",
        "fullName",
        "description",
        "url",
        "homepageUrl",
        "stargazerCount",
        "forkCount",
        "isArchived",
        "isFork",
        "pushedAt",
        "updatedAt",
        "createdAt",
        "topics",
        "primaryLanguage",
        "languages",
        "defaultBranch",
        "openGraphImageUrl",
        "licenseName",
    ];

    it("as duas origens produzem o mesmo formato", async () => {
        process.env.GITHUB_TOKEN = TOKEN_FALSO;
        vi.stubGlobal(
            "fetch",
            vi.fn(() =>
                json({
                    data: { user: { repositories: { nodes: [REPO_GQL] } } },
                }),
            ),
        );
        const comToken = (await chamar({ op: "index" })).corpo as {
            repositories: Record<string, unknown>[];
        };

        delete process.env.GITHUB_TOKEN;
        vi.stubGlobal(
            "fetch",
            vi.fn(() => json([REPO_REST])),
        );
        const semToken = (await chamar({ op: "index" })).corpo as {
            repositories: Record<string, unknown>[];
        };

        expect(Object.keys(comToken.repositories[0]).sort()).toEqual(
            CHAVES.slice().sort(),
        );
        expect(Object.keys(semToken.repositories[0]).sort()).toEqual(
            CHAVES.slice().sort(),
        );

        /* E os valores que não dependem da origem coincidem. */
        for (const chave of ["name", "fullName", "url", "stargazerCount"]) {
            expect(comToken.repositories[0][chave]).toEqual(
                semToken.repositories[0][chave],
            );
        }
    });

    it("preenche a cor da linguagem quando o REST não a traz", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => json([REPO_REST])),
        );
        const { corpo } = await chamar({ op: "index" });
        const repo = (corpo as { repositories: { primaryLanguage: unknown }[] })
            .repositories[0];
        expect(repo.primaryLanguage).toEqual({
            name: "Python",
            color: "#3572A5",
        });
    });

    it("exclui repositórios privados do caminho público", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() =>
                json([
                    REPO_REST,
                    { ...REPO_REST, id: 2, name: "s", private: true },
                ]),
            ),
        );
        const { corpo } = await chamar({ op: "index" });
        expect(
            (corpo as { repositories: unknown[] }).repositories,
        ).toHaveLength(1);
    });

    it("trata repositório privado como inexistente", async () => {
        process.env.GITHUB_TOKEN = TOKEN_FALSO;
        vi.stubGlobal(
            "fetch",
            vi.fn(() =>
                json({
                    data: { repository: { ...REPO_GQL, isPrivate: true } },
                }),
            ),
        );
        const { codigo, corpo } = await chamar({
            op: "project",
            name: "privado",
        });
        expect(codigo).toBe(200);
        expect(corpo).toBeNull();
    });

    it("descarta o nó estranho sem derrubar os demais", async () => {
        process.env.GITHUB_TOKEN = TOKEN_FALSO;
        vi.stubGlobal(
            "fetch",
            vi.fn(() =>
                json({
                    data: {
                        user: {
                            repositories: {
                                nodes: [REPO_GQL, null, { name: "sem url" }],
                            },
                        },
                    },
                }),
            ),
        );
        const { codigo, corpo } = await chamar({ op: "index" });
        expect(codigo).toBe(200);
        expect(
            (corpo as { repositories: unknown[] }).repositories,
        ).toHaveLength(1);
    });
});

/* ═════════════════════════════════════════════════════════
   5. Falhas previsíveis
   ═════════════════════════════════════════════════════════ */

describe("falhas", () => {
    it("repositório inexistente devolve null, não erro", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => json({ message: "Not Found" }, 404)),
        );
        const { codigo, corpo } = await chamar({ op: "project", name: "nada" });
        expect(codigo).toBe(200);
        expect(corpo).toBeNull();
    });

    it("GitHub fora do ar vira 502 sem detalhe interno", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => Promise.reject(new Error("ECONNREFUSED 140.82.121.6"))),
        );
        const { codigo, corpo } = await chamar({ op: "index" });

        expect(codigo).toBe(502);
        expect(JSON.stringify(corpo)).not.toContain("ECONNREFUSED");
        expect(JSON.stringify(corpo)).not.toContain("140.82");
        /* O diagnóstico existe — no log do servidor, não na resposta. */
        expect(erros.join(" ")).toContain("ECONNREFUSED");
    });

    it("resposta ilegível vira 502", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.reject(new Error("JSON inválido")),
                } as Response),
            ),
        );
        const { codigo, corpo } = await chamar({ op: "index" });
        expect(codigo).toBe(502);
        expect(corpo).toMatchObject({ error: { code: "upstream_invalido" } });
    });

    it("resposta incompleta é rejeitada em vez de virar acervo vazio", async () => {
        process.env.GITHUB_TOKEN = TOKEN_FALSO;
        vi.stubGlobal(
            "fetch",
            vi.fn(() => json({ data: { user: null } })),
        );
        const { codigo, corpo } = await chamar({ op: "index" });

        /* Um acervo vazio e um erro são coisas diferentes: devolver `[]`
           aqui faria a galeria dizer "nenhum projeto" para uma falha. */
        expect(codigo).toBe(502);
        expect(corpo).toMatchObject({ error: { code: "upstream_invalido" } });
    });

    it("erro do GraphQL não atravessa para o cliente", async () => {
        process.env.GITHUB_TOKEN = TOKEN_FALSO;
        vi.stubGlobal(
            "fetch",
            vi.fn(() =>
                json({
                    errors: [
                        { message: "Field 'secretInternal' doesn't exist" },
                    ],
                }),
            ),
        );
        const { codigo, corpo } = await chamar({ op: "index" });

        expect(codigo).toBe(502);
        expect(JSON.stringify(corpo)).not.toContain("secretInternal");
        expect(erros.join(" ")).toContain("secretInternal");
    });

    it("erro REST vira 502 sem o corpo do GitHub", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() =>
                json({ message: "API rate limit exceeded for 1.2.3.4" }, 403),
            ),
        );
        const { codigo, corpo } = await chamar({ op: "index" });

        expect(codigo).toBe(502);
        expect(JSON.stringify(corpo)).not.toContain("1.2.3.4");
    });

    it("toda resposta de erro tem a mesma forma", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => Promise.reject(new Error("x"))),
        );

        for (const q of [
            { op: "inexistente" },
            { op: "project" },
            { op: "project", name: "../x" },
            { op: "index" },
        ]) {
            const { corpo } = await chamar(q);
            expect(corpo).toHaveProperty("error.code");
            expect(corpo).toHaveProperty("error.message");
            /* Nada além do par código/mensagem. */
            expect(
                Object.keys((corpo as { error: object }).error).sort(),
            ).toEqual(["code", "message"]);
        }
    });
});

/* ═════════════════════════════════════════════════════════
   6. README
   ═════════════════════════════════════════════════════════ */

describe("readme", () => {
    it("converte markdown em HTML no servidor", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => texto("# Título\n\nUm parágrafo.")),
        );
        const { codigo, corpo } = await chamar({
            op: "readme",
            name: "AuthService",
        });

        expect(codigo).toBe(200);
        const html = (corpo as { html: string }).html;
        /* `#` vira `<h2>`, não `<h1>`: o conversor rebaixa os títulos
           porque a página que recebe o HTML já tem o seu h1 — no detalhe
           do DevHub, o nome do repositório. Dois h1 no mesmo documento
           quebrariam a hierarquia que o leitor de tela usa para navegar. */
        expect(html).toContain("<h2>");
        expect(html).not.toContain("<h1>");
        expect(html).toContain("Título");
        expect(html).toContain("<p>Um parágrafo.</p>");
    });

    it("preserva o <img> legítimo e descarta o que executa", async () => {
        /* Esta asserção trocou de lado de propósito. Enquanto o README
           passava pelo conversor das notas de versão, TODO HTML virava
           texto — seguro, e inútil para um README de portfólio, que é
           metade banner e badge. Agora ele passa por
           `_devhub-markdown.ts`, que preserva uma allowlist e reescreve
           cada tag a partir dela.

           O que não mudou é o destino do que executa. A cobertura fina
           do sanitizador vive em `_devhub-markdown.test.ts`; aqui se
           confere apenas que a operação `readme` usa o conversor certo. */
        vi.stubGlobal(
            "fetch",
            vi.fn(() =>
                texto(
                    '<script>alert(1)</script>\n\n<img src="https://ok.dev/a.png" alt="ok" onerror="alert(2)">',
                ),
            ),
        );
        const { corpo } = await chamar({ op: "readme", name: "x" });
        const html = (corpo as { html: string }).html;

        expect(html).not.toContain("<script");
        expect(html).not.toContain("alert(1)");
        /* A imagem sobrevive — sem o handler. */
        expect(html).toContain('<img src="https://ok.dev/a.png"');
        expect(html).toContain('alt="ok"');
        expect(html).not.toMatch(/\sonerror=/);
    });

    it("README inexistente devolve html null, não erro", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => texto("", 404)),
        );
        const { codigo, corpo } = await chamar({ op: "readme", name: "x" });
        expect(codigo).toBe(200);
        expect(corpo).toEqual({ html: null });
    });

    it("README vazio devolve html null", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => texto("   \n  ")),
        );
        const { corpo } = await chamar({ op: "readme", name: "x" });
        expect(corpo).toEqual({ html: null });
    });

    it("README malformado não derruba a operação", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() =>
                texto("| a | b\n|---\n| 1 \n\n```sem fim\nx\n\n### \n\n[](("),
            ),
        );
        const { codigo, corpo } = await chamar({ op: "readme", name: "x" });
        expect(codigo).toBe(200);
        expect(typeof (corpo as { html: string }).html).toBe("string");
    });
});

/* ═════════════════════════════════════════════════════════
   7. Cache
   ═════════════════════════════════════════════════════════ */

describe("cache", () => {
    it("declara cache de CDN nas respostas boas", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => json([REPO_REST])),
        );
        const { headers } = await chamar({ op: "index" });
        expect(headers["cache-control"]).toContain("s-maxage");
        expect(headers["cache-control"]).toContain("stale-while-revalidate");
    });

    it("não cacheia resposta de erro", async () => {
        const { headers } = await chamar({ op: "inexistente" });
        /* Explícito, e não ausente: sem o `no-store` a CDN aplicaria a
           regra padrão e poderia guardar o 400 junto com as respostas boas. */
        expect(headers["cache-control"]).toBe("no-store");
    });
});

/* ═════════════════════════════════════════════════════════
   Paginação — o fork lia só os 100 primeiros
   ═════════════════════════════════════════════════════════ */

describe("paginação do acervo", () => {
    const repo = (n: number) => ({
        ...REPO_GQL,
        id: `R_${n}`,
        name: `repo-${n}`,
    });

    it("GraphQL: segue o cursor até `hasNextPage` acabar", async () => {
        process.env.GITHUB_TOKEN = TOKEN_FALSO;
        const pagina = (
            nodes: unknown[],
            hasNextPage: boolean,
            endCursor: string | null,
        ) =>
            json({
                data: {
                    user: {
                        repositories: {
                            pageInfo: { hasNextPage, endCursor },
                            nodes,
                        },
                    },
                },
            });
        const fetchMock = vi
            .fn()
            .mockImplementationOnce(() =>
                pagina([repo(1), repo(2)], true, "C1"),
            )
            .mockImplementationOnce(() => pagina([repo(3)], false, null));
        vi.stubGlobal("fetch", fetchMock);

        const { codigo, corpo } = await chamar({ op: "index" });

        expect(codigo).toBe(200);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        const segunda = JSON.parse(
            (fetchMock.mock.calls[1] as [string, RequestInit])[1]
                .body as string,
        ) as { variables: { after: string | null } };
        expect(segunda.variables.after).toBe("C1");
        const nomes = (
            corpo as { repositories: { name: string }[] }
        ).repositories.map((r) => r.name);
        expect(nomes).toEqual(["repo-1", "repo-2", "repo-3"]);
    });

    it("GraphQL: para no teto de páginas mesmo se o GitHub insistir", async () => {
        process.env.GITHUB_TOKEN = TOKEN_FALSO;
        const fetchMock = vi.fn(() =>
            json({
                data: {
                    user: {
                        repositories: {
                            pageInfo: {
                                hasNextPage: true,
                                endCursor: "sempre",
                            },
                            nodes: [repo(1)],
                        },
                    },
                },
            }),
        );
        vi.stubGlobal("fetch", fetchMock);

        await chamar({ op: "index" });

        expect(fetchMock).toHaveBeenCalledTimes(10);
    });

    it("REST: pede a página seguinte enquanto vierem 100 itens", async () => {
        const cheia = Array.from({ length: 100 }, (_, i) => ({
            ...REPO_REST,
            id: i,
            name: `repo-${i}`,
        }));
        const fetchMock = vi
            .fn()
            .mockImplementationOnce(() => json(cheia))
            .mockImplementationOnce(() =>
                json([{ ...REPO_REST, id: 999, name: "ultimo" }]),
            );
        vi.stubGlobal("fetch", fetchMock);

        const { corpo } = await chamar({ op: "index" });

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(String((fetchMock.mock.calls[1] as [string])[0])).toContain(
            "page=2",
        );
        expect(
            (corpo as { repositories: unknown[] }).repositories,
        ).toHaveLength(101);
    });
});

describe("guarda de abuso", () => {
    it("responde 429 com Retry-After, sem tocar no GitHub", async () => {
        const fetchMock = vi.fn(() => json([REPO_REST]));
        vi.stubGlobal("fetch", fetchMock);

        for (let i = 0; i < 60; i++) await chamar({ op: "index" });
        fetchMock.mockClear();
        const { codigo, headers } = await chamar({ op: "index" });

        expect(codigo).toBe(429);
        expect(headers["retry-after"]).toBe("60");
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
