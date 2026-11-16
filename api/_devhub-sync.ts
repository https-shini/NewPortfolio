import { renderReadme } from "./_devhub-markdown.js";
import { CHAVES, type DevhubStore } from "./_devhub-store.js";
import { buscarEstatisticas, type RepositoryStats } from "./_github-detalhe.js";
import { buscarPerfil, type PerfilGitHub } from "./_github-perfil.js";
import {
    buscarReadme,
    listarAcervo,
    listarFixados,
    type Repository,
} from "./_github-repos.js";
import { GITHUB_USER } from "./_github.js";

/* ─────────────────────────────────────────────────────────
   _devhub-sync.ts — a única coleta do DevHub no GitHub
   ─────────────────────────────────────────────────────────
   Antes, cada visita que não achava a resposta na CDN disparava
   consultas ao GitHub (acervo paginado, fixados, panorama, e por
   projeto README + estatísticas). Agora o GitHub só é consultado
   aqui, pelo agendamento de hora em hora ou pelo disparo manual,
   e o resultado vai para o store persistente. O `/api/devhub`
   só lê o store.

   Sequência de uma sincronização:
     1. adquire a trava (uma sincronização por vez);
     2. coleta tudo do GitHub;
     3. valida o índice ANTES de gravar qualquer coisa;
     4. grava o detalhe de cada projeto (README, estatísticas);
     5. grava o índice por último — é ele que "publica" a versão;
     6. registra o status (lastSyncedAt e erros) e solta a trava.

   Se 2 ou 3 falham, nada é gravado além do status: os últimos
   dados válidos continuam servindo. Falha num detalhe isolado
   não derruba a sincronização — aquele projeto mantém o detalhe
   anterior e o erro fica registrado.
───────────────────────────────────────────────────────── */

export const VERSAO_SNAPSHOT = 1;

/** O índice publicado: tudo o que a home, o catálogo e o panorama leem. */
export interface Snapshot {
    version: typeof VERSAO_SNAPSHOT;
    lastSyncedAt: string;
    pinned: { repositories: Repository[]; source: "pinned" | "recent" };
    index: { repositories: Repository[]; followers: number | null };
    profile: PerfilGitHub | null;
}

/** A documentação de um projeto, gravada à parte do índice. */
export interface Detalhe {
    name: string;
    syncedAt: string;
    readmeHtml: string | null;
    stats: RepositoryStats | null;
}

export interface ErroSync {
    escopo: string;
    mensagem: string;
}

export interface StatusSync {
    /** Última sincronização que PUBLICOU dados (pode ser antiga). */
    lastSyncedAt: string | null;
    lastAttemptAt: string;
    ok: boolean;
    durationMs: number;
    repositories: number | null;
    errors: ErroSync[];
}

export type ResultadoSync =
    | { resultado: "ok"; status: StatusSync }
    | { resultado: "falhou"; status: StatusSync }
    | { resultado: "ocupado" };

/** Uma sincronização travada há mais que isto é tida como abandonada. */
export const VALIDADE_TRAVA_MS = 15 * 60_000;
/** Quantos projetos têm o detalhe coletado em paralelo. */
const PARALELO = 6;
/** Abaixo desta fração do acervo anterior, a coleta é tida como parcial. */
const QUEDA_MAXIMA = 0.5;

/* ─────────────────────────────────────────────────────────
   Validação — o que não passa aqui não é gravado
───────────────────────────────────────────────────────── */

const URL_REPO = new RegExp(`^https://github\\.com/${GITHUB_USER}/`, "i");

function repoValido(r: unknown): r is Repository {
    if (typeof r !== "object" || r === null) return false;
    const x = r as Partial<Repository>;
    return (
        typeof x.name === "string" &&
        x.name.length > 0 &&
        typeof x.url === "string" &&
        URL_REPO.test(x.url) &&
        (x.homepageUrl === null || typeof x.homepageUrl === "string") &&
        Array.isArray(x.topics) &&
        Array.isArray(x.languages)
    );
}

/**
 * Confere o índice coletado. Devolve o motivo da recusa, ou `null`.
 * `anterior` permite recusar uma coleta que encolheu demais — sinal de
 * paginação interrompida, não de repositórios apagados em massa.
 */
export function validarSnapshot(
    s: Snapshot,
    anterior: Snapshot | null = null,
): string | null {
    if (s.version !== VERSAO_SNAPSHOT) return "versão desconhecida";
    if (!Number.isFinite(Date.parse(s.lastSyncedAt)))
        return "lastSyncedAt inválido";
    const repos = s.index?.repositories;
    if (!Array.isArray(repos) || repos.length === 0) return "acervo vazio";
    if (!repos.every(repoValido)) return "repositório fora do contrato";
    if (new Set(repos.map((r) => r.name)).size !== repos.length)
        return "repositório duplicado no acervo";
    const fixados = s.pinned?.repositories;
    if (!Array.isArray(fixados) || fixados.length > 6)
        return "fixados fora do contrato";
    if (!fixados.every(repoValido)) return "fixado fora do contrato";
    if (s.pinned.source !== "pinned" && s.pinned.source !== "recent")
        return "origem dos fixados desconhecida";
    const antes = anterior?.index?.repositories?.length ?? 0;
    if (antes > 0 && repos.length < antes * QUEDA_MAXIMA)
        return `acervo encolheu de ${antes} para ${repos.length}`;
    return null;
}

function mensagemDe(erro: unknown): string {
    /* Só a mensagem, curta. Nunca o objeto: uma exceção de `fetch` pode
       carregar a requisição, e com ela o cabeçalho do token. */
    const bruto = erro instanceof Error ? erro.message : String(erro ?? "erro");
    return bruto.slice(0, 300);
}

/* ─────────────────────────────────────────────────────────
   Coleta no GitHub
───────────────────────────────────────────────────────── */

export interface Coleta {
    snapshot: Snapshot;
    detalhes: Detalhe[];
    erros: ErroSync[];
}

/** Executa `fn` sobre `itens`, no máximo `limite` ao mesmo tempo. */
async function emParalelo<T>(
    itens: T[],
    limite: number,
    fn: (item: T) => Promise<void>,
): Promise<void> {
    let proximo = 0;
    const trabalhadores = Array.from(
        { length: Math.min(limite, itens.length) },
        async () => {
            while (proximo < itens.length) {
                const item = itens[proximo++];
                await fn(item);
            }
        },
    );
    await Promise.all(trabalhadores);
}

/** O README de um projeto já convertido e sanitizado. */
async function readmeHtml(nome: string): Promise<string | null> {
    const md = await buscarReadme(nome);
    return md === null
        ? null
        : renderReadme(md, { owner: GITHUB_USER, repo: nome });
}

export async function coletarDoGitHub(agora = new Date()): Promise<Coleta> {
    const erros: ErroSync[] = [];

    /* O acervo é indispensável: se falhar, a exceção sobe e a
       sincronização inteira é recusada. */
    const acervo = await listarAcervo();
    const fixados = await listarFixados(acervo.repositories);

    let profile: PerfilGitHub | null = null;
    try {
        profile = await buscarPerfil(agora);
    } catch (erro) {
        erros.push({ escopo: "profile", mensagem: mensagemDe(erro) });
    }

    const detalhes: Detalhe[] = [];
    await emParalelo(acervo.repositories, PARALELO, async (repo) => {
        try {
            const [html, stats] = await Promise.all([
                repo.hasReadme === false
                    ? Promise.resolve(null)
                    : readmeHtml(repo.name),
                buscarEstatisticas(repo.name, agora),
            ]);
            detalhes.push({
                name: repo.name,
                syncedAt: agora.toISOString(),
                readmeHtml: html,
                stats,
            });
        } catch (erro) {
            erros.push({
                escopo: `detail:${repo.name}`,
                mensagem: mensagemDe(erro),
            });
        }
    });

    return {
        snapshot: {
            version: VERSAO_SNAPSHOT,
            lastSyncedAt: agora.toISOString(),
            pinned: fixados,
            index: acervo,
            profile,
        },
        detalhes,
        erros,
    };
}

/* ─────────────────────────────────────────────────────────
   A sincronização
───────────────────────────────────────────────────────── */

export interface OpcoesSync {
    store: DevhubStore;
    coletar?: (agora: Date) => Promise<Coleta>;
    agora?: () => Date;
}

export async function sincronizar({
    store,
    coletar = coletarDoGitHub,
    agora = () => new Date(),
}: OpcoesSync): Promise<ResultadoSync> {
    const inicio = agora();
    if (!(await store.travar(CHAVES.trava, VALIDADE_TRAVA_MS, inicio))) {
        return { resultado: "ocupado" };
    }

    let anterior: Snapshot | null = null;
    let status: StatusSync;
    try {
        anterior = await store.ler<Snapshot>(CHAVES.snapshot);
        const coleta = await coletar(inicio);
        const motivo = validarSnapshot(coleta.snapshot, anterior);
        if (motivo) throw new Error(`coleta recusada: ${motivo}`);

        const erros = [...coleta.erros];
        for (const d of coleta.detalhes) {
            try {
                await store.gravar(CHAVES.detalhe(d.name), d);
            } catch (erro) {
                erros.push({
                    escopo: `store:${d.name}`,
                    mensagem: mensagemDe(erro),
                });
            }
        }
        /* O índice por último: só depois dele a nova versão "existe". */
        await store.gravar(CHAVES.snapshot, coleta.snapshot);

        status = {
            lastSyncedAt: coleta.snapshot.lastSyncedAt,
            lastAttemptAt: inicio.toISOString(),
            ok: true,
            durationMs: agora().getTime() - inicio.getTime(),
            repositories: coleta.snapshot.index.repositories.length,
            errors: erros,
        };
    } catch (erro) {
        status = {
            lastSyncedAt: anterior?.lastSyncedAt ?? null,
            lastAttemptAt: inicio.toISOString(),
            ok: false,
            durationMs: agora().getTime() - inicio.getTime(),
            repositories: anterior?.index?.repositories?.length ?? null,
            errors: [{ escopo: "sync", mensagem: mensagemDe(erro) }],
        };
        console.error("[devhub-sync] falhou:", status.errors[0].mensagem);
    }

    try {
        await store.gravar(CHAVES.status, status);
    } catch (erro) {
        console.error("[devhub-sync] status não gravado:", mensagemDe(erro));
    } finally {
        await store.destravar(CHAVES.trava);
    }

    return status.ok
        ? { resultado: "ok", status }
        : { resultado: "falhou", status };
}
