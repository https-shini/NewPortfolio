import type { Repository } from "@/features/devhub/types";

/* Repositório de teste com tudo preenchido; cada caso sobrescreve o que
   importa para ele. Datas fixas para os testes não dependerem do relógio,
   a não ser quando passam `pushedAt` relativo de propósito. */
export function repo(over: Partial<Repository> = {}): Repository {
    const name = over.name ?? "repo";
    return {
        id: `R_${name}`,
        name,
        fullName: `https-shini/${name}`,
        description: `Descrição de ${name}`,
        url: `https://github.com/https-shini/${name}`,
        homepageUrl: null,
        stargazerCount: 0,
        forkCount: 0,
        isArchived: false,
        isFork: false,
        pushedAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
        createdAt: "2025-01-01T00:00:00Z",
        topics: [],
        primaryLanguage: { name: "TypeScript", color: "#3178c6" },
        languages: [{ name: "TypeScript", color: "#3178c6", size: 100 }],
        defaultBranch: "main",
        openGraphImageUrl: null,
        licenseName: "MIT License",
        watcherCount: 1,
        hasReadme: true,
        hasDocs: false,
        hasPages: false,
        diskUsageKb: 100,
        cover: null,
        ...over,
    };
}

/** `fetch` falso que responde por `op`. */
/**
 * `catalog` e `detail` são compostos a partir das operações antigas
 * (`index` + `pinned`; `project` + `readme` + `stats`) quando o teste
 * não os define — assim cada teste descreve só os dados que importam.
 */
function composto(
    op: string,
    respostas: Record<string, unknown>,
): { tem: boolean; valor?: unknown } {
    if (op in respostas) return { tem: true, valor: respostas[op] };
    if (op === "catalog") {
        if (!("index" in respostas) && !("pinned" in respostas)) {
            return { tem: false };
        }
        const pinned = (respostas.pinned as
            { repositories: unknown[] } | undefined) ?? {
            repositories: [],
            source: "recent",
            fetchedAt: "x",
        };
        const index = respostas.index ?? {
            repositories: pinned.repositories,
            followers: null,
            fetchedAt: "x",
        };
        return { tem: true, valor: { pinned, index } };
    }
    if (op === "detail") {
        if (!("project" in respostas)) return { tem: false };
        const projeto = respostas.project as Record<string, unknown> | null;
        if (projeto === null) return { tem: true, valor: null };
        const readme = respostas.readme as { html?: string | null } | undefined;
        return {
            tem: true,
            valor: {
                ...projeto,
                readmeHtml: readme?.html ?? null,
                stats: respostas.stats ?? null,
            },
        };
    }
    return { tem: false };
}

export function fetchPorOp(respostas: Record<string, unknown>) {
    return (url: string) => {
        const op = new URL(url, "http://x").searchParams.get("op") ?? "";
        const r = composto(op, respostas);
        if (!r.tem) {
            return Promise.resolve({
                ok: false,
                status: 502,
                json: () => Promise.resolve({}),
            } as Response);
        }
        return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(r.valor),
        } as Response);
    };
}
