import {
    DEFAULT_FILTERS,
    type ProjectFilters,
    type RepoStats,
    type Repository,
    type SortOption,
} from "@/features/devhub/types";

/* ─────────────────────────────────────────────────────────
   selectors.ts — derivações puras sobre o acervo
   ─────────────────────────────────────────────────────────
   Nada aqui toca a rede, o DOM ou o React: são funções de
   entrada e saída, o lugar barato de testar a regra.

   Diferença em relação ao fork: lá havia uma lista curada de
   destaques digitada no código (`PINNED_REPOS`). Saiu — a vitrine
   agora são os fixados no próprio GitHub (`op=pinned`).
───────────────────────────────────────────────────────── */

const MS_DIA = 86_400_000;

/** Janela de "atividade recente" nas métricas. */
export const ACTIVE_WINDOW_DAYS = 90;

/** Quantos projetos a seção "Projetos recentes" mostra. */
export const RECENT_COUNT = 6;

/** Quantos cartões a galeria revela por vez. */
export const GALLERY_PAGE_SIZE = 12;

function data(iso: string | null): number {
    const t = iso ? Date.parse(iso) : NaN;
    return Number.isNaN(t) ? 0 : t;
}

/**
 * Momento da última mudança de verdade. `pushedAt` é o último push;
 * `updatedAt` também muda com estrela, descrição e tópicos. Para
 * "recentes" e "atualizados", o push é o que significa trabalho.
 */
export function lastActivity(repo: Repository): number {
    return Math.max(data(repo.pushedAt), data(repo.updatedAt));
}

function compare(a: Repository, b: Repository, sort: SortOption): number {
    switch (sort) {
        case "updated":
            return lastActivity(b) - lastActivity(a);
        case "stars":
            /* Desempate por atividade: com quase tudo em zero estrela,
               ordenar só por estrelas devolveria a ordem da API. */
            return (
                b.stargazerCount - a.stargazerCount ||
                lastActivity(b) - lastActivity(a)
            );
        case "created":
            return data(b.createdAt) - data(a.createdAt);
        case "name":
            return a.name.localeCompare(b.name, undefined, {
                sensitivity: "base",
            });
    }
}

/** Aplica os filtros e devolve uma NOVA lista ordenada (não muta a entrada). */
export function filterAndSort(
    repositories: readonly Repository[],
    filters: ProjectFilters,
): Repository[] {
    const busca = filters.search.trim().toLowerCase();

    return repositories
        .filter((repo) => {
            if (!filters.showForks && repo.isFork) return false;
            if (!filters.showArchived && repo.isArchived) return false;
            if (
                filters.language &&
                repo.primaryLanguage?.name !== filters.language
            )
                return false;
            if (busca) {
                const alvo = [repo.name, repo.description ?? "", ...repo.topics]
                    .join(" ")
                    .toLowerCase();
                if (!alvo.includes(busca)) return false;
            }
            return true;
        })
        .sort((a, b) => compare(a, b, filters.sort));
}

/** Os N mais recentemente trabalhados, sem forks e arquivados. */
export function recentRepos(
    repositories: readonly Repository[],
    count = RECENT_COUNT,
): Repository[] {
    return filterAndSort(repositories, {
        ...DEFAULT_FILTERS,
        sort: "updated",
    }).slice(0, count);
}

/**
 * Métricas do perfil a partir da MESMA lista da galeria — os números do
 * topo e a contagem da galeria nunca discordam.
 */
export function repoStats(
    repositories: readonly Repository[],
    followers: number | null,
    now: number = Date.now(),
): RepoStats {
    const linguagens = new Set<string>();
    const limite = now - ACTIVE_WINDOW_DAYS * MS_DIA;
    let stars = 0;
    let active = 0;

    for (const repo of repositories) {
        stars += repo.stargazerCount;
        if (repo.primaryLanguage) linguagens.add(repo.primaryLanguage.name);
        for (const l of repo.languages) linguagens.add(l.name);
        if (data(repo.pushedAt) >= limite) active += 1;
    }

    return {
        repos: repositories.length,
        stars,
        followers,
        languages: linguagens.size,
        active,
    };
}

/** Linguagens primárias presentes no acervo, em ordem alfabética. */
export function availableLanguages(
    repositories: readonly Repository[],
): string[] {
    const nomes = new Set<string>();
    for (const repo of repositories) {
        if (repo.primaryLanguage) nomes.add(repo.primaryLanguage.name);
    }
    return [...nomes].sort((a, b) => a.localeCompare(b));
}

/** True quando algum filtro afasta a galeria da visão padrão. */
export function hasActiveFilters(filters: ProjectFilters): boolean {
    return (
        filters.search.trim() !== "" ||
        filters.language !== DEFAULT_FILTERS.language ||
        filters.sort !== DEFAULT_FILTERS.sort ||
        filters.showForks !== DEFAULT_FILTERS.showForks ||
        filters.showArchived !== DEFAULT_FILTERS.showArchived
    );
}

/** Vizinhos do projeto na ordem padrão da galeria (alfabética) — navegação do detalhe. */
export function siblingsOf(
    repositories: readonly Repository[],
    name: string,
): { previous: Repository | null; next: Repository | null } {
    const lista = filterAndSort(repositories, {
        ...DEFAULT_FILTERS,
        showForks: true,
        showArchived: true,
    });
    const i = lista.findIndex((repo) => repo.name === name);
    if (i === -1) return { previous: null, next: null };
    return { previous: lista[i - 1] ?? null, next: lista[i + 1] ?? null };
}

/**
 * Projetos relacionados: pontua por tópicos em comum (peso 3),
 * linguagens em comum (peso 1, e +2 se a principal coincide). Só entra
 * quem tem algo em comum — sem preenchimento aleatório. Desempate pelo
 * mais recente. Forks e arquivados ficam de fora.
 */
export function relatedRepos(
    repositories: readonly Repository[],
    alvo: Repository,
    limite = 3,
): Repository[] {
    const topicos = new Set(alvo.topics);
    const linguagens = new Set(alvo.languages.map((l) => l.name));
    const principal = alvo.primaryLanguage?.name;

    return repositories
        .filter((r) => r.name !== alvo.name && !r.isFork && !r.isArchived)
        .map((r) => {
            let pontos = 0;
            for (const t of r.topics) if (topicos.has(t)) pontos += 3;
            for (const l of r.languages)
                if (linguagens.has(l.name)) pontos += 1;
            if (principal && r.primaryLanguage?.name === principal) pontos += 2;
            return { r, pontos };
        })
        .filter((x) => x.pontos > 0)
        .sort(
            (a, b) =>
                b.pontos - a.pontos ||
                Date.parse(b.r.createdAt) - Date.parse(a.r.createdAt),
        )
        .slice(0, limite)
        .map((x) => x.r);
}

/**
 * Commits por semana nas últimas `semanas` semanas, da mais antiga para
 * a mais recente. Recebe as datas do último ano (até 100, vindas da API)
 * e conta em baldes de 7 dias terminando em `agora`.
 */
export function weeklyCommits(
    datas: readonly string[],
    semanas = 52,
    agora = Date.now(),
): number[] {
    const baldes = new Array<number>(semanas).fill(0);
    const SEMANA = 7 * MS_DIA;
    for (const d of datas) {
        const idade = agora - Date.parse(d);
        if (!(idade >= 0)) continue;
        const i = Math.floor(idade / SEMANA);
        if (i < semanas) baldes[semanas - 1 - i]++;
    }
    return baldes;
}
