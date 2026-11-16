import { readCache, writeCache } from "@/shared/lib/cache";
import type {
    DevhubCatalog,
    DevhubIndex,
    DevhubPinned,
    GithubProfile,
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

   Uma fonte, duas chamadas: a home, o catálogo e os relacionados
   leem o MESMO `op=catalog` (fixados + acervo da mesma
   sincronização); a página e o modal de um projeto leem um único
   `op=detail` (repositório + README + estatísticas). Pedidos
   iguais em andamento são compartilhados, não repetidos.
───────────────────────────────────────────────────────── */

const ENDPOINT = "/api/devhub";

/* 30 min: os dados mudam de hora em hora (sincronização agendada) e a
   função ainda cacheia na CDN. Isto evita a ida até ela a cada
   navegação dentro da aba. */
const TTL = 1000 * 60 * 30;

/* O sufixo de versão invalida caches gravados por um formato anterior. */
const CACHE_CATALOG = "devhub:v3:catalog";
const CACHE_PROFILE = "devhub:v3:profile";
const cacheDetalhe = (name: string) => `devhub:v3:detail:${name}`;

/** Pedidos em andamento, por chave de cache — dois consumidores, uma ida. */
const emAndamento = new Map<string, Promise<unknown>>();

function compartilhado<T>(chave: string, criar: () => Promise<T>): Promise<T> {
    const atual = emAndamento.get(chave);
    if (atual) return atual as Promise<T>;
    const nova = criar().finally(() => emAndamento.delete(chave));
    emAndamento.set(chave, nova);
    return nova;
}

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

function ehCatalogo(valor: unknown): valor is DevhubCatalog {
    return ehObjeto(valor) && ehIndice(valor.index) && ehFixados(valor.pinned);
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

    return compartilhado(chave, async () => {
        const resposta = await buscar();
        if (!guarda(resposta)) {
            throw new DevhubError(`resposta de ${chave} fora do contrato`);
        }
        writeCache(chave, resposta);
        return resposta;
    });
}

function ehPerfil(valor: unknown): valor is GithubProfile {
    return (
        ehObjeto(valor) &&
        typeof valor.login === "string" &&
        ehObjeto(valor.lastYear) &&
        ehObjeto(valor.days) &&
        Array.isArray(valor.days.counts) &&
        ehObjeto(valor.streak) &&
        Array.isArray(valor.langs) &&
        Array.isArray(valor.repos) &&
        ehObjeto(valor.activity) &&
        Array.isArray(valor.activity.repos) &&
        Array.isArray(valor.activity.commits)
    );
}

/** Panorama do perfil — números calculados no servidor. */
export function fetchProfile(): Promise<GithubProfile> {
    return comCache(CACHE_PROFILE, ehPerfil, () => pedir({ op: "profile" }));
}

/** Fixados + acervo, da mesma sincronização — a fonte da home e do catálogo. */
export function fetchCatalog(): Promise<DevhubCatalog> {
    return comCache(CACHE_CATALOG, ehCatalogo, () => pedir({ op: "catalog" }));
}

/** O acervo inteiro, com seguidores — galeria e métricas da /projetos. */
export async function fetchIndex(): Promise<DevhubIndex> {
    return (await fetchCatalog()).index;
}

/** Os fixados no perfil do GitHub — a vitrine da home. */
export async function fetchPinned(): Promise<DevhubPinned> {
    return (await fetchCatalog()).pinned;
}

function ehDetalhe(valor: unknown): valor is RepositoryDetail {
    if (!ehRepositorio(valor)) return false;
    const d = valor as Partial<RepositoryDetail>;
    return (
        (d.readmeHtml === null || typeof d.readmeHtml === "string") &&
        (d.stats == null || ehEstatisticas(d.stats))
    );
}

/**
 * Um projeto com a documentação já sincronizada: repositório, README
 * (convertido e sanitizado no servidor) e estatísticas, numa ida só.
 * `null` é o repositório que não existe (a página mostra "não
 * encontrado", não erro de rede).
 */
export async function fetchProject(
    name: string,
): Promise<RepositoryDetail | null> {
    const chave = cacheDetalhe(name);
    const emCache = readCache<unknown>(chave, TTL);
    if (ehDetalhe(emCache)) return emCache;

    return compartilhado(chave, async () => {
        const resposta = await pedir({ op: "detail", name });
        if (resposta === null) return null;
        if (!ehDetalhe(resposta)) {
            throw new DevhubError("resposta de `detail` fora do contrato");
        }
        const detalhe: RepositoryDetail = {
            ...resposta,
            stats: resposta.stats ?? null,
        };
        writeCache(chave, detalhe);
        return detalhe;
    });
}

/**
 * Estatísticas de um projeto (issues, PRs, commits, árvore, releases,
 * deployments, contribuidores) — do mesmo `op=detail` do projeto.
 * `null` = indisponível; quem mostra trata `null` como "indisponível",
 * nunca como zero.
 */
export async function fetchStats(
    name: string,
): Promise<RepositoryStats | null> {
    return (await fetchProject(name))?.stats ?? null;
}
