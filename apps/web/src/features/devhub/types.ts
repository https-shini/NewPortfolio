/* ─────────────────────────────────────────────────────────
   types.ts — a forma dos dados do DevHub no cliente
   ─────────────────────────────────────────────────────────
   Tipos de TypeScript, e não schemas de runtime: quem normaliza
   o que vem do GitHub é `/api/devhub` (ver api/_github-repos.ts),
   e o cliente só confere a forma geral antes de usar (api.ts).

   Ausência de campo é `null`, nunca exceção: um repositório sem
   descrição, sem licença e sem linguagem é um repositório normal.
───────────────────────────────────────────────────────── */

/** Uma linguagem do repositório, com a cor que o GitHub lhe dá. */
export interface Language {
    name: string;
    /** Hexadecimal; o servidor já resolve a cor, `null` é exceção. */
    color: string | null;
    /** Bytes de código. Ausente quando a origem não mede (REST). */
    size?: number;
}

/** Um repositório público, já normalizado pelo servidor. */
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
    /** Social card do GitHub; `null` quando não há. */
    openGraphImageUrl: string | null;
    licenseName: string | null;
    /* Características — `null` = a origem não mediu (nunca "não tem"). */
    watcherCount: number | null;
    hasReadme: boolean | null;
    hasDocs: boolean | null;
    hasPages: boolean | null;
    diskUsageKb: number | null;
    /** Capa real: social preview customizada ou imagem do README. */
    cover: { kind: "custom" | "readme"; url: string } | null;
}

/** O detalhe de um projeto: o repositório mais o README já seguro. */
export interface RepositoryDetail extends Repository {
    /** README convertido e sanitizado no servidor; `null` se não houver. */
    readmeHtml: string | null;
}

/** `op=index` — o acervo inteiro e o que alimenta as métricas. */
export interface DevhubIndex {
    repositories: Repository[];
    /** Seguidores do perfil; `null` quando o GitHub não informou. */
    followers: number | null;
    /** Momento da coleta, ISO. */
    fetchedAt: string;
}

/** `op=pinned` — a vitrine da home. */
export interface DevhubPinned {
    repositories: Repository[];
    /** `pinned`: fixados no GitHub; `recent`: substituto sem fixados. */
    source: "pinned" | "recent";
    fetchedAt: string;
}

/* ─────────────────────────────────────────────────────────
   Filtros e ordenação
───────────────────────────────────────────────────────── */

export const SORT_OPTIONS = ["name", "updated", "stars", "created"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export interface ProjectFilters {
    search: string;
    language: string;
    sort: SortOption;
    showForks: boolean;
    showArchived: boolean;
}

/**
 * Visão padrão da galeria: ordem alfabética, sem forks e arquivados.
 *
 * Alfabética, e não por atividade: a seção "Projetos recentes", logo
 * acima, já mostra os mais novos. Com a mesma ordem, os seis primeiros
 * cartões da galeria repetiam a seção de cima — medido na validação
 * visual. A galeria é o catálogo; a atividade continua a um clique.
 */
export const DEFAULT_FILTERS: ProjectFilters = {
    search: "",
    language: "",
    sort: "name",
    showForks: false,
    showArchived: false,
};

/** Métricas do perfil, calculadas da mesma coleta da galeria. */
export interface RepoStats {
    /** Repositórios públicos (todos, incluindo forks e arquivados). */
    repos: number;
    /** Estrelas recebidas, somadas sobre os repositórios. */
    stars: number;
    /** Seguidores do perfil; `null` quando não veio. */
    followers: number | null;
    /** Linguagens distintas que aparecem no acervo. */
    languages: number;
    /** Repositórios com push nos últimos 90 dias. */
    active: number;
}

/** Cinza de linguagem sem cor conhecida. */
export const NEUTRAL_LANGUAGE_COLOR = "#8B949E";

/* ── Estatísticas de um projeto (op=stats) ──────────────────
   Espelho de `RepositoryStats` em api/_github-detalhe.ts. A resposta
   inteira é `null` quando os números não existem (sem token, privado);
   blocos internos `null` = só aquele bloco falhou. Na interface,
   `null` vira "indisponível", NUNCA zero. */

export interface RepoCommit {
    sha: string;
    message: string;
    date: string;
    url: string;
    author: string | null;
    authorLogin: string | null;
}

export interface RepoRelease {
    name: string;
    tag: string;
    publishedAt: string | null;
    url: string;
    prerelease: boolean;
}

export interface RepoTreeEntry {
    name: string;
    type: "tree" | "blob" | "commit";
}

export interface RepoContributor {
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
    releases: { total: number; latest: RepoRelease[] };
    commits: {
        total: number;
        lastYear: number;
        lastYearDates: string[];
        recent: RepoCommit[];
    } | null;
    tree: RepoTreeEntry[] | null;
    contributors: { total: number; top: RepoContributor[] } | null;
}

/* ─────────────────────────────────────────────────────────
   Panorama do perfil (op=profile) — espelha api/_github-perfil.ts
───────────────────────────────────────────────────────── */

export interface ProfileStreak {
    days: number;
    start: string | null;
    end: string | null;
}

export interface GithubProfile {
    login: string;
    name: string | null;
    createdAt: string;
    followers: number;
    /** Totais históricos do perfil (contagem do GitHub). */
    pullRequests: number;
    issues: number;
    lastYear: {
        from: string;
        to: string;
        contributions: number;
        commits: number;
        pullRequests: number;
        issues: number;
        reviews: number;
        reposContributed: number;
        restricted: number;
    };
    /** Calendário oficial, dia a dia, desde a criação da conta. */
    days: { start: string; counts: number[] };
    streak: {
        total: number;
        since: string;
        current: ProfileStreak;
        longest: ProfileStreak;
    };
    langs: { name: string; color: string | null }[];
    repos: {
        name: string;
        fork: boolean;
        stars: number;
        forks: number;
        createdAt: string;
        lang: number | null;
        languages: [number, number][];
    }[];
    /** Contribuições públicas: [dia, repositório(, quantidade)]. */
    activity: {
        repos: string[];
        commits: [number, number, number][];
        pullRequests: [number, number][];
        issues: [number, number][];
        reviews: [number, number][];
        truncated: boolean;
    };
    milestones: {
        busiestYear: { year: number; count: number } | null;
        busiestDay: { date: string; count: number } | null;
        topRepo: { name: string; stars: number } | null;
    };
    fetchedAt: string;
}
