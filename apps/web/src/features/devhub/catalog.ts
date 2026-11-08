import type { Repository } from "@/features/devhub/types";

/* ─────────────────────────────────────────────────────────
   catalog.ts — a lógica do catálogo de /projetos, sem React
   ─────────────────────────────────────────────────────────
   Busca, filtros facetados, contadores, ordenação, paginação e a
   tradução de tudo isso para a URL. Funções puras: entrada →
   saída, o lugar barato de testar a regra.

   Semântica dos filtros (a mesma de um marketplace):
     · dentro de uma faceta, OU  — "TypeScript ou Python";
     · entre facetas, E          — "TypeScript E com demo";
     · características marcadas se somam (todas precisam valer).

   O contador ao lado de cada opção responde "quantos resultados
   eu teria se marcasse isto", com os OUTROS filtros aplicados —
   por isso a faceta da própria opção sai da conta.

   Regra de dados: uma opção só existe se puder ser aplicada com
   confiança. Característica que a origem não mediu (`null`) não
   conta como "não tem" — o repositório simplesmente não passa num
   filtro que exige a característica, e a opção some se nenhum
   repositório tiver o dado medido.
───────────────────────────────────────────────────────── */

export const SORTS = [
    "recent",
    "updated",
    "stars",
    "forks",
    "popular",
    "name",
] as const;
export type CatalogSort = (typeof SORTS)[number];

export const ACTIVITY_WINDOWS = [30, 90, 365] as const;
export type ActivityWindow = (typeof ACTIVITY_WINDOWS)[number];

export const POPULARITY = ["stars", "forks", "watchers"] as const;
export type PopularityFlag = (typeof POPULARITY)[number];

export const FEATURES = ["readme", "docs", "license", "demo", "pages"] as const;
export type FeatureFlag = (typeof FEATURES)[number];

export const STATUSES = ["active", "archived", "all"] as const;
export type StatusFilter = (typeof STATUSES)[number];

export interface CatalogState {
    query: string;
    languages: string[];
    topics: string[];
    /** Último push dentro de N dias; `null` = qualquer data. */
    updatedWithin: ActivityWindow | null;
    /** Anos de criação marcados. */
    createdYears: number[];
    popularity: PopularityFlag[];
    features: FeatureFlag[];
    status: StatusFilter;
    includeForks: boolean;
    /** Só os fixados no perfil do GitHub. */
    pinnedOnly: boolean;
    sort: CatalogSort;
    page: number;
}

/** Visão padrão: mais recentes (por CRIAÇÃO) primeiro, ativos, sem forks. */
export const DEFAULT_CATALOG: CatalogState = {
    query: "",
    languages: [],
    topics: [],
    updatedWithin: null,
    createdYears: [],
    popularity: [],
    features: [],
    status: "active",
    includeForks: false,
    pinnedOnly: false,
    sort: "recent",
    page: 1,
};

/** Grade 3 × 3 no desktop: 9 por página fecha sempre linhas inteiras. */
export const PAGE_SIZE = 9;

const MS_DIA = 86_400_000;

/* ─────────────────────────────────────────────────────────
   Busca
───────────────────────────────────────────────────────── */

/** Minúsculas e sem acento: "Finanças" acha "financas". */
export function normalize(texto: string): string {
    return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * Nome de exibição a partir do nome do repositório:
 * `financas-reactjs` → "Financas Reactjs", `NewPortfolio` → "New Portfolio".
 */
export function displayName(name: string): string {
    return name
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/[-_.]+/g, " ")
        .trim()
        .replace(/\s+/g, " ")
        .replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

function textoBuscavel(repo: Repository): string {
    return normalize(
        [
            repo.name,
            displayName(repo.name),
            repo.description ?? "",
            repo.primaryLanguage?.name ?? "",
            ...repo.languages.map((l) => l.name),
            ...repo.topics,
            repo.licenseName ?? "",
        ].join(" "),
    );
}

/** Sem espaço, hífen, ponto ou sublinhado: "new-portfolio" = "newportfolio". */
const compacto = (texto: string) => texto.replace(/[\s\-_.]+/g, "");

/**
 * Todos os termos precisam aparecer, em qualquer campo e ordem. Cada
 * termo também é procurado sem separadores, então "newportfolio",
 * "new portfolio" e "new-portfolio" acham o mesmo repositório.
 */
export function matchesQuery(repo: Repository, query: string): boolean {
    const termos = normalize(query).split(/\s+/).filter(Boolean);
    if (termos.length === 0) return true;
    const alvo = textoBuscavel(repo);
    const alvoCompacto = compacto(alvo);
    if (termos.every((t) => alvo.includes(t))) return true;
    /* A consulta inteira, colada: "new portfolio" acha "NewPortfolio". */
    return (
        termos.every((t) => alvoCompacto.includes(compacto(t))) ||
        alvoCompacto.includes(compacto(termos.join("")))
    );
}

/* ─────────────────────────────────────────────────────────
   Facetas
───────────────────────────────────────────────────────── */

export type Facet =
    | "languages"
    | "topics"
    | "updatedWithin"
    | "createdYears"
    | "popularity"
    | "features"
    | "status"
    | "includeForks";

export function repoLanguages(repo: Repository): string[] {
    const nomes = new Set(repo.languages.map((l) => l.name));
    if (repo.primaryLanguage) nomes.add(repo.primaryLanguage.name);
    return [...nomes];
}

function data(iso: string | null): number {
    const t = iso ? Date.parse(iso) : NaN;
    return Number.isNaN(t) ? 0 : t;
}

export function createdYear(repo: Repository): number {
    return new Date(repo.createdAt).getUTCFullYear();
}

export function hasPopularity(repo: Repository, flag: PopularityFlag): boolean {
    switch (flag) {
        case "stars":
            return repo.stargazerCount > 0;
        case "forks":
            return repo.forkCount > 0;
        case "watchers":
            /* O dono costuma acompanhar o próprio repositório: "observado"
               aqui é ter alguém ALÉM dele. Sem medição, não passa. */
            return (repo.watcherCount ?? 0) > 1;
    }
}

export function hasFeature(repo: Repository, flag: FeatureFlag): boolean {
    switch (flag) {
        case "readme":
            return repo.hasReadme === true;
        case "docs":
            return repo.hasDocs === true;
        case "license":
            return repo.licenseName !== null;
        case "demo":
            return Boolean(repo.homepageUrl);
        case "pages":
            return repo.hasPages === true;
    }
}

/** A característica foi medida para este repositório? */
export function featureKnown(repo: Repository, flag: FeatureFlag): boolean {
    switch (flag) {
        case "readme":
            return repo.hasReadme !== null;
        case "docs":
            return repo.hasDocs !== null;
        case "pages":
            return repo.hasPages !== null;
        case "license":
        case "demo":
            return true;
    }
}

const SEM_FIXADOS: ReadonlySet<string> = new Set();

/** O repositório passa em todos os filtros, exceto (opcionalmente) uma faceta. */
export function matches(
    repo: Repository,
    s: CatalogState,
    ignorar?: Facet,
    agora: number = Date.now(),
    fixados: ReadonlySet<string> = SEM_FIXADOS,
): boolean {
    if (!matchesQuery(repo, s.query)) return false;

    if (s.pinnedOnly && !fixados.has(repo.name)) return false;

    if (ignorar !== "includeForks" && !s.includeForks && repo.isFork) {
        return false;
    }
    if (ignorar !== "status") {
        if (s.status === "active" && repo.isArchived) return false;
        if (s.status === "archived" && !repo.isArchived) return false;
    }
    if (ignorar !== "languages" && s.languages.length > 0) {
        const langs = repoLanguages(repo);
        if (!s.languages.some((l) => langs.includes(l))) return false;
    }
    if (ignorar !== "topics" && s.topics.length > 0) {
        if (!s.topics.some((t) => repo.topics.includes(t))) return false;
    }
    if (ignorar !== "updatedWithin" && s.updatedWithin !== null) {
        const ultimo = Math.max(data(repo.pushedAt), data(repo.updatedAt));
        if (ultimo < agora - s.updatedWithin * MS_DIA) return false;
    }
    if (ignorar !== "createdYears" && s.createdYears.length > 0) {
        if (!s.createdYears.includes(createdYear(repo))) return false;
    }
    if (ignorar !== "popularity") {
        if (!s.popularity.every((f) => hasPopularity(repo, f))) return false;
    }
    if (ignorar !== "features") {
        if (!s.features.every((f) => hasFeature(repo, f))) return false;
    }
    return true;
}

/* ─────────────────────────────────────────────────────────
   Ordenação
───────────────────────────────────────────────────────── */

/**
 * "Mais populares": estrelas pesam mais que forks, e observadores além
 * do dono entram como sinal fraco. Fórmula explícita, para ninguém ter
 * de adivinhar o que a ordem significa.
 */
export function popularityScore(repo: Repository): number {
    return (
        repo.stargazerCount * 3 +
        repo.forkCount * 2 +
        Math.max(0, (repo.watcherCount ?? 0) - 1)
    );
}

function ultimaAtividade(repo: Repository): number {
    return Math.max(data(repo.pushedAt), data(repo.updatedAt));
}

export function compareBy(sort: CatalogSort) {
    return (a: Repository, b: Repository): number => {
        /* Desempate estável e previsível: o mais novo primeiro. */
        const novo = data(b.createdAt) - data(a.createdAt);
        switch (sort) {
            case "recent":
                return novo || a.name.localeCompare(b.name);
            case "updated":
                return ultimaAtividade(b) - ultimaAtividade(a) || novo;
            case "stars":
                return b.stargazerCount - a.stargazerCount || novo;
            case "forks":
                return b.forkCount - a.forkCount || novo;
            case "popular":
                return popularityScore(b) - popularityScore(a) || novo;
            case "name":
                return a.name.localeCompare(b.name, undefined, {
                    sensitivity: "base",
                });
        }
    };
}

/* ─────────────────────────────────────────────────────────
   Resultado, facetas e paginação
───────────────────────────────────────────────────────── */

export interface FacetOption<V> {
    value: V;
    count: number;
    active: boolean;
}

export interface CatalogResult {
    total: number;
    items: Repository[];
    page: number;
    pageCount: number;
    from: number;
    to: number;
}

export function runCatalog(
    repos: readonly Repository[],
    s: CatalogState,
    agora: number = Date.now(),
    fixados: ReadonlySet<string> = SEM_FIXADOS,
): CatalogResult {
    const filtrados = repos
        .filter((r) => matches(r, s, undefined, agora, fixados))
        .sort(compareBy(s.sort));
    const pageCount = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
    const page = Math.min(Math.max(1, s.page), pageCount);
    const inicio = (page - 1) * PAGE_SIZE;
    const items = filtrados.slice(inicio, inicio + PAGE_SIZE);
    return {
        total: filtrados.length,
        items,
        page,
        pageCount,
        from: items.length ? inicio + 1 : 0,
        to: inicio + items.length,
    };
}

function contar(
    repos: readonly Repository[],
    s: CatalogState,
    faceta: Facet,
    agora: number,
    passa: (r: Repository) => boolean,
    fixados: ReadonlySet<string> = SEM_FIXADOS,
): number {
    let n = 0;
    for (const r of repos)
        if (matches(r, s, faceta, agora, fixados) && passa(r)) n += 1;
    return n;
}

export interface Facets {
    languages: FacetOption<string>[];
    topics: FacetOption<string>[];
    updatedWithin: FacetOption<ActivityWindow>[];
    createdYears: FacetOption<number>[];
    popularity: FacetOption<PopularityFlag>[];
    features: FacetOption<FeatureFlag>[];
    status: FacetOption<StatusFilter>[];
    forks: { count: number; active: boolean; available: boolean };
}

/**
 * Opções de cada faceta com seus contadores. Opção com zero no acervo
 * INTEIRO (não só no recorte atual) não aparece — não é filtro que os
 * dados sustentem. Opção que zera só no recorte aparece com 0, para o
 * visitante entender por que não há resultado.
 */
export function buildFacets(
    repos: readonly Repository[],
    s: CatalogState,
    agora: number = Date.now(),
    fixados: ReadonlySet<string> = SEM_FIXADOS,
): Facets {
    const conta = (faceta: Facet, passa: (r: Repository) => boolean) =>
        contar(repos, s, faceta, agora, passa, fixados);
    const porContagem = <V>(lista: FacetOption<V>[]) =>
        lista.sort(
            (a, b) =>
                b.count - a.count ||
                String(a.value).localeCompare(String(b.value)),
        );

    const todasLinguagens = new Map<string, number>();
    const todosTopicos = new Map<string, number>();
    const anos = new Set<number>();
    for (const r of repos) {
        for (const l of repoLanguages(r)) {
            todasLinguagens.set(l, (todasLinguagens.get(l) ?? 0) + 1);
        }
        for (const t of r.topics)
            todosTopicos.set(t, (todosTopicos.get(t) ?? 0) + 1);
        anos.add(createdYear(r));
    }

    const languages = porContagem(
        [...todasLinguagens.keys()].map((value) => ({
            value,
            count: conta("languages", (r) => repoLanguages(r).includes(value)),
            active: s.languages.includes(value),
        })),
    );

    const topics = porContagem(
        [...todosTopicos.keys()].map((value) => ({
            value,
            count: conta("topics", (r) => r.topics.includes(value)),
            active: s.topics.includes(value),
        })),
    );

    const updatedWithin = ACTIVITY_WINDOWS.map((value) => ({
        value,
        count: conta(
            "updatedWithin",
            (r) => ultimaAtividade(r) >= agora - value * MS_DIA,
        ),
        active: s.updatedWithin === value,
    }));

    const createdYears = [...anos]
        .sort((a, b) => b - a)
        .map((value) => ({
            value,
            count: conta("createdYears", (r) => createdYear(r) === value),
            active: s.createdYears.includes(value),
        }));

    const popularity = POPULARITY.filter((f) =>
        repos.some((r) => hasPopularity(r, f)),
    ).map((value) => ({
        value,
        count: conta("popularity", (r) => hasPopularity(r, value)),
        active: s.popularity.includes(value),
    }));

    const features = FEATURES.filter(
        (f) =>
            repos.some((r) => featureKnown(r, f)) &&
            repos.some((r) => hasFeature(r, f)),
    ).map((value) => ({
        value,
        count: conta("features", (r) => hasFeature(r, value)),
        active: s.features.includes(value),
    }));

    const status = STATUSES.map((value) => ({
        value,
        count: conta("status", (r) =>
            value === "all"
                ? true
                : value === "archived"
                  ? r.isArchived
                  : !r.isArchived,
        ),
        active: s.status === value,
    }));

    const forks = {
        count: conta("includeForks", (r) => r.isFork),
        active: s.includeForks,
        available: repos.some((r) => r.isFork),
    };

    return {
        languages,
        topics,
        updatedWithin,
        createdYears,
        popularity,
        features,
        status,
        forks,
    };
}

/** Quantos filtros (não contando busca, ordem e página) estão ativos. */
export function activeFilterCount(s: CatalogState): number {
    return (
        s.languages.length +
        s.topics.length +
        (s.updatedWithin !== null ? 1 : 0) +
        s.createdYears.length +
        s.popularity.length +
        s.features.length +
        (s.status !== DEFAULT_CATALOG.status ? 1 : 0) +
        (s.includeForks !== DEFAULT_CATALOG.includeForks ? 1 : 0) +
        (s.pinnedOnly ? 1 : 0)
    );
}

/** Quantas páginas ficam sempre visíveis em cada ponta. */
const PONTA = 3;

/**
 * Páginas a mostrar na paginação: as 3 primeiras e as 3 últimas sempre;
 * o meio fica oculto atrás de `null` (reticências). A página atual,
 * quando cai no meio, aparece sozinha entre duas reticências — o
 * visitante nunca perde de vista onde está. Uma lacuna de uma página só
 * mostra o número (reticências no lugar de um único número não poupam
 * espaço).
 */
export function pageList(page: number, pageCount: number): (number | null)[] {
    const conjunto = new Set<number>([page]);
    for (let i = 1; i <= Math.min(PONTA, pageCount); i++) {
        conjunto.add(i);
        conjunto.add(pageCount - i + 1);
    }
    const ordenadas = [...conjunto]
        .filter((p) => p >= 1 && p <= pageCount)
        .sort((a, b) => a - b);
    const saida: (number | null)[] = [];
    ordenadas.forEach((p, i) => {
        const anterior = ordenadas[i - 1];
        if (anterior !== undefined) {
            if (p - anterior === 2) saida.push(anterior + 1);
            else if (p - anterior > 2) saida.push(null);
        }
        saida.push(p);
    });
    return saida;
}

/* ─────────────────────────────────────────────────────────
   URL — os critérios sobrevivem à navegação e ao "voltar"
   ─────────────────────────────────────────────────────────
   Chaves em português, curtas, e NUNCA `lang`: esse parâmetro é o
   idioma do site (ver RouterContext). A linguagem de programação
   usa `ling`.
───────────────────────────────────────────────────────── */

const LISTA = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

const EM = <T extends string>(lista: readonly T[], v: string): v is T =>
    (lista as readonly string[]).includes(v);

export function fromSearch(search: string): CatalogState {
    const p = new URLSearchParams(search);
    const janela = Number(p.get("atualizado"));
    const pagina = Number(p.get("pagina"));
    const ordem = p.get("ordem") ?? "";
    const status = p.get("status") ?? "";
    return {
        query: (p.get("q") ?? "").slice(0, 100),
        languages: LISTA(p.get("ling")),
        topics: LISTA(p.get("topico")),
        updatedWithin: (ACTIVITY_WINDOWS as readonly number[]).includes(janela)
            ? (janela as ActivityWindow)
            : null,
        createdYears: LISTA(p.get("criado"))
            .map(Number)
            .filter((n) => Number.isInteger(n) && n > 2000 && n < 2100),
        popularity: LISTA(p.get("pop")).filter((v): v is PopularityFlag =>
            EM(POPULARITY, v),
        ),
        features: LISTA(p.get("carac")).filter((v): v is FeatureFlag =>
            EM(FEATURES, v),
        ),
        status: EM(STATUSES, status) ? status : DEFAULT_CATALOG.status,
        includeForks: p.get("forks") === "1",
        pinnedOnly: p.get("fixados") === "1",
        sort: EM(SORTS, ordem) ? ordem : DEFAULT_CATALOG.sort,
        page: Number.isInteger(pagina) && pagina > 1 ? pagina : 1,
    };
}

/**
 * Escreve os critérios na query string, preservando parâmetros que não
 * são do catálogo (o `lang` do idioma, por exemplo). Valor padrão não
 * vai para a URL — o endereço limpo É a visão padrão.
 */
export function toSearch(s: CatalogState, atual: string): string {
    const p = new URLSearchParams(atual);
    const definir = (chave: string, valor: string | null) => {
        if (valor) p.set(chave, valor);
        else p.delete(chave);
    };
    definir("q", s.query.trim() || null);
    definir("ling", s.languages.join(",") || null);
    definir("topico", s.topics.join(",") || null);
    definir("atualizado", s.updatedWithin ? String(s.updatedWithin) : null);
    definir("criado", s.createdYears.join(",") || null);
    definir("pop", s.popularity.join(",") || null);
    definir("carac", s.features.join(",") || null);
    definir("status", s.status !== DEFAULT_CATALOG.status ? s.status : null);
    definir("forks", s.includeForks ? "1" : null);
    definir("fixados", s.pinnedOnly ? "1" : null);
    definir("ordem", s.sort !== DEFAULT_CATALOG.sort ? s.sort : null);
    definir("pagina", s.page > 1 ? String(s.page) : null);
    const texto = p.toString();
    return texto ? `?${texto}` : "";
}
