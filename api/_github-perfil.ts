import { consultarGraphQL, GITHUB_USER } from "./_github.js";

/* ─────────────────────────────────────────────────────────
   _github-perfil.ts — o panorama do perfil (op=profile)
   ─────────────────────────────────────────────────────────
   Substitui os cartões SVG de terceiros (readme-stats, streak-stats,
   profile-trophy) por números tirados direto da API GraphQL do
   GitHub, com o token do servidor:

     · totais do perfil   → repositórios públicos, estrelas e forks
                            recebidos, PRs e issues abertos (histórico)
     · últimos 12 meses   → contribuições, com o detalhamento que o
                            próprio GitHub dá (commits, PRs, issues,
                            revisões) e o calendário dia a dia
     · sequências         → calculadas aqui, sobre o calendário de
                            CADA ano desde a criação da conta
     · linguagens         → bytes por linguagem nos repositórios
                            públicos próprios, sem forks
     · marcos             → fatos dos mesmos dados (ano e dia mais
                            ativos, repositório mais estrelado)

   Nada de "rank", pontuação ou troféu: são classificações inventadas
   por cada serviço, não dados do GitHub.

   As consultas são texto fixo; só datas e o login entram como
   variáveis. Os cálculos são funções puras, exportadas para teste.
───────────────────────────────────────────────────────── */

const CONSULTA_PERFIL = `
query Perfil($login: String!) {
  user(login: $login) {
    login
    name
    createdAt
    followers { totalCount }
    pullRequests { totalCount }
    issues { totalCount }
    publicos: repositories(privacy: PUBLIC, ownerAffiliations: OWNER) { totalCount }
    proprios: repositories(
      privacy: PUBLIC
      ownerAffiliations: OWNER
      isFork: false
      first: 100
      orderBy: { field: STARGAZERS, direction: DESC }
    ) {
      totalCount
      nodes {
        name
        stargazerCount
        forkCount
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges { size node { name color } }
        }
      }
    }
    contributionsCollection {
      startedAt
      endedAt
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      totalPullRequestReviewContributions
      totalRepositoriesWithContributedCommits
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

/* Um ano de calendário por chamada: o GitHub limita cada
   contributionsCollection a, no máximo, um ano. */
const CONSULTA_ANO = `
query Ano($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

interface Dia {
    date: string;
    contributionCount: number;
}
interface Calendario {
    totalContributions?: number;
    weeks: { contributionDays: Dia[] }[];
}
interface RepoProprio {
    name: string;
    stargazerCount: number;
    forkCount: number;
    languages: {
        edges: { size: number; node: { name: string; color: string | null } }[];
    };
}

interface RespostaPerfil {
    user: {
        login: string;
        name: string | null;
        createdAt: string;
        followers: { totalCount: number };
        pullRequests: { totalCount: number };
        issues: { totalCount: number };
        publicos: { totalCount: number };
        proprios: {
            totalCount: number;
            nodes: RepoProprio[];
        };
        contributionsCollection: {
            startedAt: string;
            endedAt: string;
            totalCommitContributions: number;
            totalPullRequestContributions: number;
            totalIssueContributions: number;
            totalPullRequestReviewContributions: number;
            totalRepositoriesWithContributedCommits: number;
            restrictedContributionsCount: number;
            contributionCalendar: Calendario & { totalContributions: number };
        };
    } | null;
}
interface RespostaAno {
    user: { contributionsCollection: { contributionCalendar: Calendario } } | null;
}

/* ─────────────────────────────────────────────────────────
   Contrato de saída
───────────────────────────────────────────────────────── */

export interface Sequencia {
    days: number;
    start: string | null;
    end: string | null;
}

export interface LinguagemPerfil {
    name: string;
    color: string | null;
    percent: number;
}

export interface PerfilGitHub {
    login: string;
    name: string | null;
    createdAt: string;
    followers: number;
    publicRepos: number;
    ownRepos: number;
    stars: number;
    forks: number;
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
    /** Calendário dos últimos 12 meses: primeiro dia + contagem diária. */
    calendar: { start: string; counts: number[] };
    streak: {
        total: number;
        since: string;
        current: Sequencia;
        longest: Sequencia;
    };
    languages: LinguagemPerfil[];
    milestones: {
        busiestYear: { year: number; count: number } | null;
        busiestDay: { date: string; count: number } | null;
        topRepo: { name: string; stars: number } | null;
    };
    fetchedAt: string;
}

/* ─────────────────────────────────────────────────────────
   Cálculos puros
───────────────────────────────────────────────────────── */

/** Dias de um calendário, em ordem, sem datas repetidas. */
export function achatar(calendarios: Calendario[]): Dia[] {
    const porData = new Map<string, number>();
    for (const c of calendarios) {
        for (const w of c.weeks) {
            for (const d of w.contributionDays) porData.set(d.date, d.contributionCount);
        }
    }
    return [...porData.entries()]
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([date, contributionCount]) => ({ date, contributionCount }));
}

/**
 * Sequências sobre dias em ordem crescente.
 *
 * A sequência ATUAL segue a convenção do próprio GitHub (e do
 * streak-stats): um dia de hoje ainda sem contribuição não a quebra —
 * o dia não acabou. Ela conta a partir do último dia com atividade,
 * desde que seja hoje ou ontem.
 */
export function calcularSequencias(
    dias: Dia[],
    hoje: string,
): { current: Sequencia; longest: Sequencia; total: number } {
    const validos = dias.filter((d) => d.date <= hoje);
    const total = validos.reduce((s, d) => s + d.contributionCount, 0);

    let longest: Sequencia = { days: 0, start: null, end: null };
    let inicio: string | null = null;
    let corrida = 0;
    for (const d of validos) {
        if (d.contributionCount > 0) {
            if (corrida === 0) inicio = d.date;
            corrida++;
            if (corrida > longest.days) {
                longest = { days: corrida, start: inicio, end: d.date };
            }
        } else {
            corrida = 0;
        }
    }

    let current: Sequencia = { days: 0, start: null, end: null };
    let i = validos.length - 1;
    if (i >= 0 && validos[i].date === hoje && validos[i].contributionCount === 0) i--;
    if (i >= 0 && validos[i].contributionCount > 0) {
        const fim = validos[i].date;
        let n = 0;
        let ini = fim;
        while (i >= 0 && validos[i].contributionCount > 0) {
            ini = validos[i].date;
            n++;
            i--;
        }
        current = { days: n, start: ini, end: fim };
    }

    return { current, longest, total };
}

/** Participação por bytes; até `max` linguagens + "Outras". */
export function distribuirLinguagens(
    repos: RepoProprio[],
    max = 8,
): LinguagemPerfil[] {
    const soma = new Map<string, { size: number; color: string | null }>();
    for (const r of repos) {
        for (const e of r.languages.edges) {
            const atual = soma.get(e.node.name);
            soma.set(e.node.name, {
                size: (atual?.size ?? 0) + e.size,
                color: e.node.color,
            });
        }
    }
    const total = [...soma.values()].reduce((s, v) => s + v.size, 0);
    if (total === 0) return [];
    const ordenadas = [...soma.entries()].sort((a, b) => b[1].size - a[1].size);
    const topo = ordenadas.slice(0, max).map(([name, v]) => ({
        name,
        color: v.color,
        percent: Math.round((v.size / total) * 1000) / 10,
    }));
    const resto = ordenadas.slice(max).reduce((s, [, v]) => s + v.size, 0);
    if (resto > 0) {
        topo.push({
            name: "Outras",
            color: null,
            percent: Math.round((resto / total) * 1000) / 10,
        });
    }
    return topo;
}

/** Ano e dia de maior atividade, sobre todos os dias da conta. */
export function marcos(dias: Dia[]): {
    busiestYear: { year: number; count: number } | null;
    busiestDay: { date: string; count: number } | null;
} {
    const porAno = new Map<number, number>();
    let dia: { date: string; count: number } | null = null;
    for (const d of dias) {
        const ano = Number(d.date.slice(0, 4));
        porAno.set(ano, (porAno.get(ano) ?? 0) + d.contributionCount);
        if (d.contributionCount > 0 && (!dia || d.contributionCount > dia.count)) {
            dia = { date: d.date, count: d.contributionCount };
        }
    }
    let ano: { year: number; count: number } | null = null;
    for (const [year, count] of porAno) {
        if (count > 0 && (!ano || count > ano.count)) ano = { year, count };
    }
    return { busiestYear: ano, busiestDay: dia };
}

/** Janelas de um ano (UTC) desde a criação da conta até agora. */
export function janelasAnuais(criacao: string, agora: Date): { from: string; to: string }[] {
    const out: { from: string; to: string }[] = [];
    const inicio = new Date(criacao);
    for (let ano = inicio.getUTCFullYear(); ano <= agora.getUTCFullYear(); ano++) {
        const de = ano === inicio.getUTCFullYear() ? inicio : new Date(Date.UTC(ano, 0, 1));
        const ate = ano === agora.getUTCFullYear() ? agora : new Date(Date.UTC(ano, 11, 31, 23, 59, 59));
        out.push({ from: de.toISOString(), to: ate.toISOString() });
    }
    return out;
}

/* ─────────────────────────────────────────────────────────
   Busca
───────────────────────────────────────────────────────── */

export async function buscarPerfil(agora = new Date()): Promise<PerfilGitHub> {
    const dados = await consultarGraphQL<RespostaPerfil>(CONSULTA_PERFIL, {
        login: GITHUB_USER,
    });
    const u = dados.user;
    if (!u) throw new Error("perfil não encontrado");

    const anos = await Promise.all(
        janelasAnuais(u.createdAt, agora).map((j) =>
            consultarGraphQL<RespostaAno>(CONSULTA_ANO, {
                login: GITHUB_USER,
                from: j.from,
                to: j.to,
            }),
        ),
    );
    const todosOsDias = achatar(
        anos
            .map((a) => a.user?.contributionsCollection.contributionCalendar)
            .filter((c): c is Calendario => Boolean(c)),
    );

    const cc = u.contributionsCollection;
    const ultimoAno = achatar([cc.contributionCalendar]);
    const hoje = agora.toISOString().slice(0, 10);
    const seq = calcularSequencias(todosOsDias, hoje);
    const repos = u.proprios.nodes;
    const topo = repos[0];

    return {
        login: u.login,
        name: u.name,
        createdAt: u.createdAt,
        followers: u.followers.totalCount,
        publicRepos: u.publicos.totalCount,
        ownRepos: u.proprios.totalCount,
        stars: repos.reduce((s, r) => s + r.stargazerCount, 0),
        forks: repos.reduce((s, r) => s + r.forkCount, 0),
        pullRequests: u.pullRequests.totalCount,
        issues: u.issues.totalCount,
        lastYear: {
            from: cc.startedAt,
            to: cc.endedAt,
            contributions: cc.contributionCalendar.totalContributions,
            commits: cc.totalCommitContributions,
            pullRequests: cc.totalPullRequestContributions,
            issues: cc.totalIssueContributions,
            reviews: cc.totalPullRequestReviewContributions,
            reposContributed: cc.totalRepositoriesWithContributedCommits,
            restricted: cc.restrictedContributionsCount,
        },
        calendar: {
            start: ultimoAno[0]?.date ?? hoje,
            counts: ultimoAno.map((d) => d.contributionCount),
        },
        streak: {
            total: seq.total,
            since: u.createdAt,
            current: seq.current,
            longest: seq.longest,
        },
        languages: distribuirLinguagens(repos),
        milestones: {
            ...marcos(todosOsDias),
            topRepo:
                topo && topo.stargazerCount > 0
                    ? { name: topo.name, stars: topo.stargazerCount }
                    : null,
        },
        fetchedAt: agora.toISOString(),
    };
}
