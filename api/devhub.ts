import { renderReadme } from "./_devhub-markdown.js";
import { buscarEstatisticas } from "./_github-detalhe.js";
import {
    CACHE_PADRAO,
    ErroPublico,
    GITHUB_USER,
    responderErro,
} from "./_github.js";
import {
    buscarReadme,
    buscarRepositorio,
    listarAcervo,
    listarFixados,
    type Repository,
} from "./_github-repos.js";
import { buscarPerfil } from "./_github-perfil.js";

/* ─────────────────────────────────────────────────────────
   /api/devhub — os projetos do GitHub para a /projetos
   ─────────────────────────────────────────────────────────
   O cliente não descreve o que quer: ele NOMEIA uma operação de
   uma lista fechada e manda, no máximo, o nome de um repositório.
   A consulta é montada no servidor, a partir de texto fixo, e
   nada do que chega pela rede entra nela como fragmento de query.

       cliente → operação conhecida + parâmetro validado
               → consulta fixa → GitHub
               → normalização → contrato interno → cliente

   Migrado do fork NewDevHub. Transporte, token, erro público e
   normalização moram agora em `_github.ts` e `_github-repos.ts`,
   compartilhados com `github-stats.ts` e `_releases.ts`; aqui
   sobra só a fronteira HTTP: validar, despachar, responder.
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
   As operações
───────────────────────────────────────────────────────── */

async function opIndex(): Promise<{
    repositories: Repository[];
    followers: number | null;
    fetchedAt: string;
}> {
    return { ...(await listarAcervo()), fetchedAt: new Date().toISOString() };
}

/** Os fixados do perfil — a vitrine da home. */
async function opPinned(): Promise<{
    repositories: Repository[];
    source: "pinned" | "recent";
    fetchedAt: string;
}> {
    return { ...(await listarFixados()), fetchedAt: new Date().toISOString() };
}

/**
 * README em HTML seguro, convertido e sanitizado no servidor.
 *
 * Usa `_devhub-markdown.ts`, e não o `_markdown.ts` das notas de
 * versão: lá a entrada é texto meu e escapar tudo é a garantia mais
 * forte; aqui a entrada é README, que é metade HTML. O conversor
 * preserva o HTML do autor e o sanitizador reescreve cada tag a partir
 * de uma allowlist, com atributos e URLs conferidos.
 */
async function opReadme(name: string): Promise<{ html: string | null }> {
    const markdown = await buscarReadme(name);
    if (markdown === null) return { html: null };
    /* A origem vai junto porque caminho relativo em README aponta para o
       repositório — `./docs/banner.png` só vira imagem visível depois de
       reescrito para o arquivo cru no GitHub. */
    return { html: renderReadme(markdown, { owner: GITHUB_USER, repo: name }) };
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
        const corpo =
            pedido.op === "index"
                ? await opIndex()
                : pedido.op === "pinned"
                  ? await opPinned()
                  : pedido.op === "profile"
                    ? await buscarPerfil()
                    : pedido.op === "stats"
                      ? await buscarEstatisticas(pedido.name!)
                      : pedido.op === "project"
                        ? await buscarRepositorio(pedido.name!)
                        : await opReadme(pedido.name!);

        res.setHeader("Cache-Control", CACHE_PADRAO);
        res.status(200).json(corpo);
    } catch (erro) {
        /* Qualquer coisa que escape vira um erro público genérico. Nada do
           que o GitHub devolveu, e nada da pilha, atravessa esta linha. */
        responderErro(
            res,
            erro instanceof ErroPublico
                ? erro
                : new ErroPublico(
                      "upstream_indisponivel",
                      "não foi possível consultar o GitHub",
                      erro,
                  ),
            "devhub",
        );
    }
}
