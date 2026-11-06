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

export const SORT_OPTIONS = ["updated", "stars", "created", "name"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export interface ProjectFilters {
    search: string;
    language: string;
    sort: SortOption;
    showForks: boolean;
    showArchived: boolean;
}

/** Visão padrão da galeria: mais recentes primeiro, sem forks e arquivados. */
export const DEFAULT_FILTERS: ProjectFilters = {
    search: "",
    language: "",
    sort: "updated",
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
