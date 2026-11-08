import {
    GITHUB_USER,
    ErroPublico,
    buscarREST,
    consultarGraphQL,
    temToken,
} from "./_github.js";

/* ─────────────────────────────────────────────────────────
   _github-repos.ts — repositórios no contrato interno
   ─────────────────────────────────────────────────────────
   Duas origens, um contrato. Com `GITHUB_TOKEN` a consulta vai
   pelo GraphQL, que entrega tudo numa viagem por página. Sem ele,
   a mesma informação é remontada a partir do REST público
   (60 req/h). As duas passam pela normalização daqui, então quem
   consome não sabe — nem precisa saber — qual caminho atendeu.

   Migrado do fork NewDevHub (api/devhub.ts) com duas mudanças:
     · paginação — o fork lia só os 100 primeiros repositórios;
     · o transporte e o token saíram para `_github.ts`.
───────────────────────────────────────────────────────── */

export interface Language {
    name: string;
    color: string | null;
    /** Bytes de código; ausente quando a origem não mede (REST). */
    size?: number;
}

export interface Repository {
    id: string;
    name: string;
    fullName: string;
    description: string | null;
    url: string;
    homepageUrl: string | null;
    stargazerCount: number;
    forkCount: number;
    isArchived: boolean;
    isFork: boolean;
    pushedAt: string | null;
    updatedAt: string;
    createdAt: string;
    topics: string[];
    primaryLanguage: Language | null;
    languages: Language[];
    defaultBranch: string | null;
    openGraphImageUrl: string | null;
    licenseName: string | null;
}

/**
 * Teto de páginas de 100 repositórios. Não é limite de produto — é a
 * trava contra um laço infinito se o GitHub devolver `hasNextPage`
 * eternamente. Mil repositórios públicos estão muito além do acervo.
 */
export const MAX_PAGINAS = 10;
const POR_PAGINA = 100;

/* ─────────────────────────────────────────────────────────
   Cores de linguagem — o REST público não as traz
───────────────────────────────────────────────────────── */

const CORES: Record<string, string> = {
    JavaScript: "#F7DF1E",
    TypeScript: "#3178C6",
    Python: "#3572A5",
    Java: "#B07219",
    CSS: "#563D7C",
    HTML: "#E34C26",
    "C#": "#178600",
    "C++": "#F34B7D",
    C: "#555555",
    Ruby: "#701516",
    Go: "#00ADD8",
    Rust: "#DEA584",
    PHP: "#4F5D95",
    Swift: "#F05138",
    Kotlin: "#A97BFF",
    Dart: "#00B4AB",
    Shell: "#89E051",
    Vue: "#41B883",
    Svelte: "#FF3E00",
    Astro: "#FF5A03",
    SCSS: "#C6538C",
    Less: "#1D365D",
    Dockerfile: "#384D54",
};

const COR_NEUTRA = "#8B949E";

function cor(nome: string, daApi?: string | null): string {
    return daApi ?? CORES[nome] ?? COR_NEUTRA;
}

/* ─────────────────────────────────────────────────────────
   Caminho autenticado — GraphQL com consulta fixa
───────────────────────────────────────────────────────── */

/* Fragmento constante. Exportado só para os testes conferirem que a
   consulta é texto fixo, sem interpolação de entrada. */
export const CAMPOS_REPO = `
    id
    name
    nameWithOwner
    description
    url
    homepageUrl
    stargazerCount
    forkCount
    isArchived
    isFork
    pushedAt
    updatedAt
    createdAt
    openGraphImageUrl
    defaultBranchRef { name }
    licenseInfo { name }
    repositoryTopics(first: 20) { nodes { topic { name } } }
    primaryLanguage { name color }
    languages(first: 8, orderBy: { field: SIZE, direction: DESC }) {
        edges { size node { name color } }
    }
`;

const QUERY_LISTA = `
    query($login: String!, $after: String) {
        user(login: $login) {
            repositories(
                first: ${POR_PAGINA}
                after: $after
                privacy: PUBLIC
                ownerAffiliations: OWNER
                orderBy: { field: UPDATED_AT, direction: DESC }
            ) {
                pageInfo { hasNextPage endCursor }
                nodes { ${CAMPOS_REPO} }
            }
        }
    }
`;

const QUERY_UM = `
    query($login: String!, $name: String!) {
        repository(owner: $login, name: $name) {
            isPrivate
            ${CAMPOS_REPO}
        }
    }
`;

export interface NoRepoGQL {
    id?: string;
    name?: string;
    nameWithOwner?: string;
    description?: string | null;
    url?: string;
    homepageUrl?: string | null;
    stargazerCount?: number;
    forkCount?: number;
    isArchived?: boolean;
    isFork?: boolean;
    isPrivate?: boolean;
    pushedAt?: string | null;
    updatedAt?: string;
    createdAt?: string;
    openGraphImageUrl?: string | null;
    defaultBranchRef?: { name?: string } | null;
    licenseInfo?: { name?: string } | null;
    repositoryTopics?: { nodes?: { topic?: { name?: string } }[] };
    primaryLanguage?: { name?: string; color?: string | null } | null;
    languages?: {
        edges?: {
            size?: number;
            node?: { name?: string; color?: string | null };
        }[];
    };
}

/**
 * Normaliza um nó do GraphQL, conferindo o que é indispensável.
 *
 * Devolve `null` em vez de lançar: num acervo de cem repositórios, um
 * nó estranho não deve derrubar os outros noventa e nove.
 */
export function doGraphQL(no: NoRepoGQL | null | undefined): Repository | null {
    if (
        !no ||
        typeof no.name !== "string" ||
        typeof no.url !== "string" ||
        typeof no.updatedAt !== "string"
    ) {
        return null;
    }

    const primaria = no.primaryLanguage?.name
        ? {
              name: no.primaryLanguage.name,
              color: cor(no.primaryLanguage.name, no.primaryLanguage.color),
          }
        : null;

    return {
        id: String(no.id ?? no.nameWithOwner ?? no.name),
        name: no.name,
        fullName: no.nameWithOwner ?? `${GITHUB_USER}/${no.name}`,
        description: no.description ?? null,
        url: no.url,
        homepageUrl: no.homepageUrl || null,
        stargazerCount: Number(no.stargazerCount ?? 0),
        forkCount: Number(no.forkCount ?? 0),
        isArchived: Boolean(no.isArchived),
        isFork: Boolean(no.isFork),
        pushedAt: no.pushedAt ?? null,
        updatedAt: no.updatedAt,
        createdAt: no.createdAt ?? no.updatedAt,
        topics: (no.repositoryTopics?.nodes ?? [])
            .map((t) => t?.topic?.name)
            .filter((n): n is string => typeof n === "string"),
        primaryLanguage: primaria,
        languages: (no.languages?.edges ?? [])
            .map((e): Language | null =>
                e?.node?.name
                    ? {
                          name: e.node.name,
                          color: cor(e.node.name, e.node.color),
                          size: Number(e.size ?? 0),
                      }
                    : null,
            )
            .filter((l): l is Language => l !== null),
        defaultBranch: no.defaultBranchRef?.name ?? null,
        openGraphImageUrl: no.openGraphImageUrl ?? null,
        licenseName: no.licenseInfo?.name ?? null,
    };
}

/* ─────────────────────────────────────────────────────────
   Caminho público — REST sem token
───────────────────────────────────────────────────────── */

export interface RepoREST {
    id?: number;
    name?: string;
    full_name?: string;
    description?: string | null;
    html_url?: string;
    homepage?: string | null;
    stargazers_count?: number;
    forks_count?: number;
    archived?: boolean;
    fork?: boolean;
    private?: boolean;
    pushed_at?: string | null;
    updated_at?: string;
    created_at?: string;
    default_branch?: string | null;
    language?: string | null;
    license?: { name?: string } | null;
    topics?: string[];
}

export function doREST(bruto: RepoREST | null | undefined): Repository | null {
    if (
        !bruto ||
        typeof bruto.name !== "string" ||
        typeof bruto.html_url !== "string" ||
        typeof bruto.updated_at !== "string"
    ) {
        return null;
    }

    const primaria = bruto.language
        ? { name: bruto.language, color: cor(bruto.language) }
        : null;

    const fullName = bruto.full_name ?? `${GITHUB_USER}/${bruto.name}`;

    return {
        id: String(bruto.id ?? fullName),
        name: bruto.name,
        fullName,
        description: bruto.description ?? null,
        url: bruto.html_url,
        homepageUrl: bruto.homepage || null,
        stargazerCount: Number(bruto.stargazers_count ?? 0),
        forkCount: Number(bruto.forks_count ?? 0),
        isArchived: Boolean(bruto.archived),
        isFork: Boolean(bruto.fork),
        pushedAt: bruto.pushed_at ?? null,
        updatedAt: bruto.updated_at,
        createdAt: bruto.created_at ?? bruto.updated_at,
        topics: Array.isArray(bruto.topics)
            ? bruto.topics.filter((t): t is string => typeof t === "string")
            : [],
        primaryLanguage: primaria,
        /* Sem `size`: a listagem REST não divide por linguagem, e inventar
           100% para a primária afirmaria uma proporção que não foi medida. */
        languages: primaria ? [primaria] : [],
        defaultBranch: bruto.default_branch ?? null,
        /* O GitHub serve o social card de qualquer repositório público
           nesta URL; o primeiro segmento é apenas chave de cache. */
        openGraphImageUrl: `https://opengraph.githubassets.com/${encodeURIComponent(
            bruto.pushed_at ?? "1",
        )}/${fullName}`,
        licenseName: bruto.license?.name ?? null,
    };
}

/* ─────────────────────────────────────────────────────────
   Consultas
───────────────────────────────────────────────────────── */

interface PaginaGQL {
    user?: {
        repositories?: {
            pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
            nodes?: (NoRepoGQL | null)[];
        };
    } | null;
}

/**
 * Todos os repositórios públicos do dono, do mais recente ao mais
 * antigo (por atualização). Pagina até esgotar ou bater `MAX_PAGINAS`.
 */
export async function listarRepositorios(): Promise<Repository[]> {
    const todos: Repository[] = [];

    if (temToken()) {
        let after: string | null = null;
        for (let pagina = 0; pagina < MAX_PAGINAS; pagina++) {
            const data: PaginaGQL = await consultarGraphQL<PaginaGQL>(
                QUERY_LISTA,
                { login: GITHUB_USER, after },
            );
            const conexao = data.user?.repositories;
            if (!Array.isArray(conexao?.nodes)) {
                throw new ErroPublico(
                    "upstream_invalido",
                    "resposta do GitHub fora do formato esperado",
                    "user.repositories.nodes não é lista",
                );
            }
            for (const no of conexao.nodes) {
                const repo = doGraphQL(no);
                if (repo) todos.push(repo);
            }
            const proximo = conexao.pageInfo;
            if (!proximo?.hasNextPage || !proximo.endCursor) break;
            after = proximo.endCursor;
        }
        return todos;
    }

    for (let pagina = 1; pagina <= MAX_PAGINAS; pagina++) {
        const bruto = await buscarREST<RepoREST[]>(
            `/users/${GITHUB_USER}/repos?per_page=${POR_PAGINA}&page=${pagina}&sort=updated&type=owner`,
        );
        if (!Array.isArray(bruto)) {
            throw new ErroPublico(
                "upstream_invalido",
                "resposta do GitHub fora do formato esperado",
                "REST de repositórios não devolveu lista",
            );
        }
        for (const item of bruto) {
            if (item?.private) continue;
            const repo = doREST(item);
            if (repo) todos.push(repo);
        }
        if (bruto.length < POR_PAGINA) break;
    }
    return todos;
}

/**
 * Um repositório público pelo nome (já validado por quem chama).
 * Privado é tratado como inexistente: distinguir os dois revelaria que
 * o repositório existe.
 */
export async function buscarRepositorio(
    name: string,
): Promise<Repository | null> {
    if (temToken()) {
        const data = await consultarGraphQL<{
            repository?: NoRepoGQL | null;
        }>(
            QUERY_UM,
            { login: GITHUB_USER, name },
            { aceitaNaoEncontrado: true },
        );
        const no = data.repository;
        if (!no || no.isPrivate) return null;
        return doGraphQL(no);
    }

    const bruto = await buscarREST<RepoREST>(`/repos/${GITHUB_USER}/${name}`);
    if (!bruto || bruto.private) return null;
    return doREST(bruto);
}

/** README cru (markdown) ou `null` quando o repositório não tem um. */
export async function buscarReadme(name: string): Promise<string | null> {
    const texto = await buscarREST<string>(
        `/repos/${GITHUB_USER}/${name}/readme`,
        "application/vnd.github.raw+json",
    );
    if (typeof texto !== "string" || texto.trim() === "") return null;
    return texto;
}
