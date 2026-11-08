import type { GithubProfile } from "./types";

/* ─────────────────────────────────────────────────────────
   panorama.ts — os recortes do panorama, como somas exatas
   ─────────────────────────────────────────────────────────
   Tudo aqui é função pura sobre `GithubProfile` (op=profile). Nenhum
   número é estimado: cada filtro só soma o que a fonte detalha.

     · calendário oficial (`days`) → total por dia, inclui contagens
       privadas se o perfil assim configurar;
     · detalhamento (`activity`)   → contribuições PÚBLICAS por dia,
       tipo e repositório.

   Regra de ouro: sem recorte por tipo nem por repositório, o total vem
   do calendário oficial; com recorte, vem do detalhamento — e a
   interface diz qual dos dois está mostrando.
───────────────────────────────────────────────────────── */

export const MS_DIA = 86_400_000;
const DONO = "https-shini/";
/** Limite para desenhar o calendário (53 semanas). */
export const MAX_DIAS_CALENDARIO = 371;

export type Escopo = "own" | "forks" | "all";
export type TipoAtividade =
    "all" | "commits" | "pullRequests" | "issues" | "reviews";
export type Agrupamento = "day" | "week" | "month";

export type Periodo =
    | { kind: "30d" | "90d" | "12m" | "all" }
    | { kind: "year"; year: number }
    | { kind: "custom"; from: string; to: string };

export interface FiltrosPanorama {
    scope: Escopo;
    lang: string | null;
    repo: string | null;
    period: Periodo;
}

export interface FiltrosContribuicoes {
    period: Periodo;
    type: TipoAtividade;
    repo: string | null;
    group: Agrupamento;
}

export interface FiltrosLinguagens {
    scope: Escopo;
    repo: string | null;
    view: "bars" | "segmented";
}

export const LINGUAGENS_PADRAO: FiltrosLinguagens = {
    scope: "own",
    repo: null,
    view: "bars",
};

export const PANORAMA_PADRAO: FiltrosPanorama = {
    scope: "own",
    lang: null,
    repo: null,
    period: { kind: "12m" },
};

export const CONTRIB_PADRAO: FiltrosContribuicoes = {
    period: { kind: "12m" },
    type: "all",
    repo: null,
    group: "week",
};

/* ── Datas ↔ índices ───────────────────────────────────── */

export const dataDoDia = (p: GithubProfile, i: number) =>
    new Date(Date.parse(`${p.days.start}T00:00:00Z`) + i * MS_DIA)
        .toISOString()
        .slice(0, 10);

export const diaDaData = (p: GithubProfile, data: string) =>
    Math.round(
        (Date.parse(`${data}T00:00:00Z`) -
            Date.parse(`${p.days.start}T00:00:00Z`)) /
            MS_DIA,
    );

/** Último índice do calendário (hoje, no fuso do perfil). */
export const ultimoDia = (p: GithubProfile) => p.days.counts.length - 1;

/** Período → intervalo fechado de índices de dia, dentro do calendário. */
export function intervalo(
    p: GithubProfile,
    periodo: Periodo,
): [number, number] {
    const fim = ultimoDia(p);
    const limitar = (a: number, b: number): [number, number] => [
        Math.max(0, Math.min(a, fim)),
        Math.max(0, Math.min(b, fim)),
    ];
    switch (periodo.kind) {
        case "30d":
            return limitar(fim - 29, fim);
        case "90d":
            return limitar(fim - 89, fim);
        case "12m":
            return limitar(fim - 364, fim);
        case "all":
            return [0, fim];
        case "year":
            return limitar(
                diaDaData(p, `${periodo.year}-01-01`),
                diaDaData(p, `${periodo.year}-12-31`),
            );
        case "custom": {
            const a = diaDaData(p, periodo.from);
            const b = diaDaData(p, periodo.to);
            return limitar(Math.min(a, b), Math.max(a, b));
        }
    }
}

/** Anos com calendário, do mais recente ao mais antigo. */
export function anosDisponiveis(p: GithubProfile): number[] {
    const primeiro = Number(p.days.start.slice(0, 4));
    const ultimo = Number(dataDoDia(p, ultimoDia(p)).slice(0, 4));
    const out: number[] = [];
    for (let a = ultimo; a >= primeiro; a--) out.push(a);
    return out;
}

/* ── Repositórios do dono ──────────────────────────────── */

export function reposFiltrados(
    p: GithubProfile,
    f: Pick<FiltrosPanorama, "scope" | "lang" | "repo">,
) {
    const idLang = f.lang ? p.langs.findIndex((l) => l.name === f.lang) : -1;
    return p.repos.filter(
        (r) =>
            (f.scope === "all" || (f.scope === "forks" ? r.fork : !r.fork)) &&
            (!f.lang || r.languages.some(([id]) => id === idLang)) &&
            (!f.repo || r.name === f.repo),
    );
}

export interface FatiaLinguagem {
    name: string;
    color: string | null;
    percent: number;
    bytes: number;
}

/** Participação por bytes; até `max` linguagens + "Outras". */
export function linguagens(
    p: GithubProfile,
    repos: GithubProfile["repos"],
    max = 8,
): FatiaLinguagem[] {
    const soma = new Map<number, number>();
    for (const r of repos)
        for (const [id, size] of r.languages)
            soma.set(id, (soma.get(id) ?? 0) + size);
    const total = [...soma.values()].reduce((s, v) => s + v, 0);
    if (total === 0) return [];
    const pct = (v: number) => Math.round((v / total) * 1000) / 10;
    const ordenadas = [...soma.entries()].sort((a, b) => b[1] - a[1]);
    const topo = ordenadas.slice(0, max).map(([id, bytes]) => ({
        name: p.langs[id].name,
        color: p.langs[id].color,
        percent: pct(bytes),
        bytes,
    }));
    const resto = ordenadas.slice(max).reduce((s, [, v]) => s + v, 0);
    if (resto > 0)
        topo.push({
            name: "Outras",
            color: null,
            percent: pct(resto),
            bytes: resto,
        });
    return topo;
}

/* ── Atividade ─────────────────────────────────────────── */

export interface Totais {
    commits: number;
    pullRequests: number;
    issues: number;
    reviews: number;
    repos: number;
}

/**
 * Conjunto de repositórios do detalhamento aceitos por um filtro.
 * `null` = todos, inclusive os de terceiros em que houve contribuição.
 */
export function idsDeRepos(
    p: GithubProfile,
    nomes: string[] | null,
): Set<number> | null {
    if (!nomes) return null;
    const alvo = new Set(nomes);
    const ids = new Set<number>();
    p.activity.repos.forEach((full, id) => {
        if (alvo.has(full)) ids.add(id);
    });
    return ids;
}

/** Totais por tipo no intervalo, opcionalmente só em alguns repositórios. */
export function totais(
    p: GithubProfile,
    [a, b]: [number, number],
    ids: Set<number> | null,
): Totais {
    const ok = (dia: number, repo: number) =>
        dia >= a && dia <= b && (!ids || ids.has(repo));
    const usados = new Set<number>();
    let commits = 0;
    for (const [dia, repo, n] of p.activity.commits) {
        if (ok(dia, repo)) {
            commits += n;
            usados.add(repo);
        }
    }
    const contar = (lista: [number, number][]) => {
        let n = 0;
        for (const [dia, repo] of lista) {
            if (ok(dia, repo)) {
                n++;
                usados.add(repo);
            }
        }
        return n;
    };
    return {
        commits,
        pullRequests: contar(p.activity.pullRequests),
        issues: contar(p.activity.issues),
        reviews: contar(p.activity.reviews),
        repos: usados.size,
    };
}

/** Nome completo (dono/repo) de um repositório do dono. */
export const nomeCompleto = (nome: string) => DONO + nome;

/**
 * Série diária do intervalo. Sem tipo nem repositório: calendário
 * oficial. Com recorte: soma do detalhamento público.
 */
export function serieDiaria(
    p: GithubProfile,
    [a, b]: [number, number],
    tipo: TipoAtividade,
    ids: Set<number> | null,
): { counts: number[]; oficial: boolean } {
    if (tipo === "all" && !ids)
        return { counts: p.days.counts.slice(a, b + 1), oficial: true };
    const counts = new Array<number>(b - a + 1).fill(0);
    const somar = (dia: number, repo: number, n: number) => {
        if (dia >= a && dia <= b && (!ids || ids.has(repo)))
            counts[dia - a] += n;
    };
    if (tipo === "all" || tipo === "commits")
        for (const [d, r, n] of p.activity.commits) somar(d, r, n);
    for (const t of ["pullRequests", "issues", "reviews"] as const) {
        if (tipo === "all" || tipo === t)
            for (const [d, r] of p.activity[t]) somar(d, r, 1);
    }
    return { counts, oficial: false };
}

export interface Balde {
    key: string;
    start: string;
    end: string;
    total: number;
}

/** Agrupa uma série diária em dias, semanas (domingo) ou meses. */
export function agrupar(
    p: GithubProfile,
    inicio: number,
    counts: number[],
    g: Agrupamento,
): Balde[] {
    const out: Balde[] = [];
    let atual: Balde | null = null;
    counts.forEach((n, i) => {
        const data = dataDoDia(p, inicio + i);
        let key = data;
        if (g === "month") key = data.slice(0, 7);
        if (g === "week") {
            const dow = new Date(`${data}T00:00:00Z`).getUTCDay();
            key = dataDoDia(p, inicio + i - dow);
        }
        if (!atual || atual.key !== key) {
            atual = { key, start: data, end: data, total: 0 };
            out.push(atual);
        }
        atual.end = data;
        atual.total += n;
    });
    return out;
}

/** Resumo da série: total, dias ativos e melhor dia. */
export function resumo(p: GithubProfile, inicio: number, counts: number[]) {
    let total = 0;
    let ativos = 0;
    let melhor: { date: string; count: number } | null = null;
    counts.forEach((n, i) => {
        total += n;
        if (n > 0) {
            ativos++;
            if (!melhor || n > melhor.count)
                melhor = { date: dataDoDia(p, inicio + i), count: n };
        }
    });
    return {
        total,
        ativos,
        dias: counts.length,
        melhor: melhor as { date: string; count: number } | null,
    };
}

/* ── Selos (critérios próprios, explícitos) ─────────────── */

export interface Selo {
    id: string;
    value: number;
    levels: number[];
    level: number;
    next: number | null;
    progress: number;
}

function selo(id: string, value: number, levels: number[]): Selo {
    const level = levels.filter((l) => value >= l).length;
    const next = levels[level] ?? null;
    const anterior = level === 0 ? 0 : levels[level - 1];
    const progress =
        next === null
            ? 100
            : Math.round(((value - anterior) / (next - anterior)) * 100);
    return {
        id,
        value,
        levels,
        level,
        next,
        progress: Math.max(0, Math.min(100, progress)),
    };
}

/** Selos com faixas fixas sobre dados históricos verificáveis. */
export function selos(p: GithubProfile): Selo[] {
    const autorais = p.repos.filter((r) => !r.fork);
    const linguagensDistintas = new Set(
        autorais.flatMap((r) => r.languages.map(([id]) => id)),
    ).size;
    const commits = p.activity.commits.reduce((s, [, , n]) => s + n, 0);
    return [
        selo("contributions", p.streak.total, [500, 1000, 2500, 5000]),
        selo("commits", commits, [100, 500, 1000, 2500]),
        selo("pullRequests", p.pullRequests, [10, 25, 50, 100]),
        selo("issues", p.issues, [10, 25, 50, 100]),
        selo("reviews", p.activity.reviews.length, [1, 10, 25, 50]),
        selo("languages", linguagensDistintas, [3, 5, 8, 12]),
        selo("repos", autorais.length, [10, 25, 50, 100]),
        selo(
            "stars",
            autorais.reduce((s, r) => s + r.stars, 0),
            [1, 10, 50, 100],
        ),
        selo("streak", p.streak.longest.days, [7, 14, 30, 60]),
    ];
}

/** Quantos filtros diferem do padrão. */
export function ativos<T extends object>(atual: T, padrao: T): number {
    return (Object.keys(padrao) as (keyof T)[]).filter(
        (k) => JSON.stringify(atual[k]) !== JSON.stringify(padrao[k]),
    ).length;
}
