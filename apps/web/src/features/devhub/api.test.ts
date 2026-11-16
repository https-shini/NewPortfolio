import { describe, it, expect, vi, afterEach } from "vitest";
import {
    DevhubError,
    fetchIndex,
    fetchPinned,
    fetchProject,
    fetchStats,
} from "./api";
import { fetchPorOp, repo } from "@/test/repoFixture";

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("cliente /api/devhub", () => {
    it("fetchIndex lê o op=catalog e grava no cache da sessão", async () => {
        const indice = { repositories: [repo()], followers: 3, fetchedAt: "x" };
        const fetchMock = vi.fn(fetchPorOp({ index: indice }));
        vi.stubGlobal("fetch", fetchMock);

        expect(await fetchIndex()).toEqual(indice);
        expect(await fetchIndex()).toEqual(indice);
        /* A segunda veio do sessionStorage. */
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
            "/api/devhub?op=catalog",
        );
    });

    it("home e catálogo compartilham UMA ida ao servidor", async () => {
        const fixados = {
            repositories: [repo({ name: "f" })],
            source: "pinned",
            fetchedAt: "x",
        };
        const indice = {
            repositories: [repo({ name: "f" }), repo({ name: "g" })],
            followers: null,
            fetchedAt: "x",
        };
        const fetchMock = vi.fn(fetchPorOp({ index: indice, pinned: fixados }));
        vi.stubGlobal("fetch", fetchMock);

        /* Em paralelo, como a /projetos pede os dois ao montar. */
        const [p, i] = await Promise.all([fetchPinned(), fetchIndex()]);
        expect(p.repositories.map((r) => r.name)).toEqual(["f"]);
        expect(i.repositories).toHaveLength(2);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("recusa resposta fora do contrato em vez de seguir com ela", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(fetchPorOp({ index: { repositories: [{ nome: "x" }] } })),
        );
        await expect(fetchIndex()).rejects.toBeInstanceOf(DevhubError);
    });

    it("não vai à API pública do GitHub quando a função falha", async () => {
        const fetchMock = vi.fn(fetchPorOp({}));
        vi.stubGlobal("fetch", fetchMock);

        await expect(fetchPinned()).rejects.toBeInstanceOf(DevhubError);
        for (const [url] of fetchMock.mock.calls) {
            expect(String(url)).not.toContain("api.github.com");
        }
    });

    it("fetchPinned exige source válido", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(
                fetchPorOp({
                    pinned: { repositories: [repo()], source: "outro" },
                }),
            ),
        );
        await expect(fetchPinned()).rejects.toBeInstanceOf(DevhubError);
    });

    it("fetchProject junta projeto e README", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(
                fetchPorOp({
                    project: repo({ name: "a" }),
                    readme: { html: "<p>oi</p>" },
                }),
            ),
        );
        const p = await fetchProject("a");
        expect(p?.name).toBe("a");
        expect(p?.readmeHtml).toBe("<p>oi</p>");
    });

    it("README que falha vira null sem derrubar o detalhe", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(fetchPorOp({ project: repo({ name: "a" }) })),
        );
        const p = await fetchProject("a");
        expect(p?.readmeHtml).toBeNull();
    });

    it("projeto inexistente devolve null", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(fetchPorOp({ project: null, readme: { html: null } })),
        );
        expect(await fetchProject("nao-existe")).toBeNull();
    });

    it("codifica o nome na URL", async () => {
        const fetchMock = vi.fn(
            fetchPorOp({ project: null, readme: { html: null } }),
        );
        vi.stubGlobal("fetch", fetchMock);
        await fetchProject("a.b_c");
        expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
            "/api/devhub?op=detail&name=a.b_c",
        );
    });

    it("projeto e estatísticas saem do mesmo op=detail", async () => {
        const stats = {
            openIssues: 1,
            totalIssues: 2,
            openPullRequests: 0,
            totalPullRequests: 3,
            branches: 2,
            tags: 1,
            releases: { total: 0, latest: [] },
            commits: null,
            tree: null,
            contributors: null,
            deployments: { total: 1, latest: [] },
        };
        const fetchMock = vi.fn(
            fetchPorOp({ project: repo({ name: "s" }), stats }),
        );
        vi.stubGlobal("fetch", fetchMock);

        const [p, s] = await Promise.all([fetchProject("s"), fetchStats("s")]);
        expect(p?.name).toBe("s");
        expect(s?.deployments?.total).toBe(1);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
