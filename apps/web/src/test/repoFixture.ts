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
        ...over,
    };
}

/** `fetch` falso que responde por `op`. */
export function fetchPorOp(respostas: Record<string, unknown>) {
    return (url: string) => {
        const op = new URL(url, "http://x").searchParams.get("op") ?? "";
        if (!(op in respostas)) {
            return Promise.resolve({
                ok: false,
                status: 502,
                json: () => Promise.resolve({}),
            } as Response);
        }
        return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(respostas[op]),
        } as Response);
    };
}
