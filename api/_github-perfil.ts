import { consultarGraphQL, GITHUB_USER } from "./_github.js";

/* ─────────────────────────────────────────────────────────
   _github-perfil.ts — o panorama do perfil (op=profile)
   ─────────────────────────────────────────────────────────
   Números tirados direto da API GraphQL do GitHub, com o token do
   servidor, num formato que deixa o NAVEGADOR filtrar com exatidão:

     · repos     → todos os repositórios públicos do dono (autorais e
                   forks), com estrelas, forks e bytes por linguagem;
     · days      → o calendário oficial, dia a dia, desde a criação
                   da conta (total por dia, como o GitHub mostra);
     · activity  → cada contribuição pública por dia, TIPO (commits,
                   PRs, issues, revisões) e REPOSITÓRIO.

   Com isso, recortes por período, tipo, repositório e agrupamento são
   somas sobre dados reais, nunca estimativas.

   ── Por que janelas trimestrais ──────────────────────────────
   `commitContributionsByRepository` traz, por repositório, um nó por
   DIA com commits — até 100 nós por página. Um trimestre tem no máximo
   92 dias, então nenhum repositório estoura a página e não é preciso
   paginar conexões aninhadas (o que o GraphQL não faz por item). PRs,
   issues e revisões vêm até 100 por trimestre; se algum dia passar
   disso, `truncated` sobe e a interface avisa.

   ── Privacidade ──────────────────────────────────────────────
   O token pode enxergar repositórios privados. Toda contribuição em
   repositório privado é DESCARTADA do detalhamento — nem nome, nem
   contagem por repositório saem daqui. O calendário oficial pode
   incluir contagens privadas (se o perfil assim configurar); o total
   delas no último ano vai em `lastYear.restricted`, só como número.

   Sem "rank", pontuação ou troféus de terceiros. As consultas são
   texto fixo; só login e datas entram como variáveis.
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
    repositories(
      privacy: PUBLIC
      ownerAffiliations: OWNER
      first: 100
      orderBy: { field: STARGAZERS, direction: DESC }
    ) {
      nodes {
        name
        isFork
        stargazerCount
        forkCount
        createdAt
        primaryLanguage { name }
        languages(first: 12, orderBy: { field: SIZE, direction: DESC }) {
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
      contributionCalendar { totalContributions }
    }
  }
}`;

const CONSULTA_JANELA = `
query Janela($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        weeks { contributionDays { date contributionCount } }
      }
      commitContributionsByRepository(maxRepositories: 100) {
        repository { nameWithOwner isPrivate }
        contributions(first: 100) {
          pageInfo { hasNextPage }
          nodes { occurredAt commitCount }
        }
      }
      pullRequestContributions(first: 100) {
        pageInfo { hasNextPage }
        nodes { occurredAt pullRequest { repository { nameWithOwner isPrivate } } }
      }
      issueContributions(first: 100) {
        pageInfo { hasNextPage }
        nodes { occurredAt issue { repository { nameWithOwner isPrivate } } }
      }
      pullRequestReviewContributions(first: 100) {
        pageInfo { hasNextPage }
        nodes { occurredAt pullRequestReview { repository { nameWithOwner isPrivate } } }
      }
    }
  }
}`;

/* ─────────────────────────────────────────────────────────
   Formas de entrada (só o que é lido)
───────────────────────────────────────────────────────── */

interface Dia {
    date: string;
    contributionCount: number;
}
interface Calendario {
    weeks: { contributionDays: Dia[] }[];
}
interface RepoRef {
    nameWithOwner: string;
    isPrivate: boolean;
}
interface Pagina<T> {
    pageInfo: { hasNextPage: boolean };
    nodes: T[];
}
interface RepoBruto {
    name: string;
    isFork: boolean;
    stargazerCount: number;
    forkCount: number;
    createdAt: string;
    primaryLanguage: { name: string } | null;
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
        repositories: { nodes: RepoBruto[] };
        contributionsCollection: {
            startedAt: string;
            endedAt: string;
            totalCommitContributions: number;
            totalPullRequestContributions: number;
            totalIssueContributions: number;
            totalPullRequestReviewContributions: number;
            totalRepositoriesWithContributedCommits: number;
            restrictedContributionsCount: number;
            contributionCalendar: { totalContributions: number };
        };
    } | null;
}
export interface Janela {
    contributionCalendar: Calendario;
    commitContributionsByRepository: {
        repository: RepoRef;
        contributions: Pagina<{ occurredAt: string; commitCount: number }>;
    }[];
    pullRequestContributions: Pagina<{
        occurredAt: string;
        pullRequest: { repository: RepoRef };
    }>;
    issueContributions: Pagina<{
        occurredAt: string;
        issue: { repository: RepoRef };
    }>;
    pullRequestReviewContributions: Pagina<{
        occurredAt: string;
        pullRequestReview: { repository: RepoRef };
    }>;
}
interface RespostaJanela {
    user: { contributionsCollection: Janela } | null;
}

/* ─────────────────────────────────────────────────────────
   Contrato de saída
───────────────────────────────────────────────────────── */

export interface Sequencia {
    days: number;
    start: string | null;
    end: string | null;
}

export interface PerfilGitHub {
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
    /** Calendário oficial desde a criação da conta. */
    days: { start: string; counts: number[] };
    streak: {
        total: number;
        since: string;
        current: Sequencia;
        longest: Sequencia;
    };
    /** Dicionário de linguagens (índices usados em `repos`). */
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
    /** Contribuições públicas detalhadas: [dia, repositório(, quantidade)]. */
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

/* ─────────────────────────────────────────────────────────
   Cálculos puros
───────────────────────────────────────────────────────── */

/** Dias de um ou mais calendários, em ordem, sem datas repetidas. */
export function achatar(calendarios: Calendario[]): Dia[] {
    const porData = new Map<string, number>();
    for (const c of calendarios) {
        for (const w of c.weeks) {
            for (const d of w.contributionDays)
                porData.set(d.date, d.contributionCount);
        }
    }
    return [...porData.entries()]
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([date, contributionCount]) => ({ date, contributionCount }));
}

/**
 * Sequências sobre dias em ordem crescente. A ATUAL segue a convenção
 * do GitHub: um hoje ainda sem contribuição não a quebra.
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
            if (corrida > longest.days)
                longest = { days: corrida, start: inicio, end: d.date };
        } else {
            corrida = 0;
        }
    }

    let current: Sequencia = { days: 0, start: null, end: null };
    let i = validos.length - 1;
    if (
        i >= 0 &&
        validos[i].date === hoje &&
        validos[i].contributionCount === 0
    )
        i--;
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

/** Contagens diárias contíguas a partir do primeiro dia (lacunas = 0). */
export function denso(dias: Dia[]): { start: string; counts: number[] } {
    if (dias.length === 0) return { start: "", counts: [] };
    const start = dias[0].date;
    const base = Date.parse(`${start}T00:00:00Z`);
    const fim = Math.round(
        (Date.parse(`${dias[dias.length - 1].date}T00:00:00Z`) - base) /
            86_400_000,
    );
    const counts = new Array<number>(fim + 1).fill(0);
    for (const d of dias) {
        counts[
            Math.round((Date.parse(`${d.date}T00:00:00Z`) - base) / 86_400_000)
        ] = d.contributionCount;
    }
    return { start, counts };
}

/** Ano e dia de maior atividade. */
export function marcos(dias: Dia[]): {
    busiestYear: { year: number; count: number } | null;
    busiestDay: { date: string; count: number } | null;
} {
    const porAno = new Map<number, number>();
    let dia: { date: string; count: number } | null = null;
    for (const d of dias) {
        const ano = Number(d.date.slice(0, 4));
        porAno.set(ano, (porAno.get(ano) ?? 0) + d.contributionCount);
        if (
            d.contributionCount > 0 &&
            (!dia || d.contributionCount > dia.count)
        ) {
            dia = { date: d.date, count: d.contributionCount };
        }
    }
    let ano: { year: number; count: number } | null = null;
    for (const [year, count] of porAno) {
        if (count > 0 && (!ano || count > ano.count)) ano = { year, count };
    }
    return { busiestYear: ano, busiestDay: dia };
}

/**
 * Deslocamento do fuso do perfil, em minutos, lido do início da coleção
 * padrão (meia-noite local expressa em UTC: "…T03:00:00Z" → 180).
 */
export function deslocamentoDoFuso(startedAt: string): number {
    const d = new Date(startedAt);
    const min = d.getUTCHours() * 60 + d.getUTCMinutes();
    return min > 720 ? min - 1440 : min;
}

/** Data local (YYYY-MM-DD) de um instante, dado o deslocamento. */
export function dataLocal(iso: string, deslocamento: number): string {
    return new Date(Date.parse(iso) - deslocamento * 60_000)
        .toISOString()
        .slice(0, 10);
}

/** Trimestres (meia-noite local) da criação da conta até agora. */
export function janelasTrimestrais(
    criacao: string,
    agora: Date,
    deslocamento: number,
): { from: string; to: string }[] {
    const out: { from: string; to: string }[] = [];
    const c = new Date(Date.parse(criacao) - deslocamento * 60_000);
    let ano = c.getUTCFullYear();
    let tri = Math.floor(c.getUTCMonth() / 3);
    const local = (a: number, m: number) =>
        new Date(Date.UTC(a, m, 1) + deslocamento * 60_000);
    for (;;) {
        const de = local(ano, tri * 3);
        if (de.getTime() > agora.getTime()) break;
        const prox = local(
            ano + Math.floor((tri + 1) / 4),
            ((tri + 1) % 4) * 3,
        );
        const ate =
            prox.getTime() > agora.getTime()
                ? agora
                : new Date(prox.getTime() - 1000);
        out.push({ from: de.toISOString(), to: ate.toISOString() });
        tri++;
        if (tri === 4) {
            tri = 0;
            ano++;
        }
    }
    return out;
}

/**
 * Detalhamento das janelas: só repositórios públicos, índices de dia
 * relativos a `inicio`, repositórios num dicionário.
 */
export function detalhar(
    janelas: Janela[],
    inicio: string,
    deslocamento: number,
): PerfilGitHub["activity"] {
    const base = Date.parse(`${inicio}T00:00:00Z`);
    const indiceDia = (data: string) =>
        Math.round((Date.parse(`${data}T00:00:00Z`) - base) / 86_400_000);
    const repos: string[] = [];
    const idRepo = new Map<string, number>();
    const repo = (r: RepoRef) => {
        let id = idRepo.get(r.nameWithOwner);
        if (id === undefined) {
            id = repos.length;
            repos.push(r.nameWithOwner);
            idRepo.set(r.nameWithOwner, id);
        }
        return id;
    };
    const out: PerfilGitHub["activity"] = {
        repos,
        commits: [],
        pullRequests: [],
        issues: [],
        reviews: [],
        truncated: false,
    };
    for (const j of janelas) {
        for (const c of j.commitContributionsByRepository) {
            if (c.repository.isPrivate) continue;
            if (c.contributions.pageInfo.hasNextPage) out.truncated = true;
            const r = repo(c.repository);
            for (const n of c.contributions.nodes) {
                if (n.commitCount > 0) {
                    out.commits.push([
                        indiceDia(dataLocal(n.occurredAt, deslocamento)),
                        r,
                        n.commitCount,
                    ]);
                }
            }
        }
        const simples = <T extends { occurredAt: string }>(
            p: Pagina<T>,
            ref: (n: T) => RepoRef,
            destino: [number, number][],
        ) => {
            if (p.pageInfo.hasNextPage) out.truncated = true;
            for (const n of p.nodes) {
                const r = ref(n);
                if (r.isPrivate) continue;
                destino.push([
                    indiceDia(dataLocal(n.occurredAt, deslocamento)),
                    repo(r),
                ]);
            }
        };
        simples(
            j.pullRequestContributions,
            (n) => n.pullRequest.repository,
            out.pullRequests,
        );
        simples(j.issueContributions, (n) => n.issue.repository, out.issues);
        simples(
            j.pullRequestReviewContributions,
            (n) => n.pullRequestReview.repository,
            out.reviews,
        );
    }
    const porDia = (a: [number, ...number[]], b: [number, ...number[]]) =>
        a[0] - b[0];
    out.commits.sort(porDia);
    out.pullRequests.sort(porDia);
    out.issues.sort(porDia);
    out.reviews.sort(porDia);
    return out;
}

/** Repositórios com linguagens num dicionário compartilhado. */
export function normalizarRepos(nodes: RepoBruto[]): {
    langs: PerfilGitHub["langs"];
    repos: PerfilGitHub["repos"];
} {
    const langs: PerfilGitHub["langs"] = [];
    const idLang = new Map<string, number>();
    const lang = (name: string, color: string | null) => {
        let id = idLang.get(name);
        if (id === undefined) {
            id = langs.length;
            langs.push({ name, color });
            idLang.set(name, id);
        }
        return id;
    };
    const repos = nodes.map((r) => {
        const languages = r.languages.edges.map(
            (e) =>
                [lang(e.node.name, e.node.color), e.size] as [number, number],
        );
        const principal = r.primaryLanguage
            ? (idLang.get(r.primaryLanguage.name) ??
              lang(r.primaryLanguage.name, null))
            : null;
        return {
            name: r.name,
            fork: r.isFork,
            stars: r.stargazerCount,
            forks: r.forkCount,
            createdAt: r.createdAt,
            lang: principal,
            languages,
        };
    });
    return { langs, repos };
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
    const cc = u.contributionsCollection;
    const deslocamento = deslocamentoDoFuso(cc.startedAt);

    const janelas = await Promise.all(
        janelasTrimestrais(u.createdAt, agora, deslocamento).map(async (j) => {
            const r = await consultarGraphQL<RespostaJanela>(CONSULTA_JANELA, {
                login: GITHUB_USER,
                from: j.from,
                to: j.to,
            });
            return r.user?.contributionsCollection ?? null;
        }),
    );
    const validas = janelas.filter((j): j is Janela => j !== null);
    const todosOsDias = achatar(validas.map((j) => j.contributionCalendar));
    const hoje = dataLocal(agora.toISOString(), deslocamento);
    const seq = calcularSequencias(todosOsDias, hoje);
    const inicio = todosOsDias[0]?.date ?? hoje;
    const { langs, repos } = normalizarRepos(u.repositories.nodes);
    const topo = repos
        .filter((r) => !r.fork)
        .sort((a, b) => b.stars - a.stars)[0];

    return {
        login: u.login,
        name: u.name,
        createdAt: u.createdAt,
        followers: u.followers.totalCount,
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
        days: todosOsDias.length
            ? denso(todosOsDias)
            : { start: hoje, counts: [] },
        streak: {
            total: seq.total,
            since: u.createdAt,
            current: seq.current,
            longest: seq.longest,
        },
        langs,
        repos,
        activity: detalhar(validas, inicio, deslocamento),
        milestones: {
            ...marcos(todosOsDias),
            topRepo:
                topo && topo.stars > 0
                    ? { name: topo.name, stars: topo.stars }
                    : null,
        },
        fetchedAt: agora.toISOString(),
    };
}
