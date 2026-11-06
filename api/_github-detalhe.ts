import {
    GITHUB_USER,
    ErroPublico,
    buscarREST,
    consultarGraphQL,
    temToken,
} from "./_github.js";

/* ─────────────────────────────────────────────────────────
   _github-detalhe.ts — estatísticas completas de UM repositório
   ─────────────────────────────────────────────────────────
   Alimenta a página /projetos/:nome com o que o card não precisa:
   issues, pull requests, branches, tags, releases, commits,
   atividade do último ano, arquivos da raiz e contribuidores.

   Uma consulta GraphQL fixa (o nome entra como variável) mais uma
   chamada REST para contribuidores — o GraphQL não expõe essa
   lista. Sem token, o GraphQL não responde: a operação devolve
   `null` e a página mostra "indisponível", nunca zero.

   Cada bloco é independente: se só os contribuidores falharem, o
   resto chega e aquele bloco vira `null`.
───────────────────────────────────────────────────────── */

export interface Commit {
    sha: string;
    message: string;
    date: string;
    url: string;
    author: string | null;
    authorLogin: string | null;
}

export interface Release {
    name: string;
    tag: string;
    publishedAt: string | null;
    url: string;
    prerelease: boolean;
}

export interface TreeEntry {
    name: string;
    type: "tree" | "blob" | "commit";
}

export interface Contributor {
    login: string;
    contributions: number;
    url: string;
    avatarUrl: string | null;
}

export interface RepositoryStats {
    openIssues: number;
    totalIssues: number;
    openPullRequests: number;
    totalPullRequests: number;
    branches: number;
    tags: number;
    releases: { total: number; latest: Release[] };
    commits: {
        /** Commits no branch padrão, desde sempre. */
        total: number;
        /** Commits no branch padrão nos últimos 365 dias. */
        lastYear: number;
        /** Datas dos commits do último ano (até 100), para o histograma. */
        lastYearDates: string[];
        recent: Commit[];
    } | null;
    /** Arquivos e pastas da raiz do branch padrão. */
    tree: TreeEntry[] | null;
    /** Contribuidores públicos; `null` se a chamada falhou. */
    contributors: { total: number; top: Contributor[] } | null;
}

const QUERY_DETALHE = `
    query($login: String!, $name: String!, $since: GitTimestamp!) {
        repository(owner: $login, name: $name) {
            isPrivate
            openIssues: issues(states: OPEN) { totalCount }
            allIssues: issues { totalCount }
            openPRs: pullRequests(states: OPEN) { totalCount }
            allPRs: pullRequests { totalCount }
            branches: refs(refPrefix: "refs/heads/") { totalCount }
            tags: refs(refPrefix: "refs/tags/") { totalCount }
            releases(first: 5, orderBy: { field: CREATED_AT, direction: DESC }) {
                totalCount
                nodes { name tagName publishedAt url isPrerelease }
            }
            tree: object(expression: "HEAD:") {
                ... on Tree { entries { name type } }
            }
            defaultBranchRef {
                target {
                    ... on Commit {
                        all: history(first: 8) {
                            totalCount
                            nodes {
                                oid
                                messageHeadline
                                committedDate
                                url
                                author { name user { login } }
                            }
                        }
                        year: history(first: 100, since: $since) {
                            totalCount
                            nodes { committedDate }
                        }
                    }
                }
            }
        }
    }
`;

interface NoCommit {
    oid?: string;
    messageHeadline?: string;
    committedDate?: string;
    url?: string;
    author?: { name?: string | null; user?: { login?: string } | null } | null;
}

interface DetalheGQL {
    repository?: {
        isPrivate?: boolean;
        openIssues?: { totalCount?: number };
        allIssues?: { totalCount?: number };
        openPRs?: { totalCount?: number };
        allPRs?: { totalCount?: number };
        branches?: { totalCount?: number } | null;
        tags?: { totalCount?: number } | null;
        releases?: {
            totalCount?: number;
            nodes?: ({
                name?: string | null;
                tagName?: string;
                publishedAt?: string | null;
                url?: string;
                isPrerelease?: boolean;
            } | null)[];
        };
        tree?: { entries?: { name?: string; type?: string }[] } | null;
        defaultBranchRef?: {
            target?: {
                all?: { totalCount?: number; nodes?: (NoCommit | null)[] };
                year?: {
                    totalCount?: number;
                    nodes?: ({ committedDate?: string } | null)[];
                };
            } | null;
        } | null;
    } | null;
}

interface ContribuidorREST {
    login?: string;
    contributions?: number;
    html_url?: string;
    avatar_url?: string;
    type?: string;
}

const n = (v: unknown): number => (typeof v === "number" ? v : 0);

function commitsDe(
    alvo: NonNullable<
        NonNullable<
            NonNullable<DetalheGQL["repository"]>["defaultBranchRef"]
        >["target"]
    >,
): RepositoryStats["commits"] {
    if (!alvo.all) return null;
    return {
        total: n(alvo.all.totalCount),
        lastYear: n(alvo.year?.totalCount),
        lastYearDates: (alvo.year?.nodes ?? [])
            .map((c) => c?.committedDate)
            .filter((d): d is string => typeof d === "string"),
        recent: (alvo.all.nodes ?? [])
            .filter((c): c is NoCommit => Boolean(c?.oid && c.url))
            .map((c) => ({
                sha: c.oid!,
                message: c.messageHeadline ?? "",
                date: c.committedDate ?? "",
                url: c.url!,
                author: c.author?.name ?? null,
                authorLogin: c.author?.user?.login ?? null,
            })),
    };
}

/** Contribuidores públicos pelo REST — bloco opcional. */
async function contribuidores(
    name: string,
): Promise<RepositoryStats["contributors"]> {
    try {
        const lista = await buscarREST<ContribuidorREST[]>(
            `/repos/${GITHUB_USER}/${name}/contributors?per_page=100`,
        );
        if (!Array.isArray(lista)) return null;
        const pessoas = lista.filter(
            (c) => typeof c.login === "string" && c.type !== "Bot",
        );
        return {
            total: pessoas.length,
            top: pessoas.slice(0, 8).map((c) => ({
                login: c.login!,
                contributions: n(c.contributions),
                url: c.html_url ?? `https://github.com/${c.login}`,
                avatarUrl:
                    typeof c.avatar_url === "string" &&
                    c.avatar_url.startsWith(
                        "https://avatars.githubusercontent.com/",
                    )
                        ? `${c.avatar_url}${c.avatar_url.includes("?") ? "&" : "?"}s=64`
                        : null,
            })),
        };
    } catch {
        return null;
    }
}

/**
 * Estatísticas de um repositório público, ou `null` quando não há como
 * obtê-las (sem token) ou o repositório não existe / é privado.
 */
export async function buscarEstatisticas(
    name: string,
    agora: Date = new Date(),
): Promise<RepositoryStats | null> {
    if (!temToken()) return null;

    const desde = new Date(agora.getTime() - 365 * 86_400_000).toISOString();
    const [data, pessoas] = await Promise.all([
        consultarGraphQL<DetalheGQL>(
            QUERY_DETALHE,
            { login: GITHUB_USER, name, since: desde },
            { aceitaNaoEncontrado: true },
        ),
        contribuidores(name),
    ]);

    const r = data.repository;
    if (!r || r.isPrivate) return null;
    if (!r.openIssues || !r.allPRs) {
        throw new ErroPublico(
            "upstream_invalido",
            "resposta do GitHub fora do formato esperado",
            "repository sem issues/pullRequests",
        );
    }

    const tipos = new Set(["tree", "blob", "commit"]);
    const alvo = r.defaultBranchRef?.target ?? null;

    return {
        openIssues: n(r.openIssues.totalCount),
        totalIssues: n(r.allIssues?.totalCount),
        openPullRequests: n(r.openPRs?.totalCount),
        totalPullRequests: n(r.allPRs.totalCount),
        branches: n(r.branches?.totalCount),
        tags: n(r.tags?.totalCount),
        releases: {
            total: n(r.releases?.totalCount),
            latest: (r.releases?.nodes ?? [])
                .filter((x) => x?.tagName && x.url)
                .map((x) => ({
                    name: x!.name || x!.tagName!,
                    tag: x!.tagName!,
                    publishedAt: x!.publishedAt ?? null,
                    url: x!.url!,
                    prerelease: Boolean(x!.isPrerelease),
                })),
        },
        commits: alvo ? commitsDe(alvo) : null,
        tree: Array.isArray(r.tree?.entries)
            ? r
                  .tree!.entries!.filter(
                      (e) =>
                          typeof e.name === "string" &&
                          tipos.has(String(e.type)),
                  )
                  .map((e) => ({
                      name: e.name!,
                      type: e.type as TreeEntry["type"],
                  }))
                  /* Pastas primeiro, depois arquivos — como o GitHub mostra. */
                  .sort(
                      (a, b) =>
                          Number(a.type !== "tree") -
                              Number(b.type !== "tree") ||
                          a.name.localeCompare(b.name),
                  )
            : null,
        contributors: pessoas,
    };
}
