import { CHAVES, obterStore } from "./_devhub-store.js";
import type { Detalhe, Snapshot } from "./_devhub-sync.js";
import { ErroPublico, responderErro } from "./_github.js";
import type { Repository } from "./_github-repos.js";

/* ─────────────────────────────────────────────────────────
   /api/devhub — os projetos do GitHub para o site
   ─────────────────────────────────────────────────────────
   O cliente não descreve o que quer: ele NOMEIA uma operação de
   uma lista fechada e manda, no máximo, o nome de um repositório.

   Este endpoint NÃO consulta o GitHub. Ele lê o que a
   sincronização agendada (`/api/devhub-sync`, de hora em hora)
   gravou no store persistente:

       GitHub → devhub-sync (cron) → store → /api/devhub → cliente

   Assim nenhuma visita gasta cota do token nem espera o GitHub,
   e a home, o catálogo e a página de cada projeto leem a MESMA
   versão dos dados (o mesmo `lastSyncedAt`).
───────────────────────────────────────────────────────── */

interface VercelRequest {
    method?: string;
    query: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
    setHeader(name: string, value: string): void;
    status(code: number): VercelResponse;
    json(body: unknown): void;
}

/* ─────────────────────────────────────────────────────────
   Operações — a lista fechada
───────────────────────────────────────────────────────── */

const OPERACOES = [
    "catalog",
    "detail",
    "index",
    "pinned",
    "profile",
    "project",
    "readme",
    "stats",
] as const;
type Operacao = (typeof OPERACOES)[number];

/** Operações que exigem `name`; as demais o recusam. */
const EXIGEM_NOME: ReadonlySet<Operacao> = new Set([
    "detail",
    "project",
    "readme",
    "stats",
]);

/** Os únicos parâmetros aceitos. Qualquer outro é recusado. */
const PARAMS_ACEITOS = new Set(["op", "name"]);

/**
 * Nome de repositório, como o GitHub o permite: letras, dígitos,
 * ponto, hífen e sublinhado, até 100 caracteres.
 *
 * Validado ANTES de qualquer ida à rede: o que não casa aqui não vira
 * requisição, não gasta cota e não aparece em log nenhum.
 */
const NOME_VALIDO = /^[A-Za-z0-9._-]{1,100}$/;

/* ─────────────────────────────────────────────────────────
   Guarda de abuso
   ─────────────────────────────────────────────────────────
   Contador em memória, por instância, que reinicia a cada
   arranque frio. Não é um limitador distribuído e não tenta ser:
   impede o laço óbvio contra o endpoint, e o cache da CDN já
   absorve o tráfego normal.
───────────────────────────────────────────────────────── */

const JANELA_MS = 60_000;
const MAX_POR_JANELA = 60;
const chamadas: number[] = [];

function excedeuLimite(): boolean {
    const agora = Date.now();
    while (chamadas.length && chamadas[0] < agora - JANELA_MS) chamadas.shift();
    if (chamadas.length >= MAX_POR_JANELA) return true;
    chamadas.push(agora);
    return false;
}

/** Só para testes: zera a janela entre casos. */
export function _reiniciarLimite(): void {
    chamadas.length = 0;
}

/* ─────────────────────────────────────────────────────────
   Validação da entrada
───────────────────────────────────────────────────────── */

interface Pedido {
    op: Operacao;
    name?: string;
}

/** Um valor de query só é aceito como texto único, nunca repetido. */
function valorUnico(bruto: string | string[] | undefined): string | null {
    /* `?op=index&op=project` chega como array. Escolher um dos dois seria
       adivinhar a intenção; recusar é a única resposta honesta. */
    return typeof bruto === "string" ? bruto : null;
}

function interpretar(query: VercelRequest["query"]): Pedido {
    for (const chave of Object.keys(query)) {
        if (!PARAMS_ACEITOS.has(chave)) {
            throw new ErroPublico(
                "parametro_invalido",
                `parâmetro não reconhecido: ${chave.slice(0, 40)}`,
            );
        }
    }

    const op = valorUnico(query.op);
    if (!op) {
        throw new ErroPublico("operacao_invalida", "operação não informada");
    }
    if (!(OPERACOES as readonly string[]).includes(op)) {
        /* A mensagem não ecoa o que veio: dizer o que É aceito basta e não
           reflete texto escolhido pelo visitante. */
        throw new ErroPublico(
            "operacao_invalida",
            `operação desconhecida; aceitas: ${OPERACOES.join(", ")}`,
        );
    }
    const operacao = op as Operacao;

    const nomeBruto = query.name;
    if (!EXIGEM_NOME.has(operacao)) {
        if (nomeBruto !== undefined) {
            throw new ErroPublico(
                "parametro_invalido",
                `a operação "${operacao}" não aceita "name"`,
            );
        }
        return { op: operacao };
    }

    const name = valorUnico(nomeBruto);
    if (!name) {
        throw new ErroPublico(
            "parametro_invalido",
            `a operação "${operacao}" exige "name"`,
        );
    }
    if (!NOME_VALIDO.test(name)) {
        throw new ErroPublico(
            "parametro_invalido",
            "nome de repositório fora do formato aceito",
        );
    }

    return { op: operacao, name };
}

/* ─────────────────────────────────────────────────────────
   Leitura do store
   ─────────────────────────────────────────────────────────
   Cópia em memória por instância, por um minuto: o índice muda
   de hora em hora, e não faz sentido ir ao store a cada pedido.
   A CDN (CACHE_DEVHUB) absorve o resto.
───────────────────────────────────────────────────────── */

/** Na CDN: 5 min fresco; até 1 h servindo o anterior enquanto revalida. */
export const CACHE_DEVHUB = "s-maxage=300, stale-while-revalidate=3600";
const MEMORIA_MS = 60_000;

const memoria = new Map<string, { em: number; valor: unknown }>();

async function lerComMemoria<T>(chave: string): Promise<T | null> {
    const agora = Date.now();
    const guardado = memoria.get(chave);
    if (guardado && agora - guardado.em < MEMORIA_MS) {
        return guardado.valor as T | null;
    }
    const valor = await obterStore().ler<T>(chave);
    memoria.set(chave, { em: agora, valor });
    return valor;
}

/** Só para testes: esquece a cópia em memória. */
export function _esquecerMemoria(): void {
    memoria.clear();
}

async function snapshot(): Promise<Snapshot> {
    let s: Snapshot | null;
    try {
        s = await lerComMemoria<Snapshot>(CHAVES.snapshot);
    } catch (erro) {
        throw new ErroPublico(
            "sincronizacao_pendente",
            "dados dos projetos indisponíveis no momento",
            erro,
        );
    }
    if (!s) {
        throw new ErroPublico(
            "sincronizacao_pendente",
            "dados dos projetos ainda não sincronizados",
        );
    }
    return s;
}

/** O repositório pelo nome — o GitHub não diferencia caixa. */
function acharRepo(s: Snapshot, nome: string): Repository | null {
    const alvo = nome.toLowerCase();
    return (
        s.index.repositories.find((r) => r.name.toLowerCase() === alvo) ??
        s.pinned.repositories.find((r) => r.name.toLowerCase() === alvo) ??
        null
    );
}

async function detalhe(repo: Repository): Promise<Detalhe | null> {
    try {
        return await lerComMemoria<Detalhe>(CHAVES.detalhe(repo.name));
    } catch {
        /* Sem o detalhe, a página do projeto ainda vale: README e
           estatísticas aparecem como indisponíveis. */
        return null;
    }
}

async function responder(pedido: Pedido): Promise<unknown> {
    const s = await snapshot();
    const meta = { fetchedAt: s.lastSyncedAt, lastSyncedAt: s.lastSyncedAt };

    switch (pedido.op) {
        case "catalog":
            return { pinned: s.pinned, index: s.index, ...meta };
        case "index":
            return { ...s.index, ...meta };
        case "pinned":
            return { ...s.pinned, ...meta };
        case "profile":
            if (!s.profile) {
                throw new ErroPublico(
                    "sincronizacao_pendente",
                    "panorama ainda não sincronizado",
                );
            }
            return s.profile;
    }

    const repo = acharRepo(s, pedido.name!);
    if (!repo) {
        /* Inexistente e privado têm a mesma resposta: o acervo só tem
           públicos, e dizer mais revelaria o que existe. */
        return pedido.op === "readme" ? { html: null } : null;
    }
    const d = await detalhe(repo);
    switch (pedido.op) {
        case "project":
            return repo;
        case "readme":
            return { html: d?.readmeHtml ?? null };
        case "stats":
            return d?.stats ?? null;
        default:
            return {
                ...repo,
                readmeHtml: d?.readmeHtml ?? null,
                stats: d?.stats ?? null,
                lastSyncedAt: s.lastSyncedAt,
            };
    }
}

/* ─────────────────────────────────────────────────────────
   Handler
───────────────────────────────────────────────────────── */

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
): Promise<void> {
    if (req.method && req.method !== "GET" && req.method !== "HEAD") {
        res.setHeader("Allow", "GET, HEAD");
        responderErro(
            res,
            new ErroPublico("metodo_nao_permitido", "use GET"),
            "devhub",
        );
        return;
    }

    if (excedeuLimite()) {
        res.setHeader("Retry-After", "60");
        responderErro(
            res,
            new ErroPublico("limite_excedido", "muitas requisições"),
            "devhub",
        );
        return;
    }

    let pedido: Pedido;
    try {
        pedido = interpretar(req.query ?? {});
    } catch (erro) {
        responderErro(
            res,
            erro instanceof ErroPublico
                ? erro
                : new ErroPublico(
                      "parametro_invalido",
                      "requisição inválida",
                      erro,
                  ),
            "devhub",
        );
        return;
    }

    try {
        const corpo = await responder(pedido);

        res.setHeader("Cache-Control", CACHE_DEVHUB);
        res.status(200).json(corpo);
    } catch (erro) {
        /* Qualquer coisa que escape vira um erro público genérico. Nada do
           que o GitHub devolveu, e nada da pilha, atravessa esta linha. */
        responderErro(
            res,
            erro instanceof ErroPublico
                ? erro
                : new ErroPublico(
                      "sincronizacao_pendente",
                      "dados dos projetos indisponíveis no momento",
                      erro,
                  ),
            "devhub",
        );
    }
}
