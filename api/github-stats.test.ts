// @vitest-environment node

import { describe, it, expect, vi, afterEach } from "vitest";

const { default: handler } = await import("./github-stats");

/* O contrato com o frontend (`useGithubStats`) é `{ commits, repos }`.
   A troca para o módulo comum `_github.ts` não pode mudá-lo, nem passar
   a mandar o token para outro lugar que não o header. */

const TOKEN_FALSO = ["ghp", "tokenDeTesteQueNaoPodeVazar123456789"].join("_");

function chamar() {
    const headers: Record<string, string> = {};
    let corpo: unknown;
    const res = {
        setHeader: (k: string, v: string) => {
            headers[k.toLowerCase()] = v;
        },
        status() {
            return this;
        },
        json: (b: unknown) => {
            corpo = b;
        },
    };
    return handler({ query: {} } as never, res as never).then(() => ({
        headers,
        corpo,
    }));
}

const json = (body: unknown, ok = true) =>
    Promise.resolve({
        ok,
        status: ok ? 200 : 403,
        json: () => Promise.resolve(body),
    } as Response);

afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.GITHUB_TOKEN;
});

describe("/api/github-stats", () => {
    it("mantém o contrato { commits, repos } e o cache da CDN", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn((url: string) =>
                json(
                    url.includes("search/commits")
                        ? { total_count: 812 }
                        : { public_repos: 24 },
                ),
            ),
        );

        const { corpo, headers } = await chamar();

        expect(corpo).toEqual({ commits: 812, repos: 24 });
        expect(headers["cache-control"]).toBe(
            "s-maxage=3600, stale-while-revalidate=86400",
        );
    });

    it("leva o token só no header Authorization", async () => {
        process.env.GITHUB_TOKEN = TOKEN_FALSO;
        const fetchMock = vi.fn(() => json({}));
        vi.stubGlobal("fetch", fetchMock);

        const { corpo } = await chamar();

        for (const [url, init] of fetchMock.mock.calls as unknown as [
            string,
            RequestInit,
        ][]) {
            expect(url).not.toContain(TOKEN_FALSO);
            expect((init.headers as Record<string, string>).Authorization).toBe(
                `Bearer ${TOKEN_FALSO}`,
            );
        }
        expect(JSON.stringify(corpo)).not.toContain(TOKEN_FALSO);
    });

    it("devolve nulos quando o GitHub falha", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => Promise.reject(new Error("rede"))),
        );
        const { corpo, headers } = await chamar();
        expect(corpo).toEqual({ commits: null, repos: null });
        /* Falha não pode ficar uma hora na CDN. */
        expect(headers["cache-control"]).toBe("s-maxage=60");
    });

    it("resposta parcial (um endpoint falhou) recebe só o cache curto", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn((url: string) =>
                url.includes("/search/commits")
                    ? json({}, false)
                    : json({ public_repos: 24 }),
            ),
        );
        const { corpo, headers } = await chamar();
        expect(corpo).toEqual({ commits: null, repos: 24 });
        expect(headers["cache-control"]).toBe("s-maxage=60");
    });

    it("toda requisição ao GitHub leva um limite de tempo", async () => {
        const fetchMock = vi.fn(() => json({}));
        vi.stubGlobal("fetch", fetchMock);
        await chamar();
        for (const [, init] of fetchMock.mock.calls as unknown as [
            string,
            RequestInit,
        ][]) {
            expect(init.signal).toBeInstanceOf(AbortSignal);
        }
    });
});
