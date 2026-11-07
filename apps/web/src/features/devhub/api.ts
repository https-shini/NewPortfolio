import { readCache, writeCache } from "@/shared/lib/cache";
import type {
    DevhubIndex,
    DevhubPinned,
    Repository,
    RepositoryDetail,
    RepositoryStats,
} from "@/features/devhub/types";

/* ─────────────────────────────────────────────────────────
   api.ts — o único lugar que fala com a rede pelo DevHub
   ─────────────────────────────────────────────────────────
   O cliente pede uma operação pelo NOME (`index`, `pinned`,
   `project`, `readme`) e passa, no máximo, o nome de um
   repositório. Quem monta a consulta ao GitHub é `/api/devhub`,
   no servidor, com o token que nunca sai de lá.

   Diferença em relação ao fork NewDevHub: lá, se a função
   falhasse, o navegador ia direto à API pública do GitHub. Isso
   saiu — a CSP do site só permite `connect-src 'self'`, e o
   servidor já tem o próprio caminho público quando falta token.
   Se a função não responde, a página mostra o estado de erro.
───────────────────────────────────────────────────────── */

const ENDPOINT = "/api/devhub";

/* 30 min: o acervo muda devagar e a função ainda cacheia na CDN.
   Isto evita a ida até ela a cada navegação dentro da aba. */
const TTL = 1000 * 60 * 30;

/* O sufixo de versão invalida caches gravados por um formato anterior. */
const CACHE_INDEX = "devhub:v2:index";
const CACHE_PINNED = "devhub:v2:pinned";
const CACHE_STATS = "devhub:v2:stats:";
const cacheProjeto = (name: string) => `devhub:v2:project:${name}`;

/** Falha de transporte ou de contrato — a página decide o que mostrar. */
export class DevhubError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DevhubError";
    }
}

async function pedir(params: Record<string, string>): Promise<unknown> {
    const url = `${ENDPOINT}?${new URLSearchParams(params)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new DevhubError(`${ENDPOINT} respondeu ${res.status}`);
    /* `unknown`, e não `T`: um 200 não promete a forma do corpo. */
    return (await res.json()) as unknown;
}

/* ─────────────────────────────────────────────────────────
   Guardas de contrato — conferem a forma, não cada campo
───────────────────────────────────────────────────────── */

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === "object" && valor !== null;
}

function ehRepositorio(valor: unknown): valor is Repository {
    return (
        ehObjeto(valor) &&
        typeof valor.name === "string" &&
        typeof valor.url === "string" &&
        Array.isArray(valor.languages) &&
        Array.isArray(valor.topics)
    );
}

function ehListaDeRepos(valor: unknown): boolean {
    return (
        ehObjeto(valor) &&
        Array.isArray(valor.repositories) &&
        valor.repositories.every(ehRepositorio)
    );
}

function ehIndice(valor: unknown): valor is DevhubIndex {
    return (
        ehListaDeRepos(valor) &&
        (typeof (valor as DevhubIndex).followers === "number" ||
            (valor as DevhubIndex).followers === null)
    );
}

function ehFixados(valor: unknown): valor is DevhubPinned {
    const source = ehObjeto(valor) ? valor.source : undefined;
    return (
        ehListaDeRepos(valor) && (source === "pinned" || source === "recent")
    );
}

function ehEstatisticas(valor: unknown): valor is RepositoryStats {
    return (
        ehObjeto(valor) &&
        typeof valor.openIssues === "number" &&
        typeof valor.branches === "number" &&
        ehObjeto(valor.releases) &&
        Array.isArray(valor.releases.latest)
    );
}

function ehReadme(valor: unknown): valor is { html: string | null } {
    return (
        ehObjeto(valor) &&
        (valor.html === null || typeof valor.html === "string")
    );
}

/* ─────────────────────────────────────────────────────────
   Operações
───────────────────────────────────────────────────────── */

/** Lê o cache, ou pede à função e grava. O cache também passa pelo guarda. */
async function comCache<T>(
    chave: string,
    guarda: (v: unknown) => v is T,
    buscar: () => Promise<unknown>,
): Promise<T> {
    const emCache = readCache<unknown>(chave, TTL);
    if (guarda(emCache)) return emCache;

    const resposta = await buscar();
    if (!guarda(resposta)) {
        throw new DevhubError(`resposta de ${chave} fora do contrato`);
    }
    writeCache(chave, resposta);
    return resposta;
}

/** O acervo inteiro, com seguidores — galeria e métricas da /projetos. */
export function fetchIndex(): Promise<DevhubIndex> {
    return comCache(CACHE_INDEX, ehIndice, () => pedir({ op: "index" }));
}

/** Os fixados no perfil do GitHub — a vitrine da home. */
export function fetchPinned(): Promise<DevhubPinned> {
    return comCache(CACHE_PINNED, ehFixados, () => pedir({ op: "pinned" }));
}

/**
 * Um projeto, com o README convertido e sanitizado no servidor.
 *
 * As duas operações vão em paralelo. O README é complemento: se só ele
 * falhar, a página ainda vale a visita, e a falha vira `readmeHtml: null`.
 * `null` como resultado é o repositório que não existe (a página mostra
 * "não encontrado", não erro de rede).
 */
export async function fetchProject(
    name: string,
): Promise<RepositoryDetail | null> {
    const chave = cacheProjeto(name);
    const emCache = readCache<unknown>(chave, TTL);
    if (ehRepositorio(emCache) && "readmeHtml" in emCache) {
        return emCache as RepositoryDetail;
    }

    const [repo, readme] = await Promise.all([
        pedir({ op: "project", name }),
        pedir({ op: "readme", name }).catch(() => null),
    ]);

    if (repo === null) return null;
    if (!ehRepositorio(repo)) {
        throw new DevhubError("resposta de `project` fora do contrato");
    }

    const detalhe: RepositoryDetail = {
        ...repo,
        readmeHtml: ehReadme(readme) ? readme.html : null,
    };
    writeCache(chave, detalhe);
    return detalhe;
}

/**
 * Estatísticas de um projeto (issues, PRs, commits, árvore, releases,
 * contribuidores). `null` = indisponível — sem token no servidor ou
 * repositório não público. Quem mostra trata `null` como "indisponível",
 * nunca como zero.
 */
export async function fetchStats(
    name: string,
): Promise<RepositoryStats | null> {
    const chave = CACHE_STATS + name;
    const emCache = readCache<unknown>(chave, TTL);
    if (ehEstatisticas(emCache)) return emCache;

    const resposta = await pedir({ op: "stats", name });
    if (resposta === null) return null;
    if (!ehEstatisticas(resposta)) {
        throw new DevhubError(`resposta de ${chave} fora do contrato`);
    }
    writeCache(chave, resposta);
    return resposta;
}
