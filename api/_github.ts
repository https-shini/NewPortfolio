/* ─────────────────────────────────────────────────────────
   _github.ts — a única porta de saída para a API do GitHub
   ─────────────────────────────────────────────────────────
   Antes, três funções montavam sozinhas o mesmo cabeçalho, liam
   o token cada uma por conta própria e repetiam o usuário com o
   aviso "mudou lá, muda aqui": `github-stats.ts`, `_releases.ts`
   e, no fork do DevHub, `devhub.ts`. Três cópias de quem tem
   acesso ao token são três lugares onde ele pode vazar.

   Aqui ficam:
     · a identidade (usuário) e os endereços da API;
     · o ÚNICO ponto que lê `process.env.GITHUB_TOKEN`;
     · o transporte (GraphQL e REST) com tratamento de erro;
     · o erro público — o que pode atravessar para o cliente;
     · a política de cache da CDN.

   O prefixo `_` faz a Vercel tratar o arquivo como módulo, não
   como rota — mesmo arranjo de `_markdown.ts` e `_releases.ts`.
───────────────────────────────────────────────────────── */

/* Espelha PROFILE.githubUsername (apps/web/src/shared/config/profile.ts).
   As funções são compiladas pela Vercel fora do build do frontend, então
   não dá para importar de lá — mas agora há uma cópia só deste lado. */
export const GITHUB_USER = "https-shini";

export const GITHUB_GRAPHQL = "https://api.github.com/graphql";
export const GITHUB_REST = "https://api.github.com";

/**
 * Cache na CDN da Vercel: uma hora fresco e um dia servindo stale
 * enquanto revalida. Protege a cota do token (5.000 req/h, ou 60 sem
 * ele) e tira a latência do GitHub do caminho de quem visita.
 */
export const CACHE_PADRAO = "s-maxage=3600, stale-while-revalidate=86400";

/**
 * Cache de resposta INCOMPLETA (algum dado do GitHub veio vazio por
 * falha ou limite de taxa). Curto de propósito: uma oscilação de um
 * minuto não pode virar uma hora de números zerados para todo mundo.
 */
export const CACHE_CURTO = "s-maxage=60";

/**
 * Teto de espera por resposta do GitHub. Sem ele, uma lentidão do lado
 * de lá virava lentidão — ou estouro do tempo da função — do lado de cá,
 * inclusive no cartão de compartilhamento, que espera esta resposta.
 */
export const TEMPO_LIMITE_MS = 8000;

/** Sinal de cancelamento por tempo, um novo a cada requisição. */
export function sinalComTempo(ms = TEMPO_LIMITE_MS): AbortSignal {
    return AbortSignal.timeout(ms);
}

/** Há token configurado? Decide entre o caminho GraphQL e o REST público. */
export function temToken(): boolean {
    return Boolean(process.env.GITHUB_TOKEN);
}

/**
 * Cabeçalhos de toda requisição ao GitHub.
 *
 * O único lugar do processo em que o token é lido. Ele não entra em
 * nenhum objeto serializado numa resposta nem em log.
 */
export function headersGitHub(
    accept = "application/vnd.github+json",
): Record<string, string> {
    const headers: Record<string, string> = {
        Accept: accept,
        "User-Agent": "gcruz-portfolio",
    };
    const token = process.env.GITHUB_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
}

/* ─────────────────────────────────────────────────────────
   Erro público
───────────────────────────────────────────────────────── */

/** Código de erro — estável, pensado para o cliente ramificar. */
export type CodigoErro =
    | "metodo_nao_permitido"
    | "operacao_invalida"
    | "parametro_invalido"
    | "limite_excedido"
    | "upstream_indisponivel"
    | "upstream_invalido";

const STATUS_POR_CODIGO: Record<CodigoErro, number> = {
    metodo_nao_permitido: 405,
    operacao_invalida: 400,
    parametro_invalido: 400,
    limite_excedido: 429,
    upstream_indisponivel: 502,
    upstream_invalido: 502,
};

/**
 * Erro que PODE ir ao cliente. O construtor recebe só o que é seguro
 * publicar; o diagnóstico, quando existe, fica no log do servidor.
 *
 * Sem essa separação, a mensagem de uma exceção interna — caminho de
 * arquivo, corpo de resposta do GitHub, eventualmente um header de
 * autorização ecoado — acaba numa resposta HTTP por descuido.
 */
export class ErroPublico extends Error {
    /* Campos atribuídos à mão, e não parameter properties: aquela forma
       gera código, e o `--experimental-strip-types` do Node a recusa. */
    codigo: CodigoErro;
    detalheInterno?: unknown;

    constructor(codigo: CodigoErro, message: string, detalheInterno?: unknown) {
        super(message);
        this.name = "ErroPublico";
        this.codigo = codigo;
        this.detalheInterno = detalheInterno;
    }
}

export interface RespostaJson {
    setHeader(name: string, value: string): void;
    status(code: number): RespostaJson;
    json(body: unknown): void;
}

/** Status HTTP de um código de erro. */
export function statusDe(codigo: CodigoErro): number {
    return STATUS_POR_CODIGO[codigo];
}

/**
 * Responde um erro público. `origem` só rotula o log (`[devhub]`).
 *
 * O log leva a mensagem, nunca o objeto cru: `console.error(erro)` de
 * uma exceção de `fetch` pode arrastar a requisição inteira, incluindo
 * os headers que levam o token.
 */
export function responderErro(
    res: RespostaJson,
    erro: ErroPublico,
    origem: string,
): void {
    if (erro.detalheInterno !== undefined) {
        console.error(
            `[${origem}] ${erro.codigo}:`,
            erro.detalheInterno instanceof Error
                ? erro.detalheInterno.message
                : String(erro.detalheInterno),
        );
    }
    /* Erro não é cacheado: um 502 passageiro não pode ficar uma hora
       na CDN servindo a falha para todo mundo. */
    res.setHeader("Cache-Control", "no-store");
    res.status(statusDe(erro.codigo)).json({
        error: { code: erro.codigo, message: erro.message },
    });
}

/* ─────────────────────────────────────────────────────────
   Transporte
───────────────────────────────────────────────────────── */

/**
 * Executa uma consulta GraphQL FIXA. A consulta é sempre texto
 * constante do módulo que chama; só `variables` varia, e o GraphQL
 * as trata como dados — nunca como fragmento de consulta.
 */
export async function consultarGraphQL<T>(
    query: string,
    variables: Record<string, string | number | null>,
    opcoes: { aceitaNaoEncontrado?: boolean } = {},
): Promise<T> {
    let resposta: Response;
    try {
        resposta = await fetch(GITHUB_GRAPHQL, {
            method: "POST",
            headers: { ...headersGitHub(), "Content-Type": "application/json" },
            body: JSON.stringify({ query, variables }),
            signal: sinalComTempo(),
        });
    } catch (erro) {
        throw new ErroPublico(
            "upstream_indisponivel",
            "o GitHub não respondeu",
            erro,
        );
    }

    if (!resposta.ok) {
        throw new ErroPublico(
            "upstream_indisponivel",
            "o GitHub não respondeu",
            `GraphQL HTTP ${resposta.status}`,
        );
    }

    let corpo: { data?: T; errors?: { type?: string; message?: string }[] };
    try {
        corpo = (await resposta.json()) as typeof corpo;
    } catch (erro) {
        throw new ErroPublico(
            "upstream_invalido",
            "resposta do GitHub ilegível",
            erro,
        );
    }

    /* Repositório inexistente não vem como 404: o GraphQL responde 200,
       `data.repository: null` e um erro do tipo NOT_FOUND. Para quem pediu
       um item pelo nome, isso é a resposta "não existe" — não uma falha.
       Só vale quando TODOS os erros são NOT_FOUND e há `data`; qualquer
       outro erro misturado continua derrubando a consulta. */
    const soNaoEncontrado =
        opcoes.aceitaNaoEncontrado &&
        corpo.data !== undefined &&
        corpo.errors?.length &&
        corpo.errors.every((e) => e.type === "NOT_FOUND");

    /* O GraphQL responde 200 com `errors` no corpo. A mensagem vai para o
       log, não para o cliente: ela pode citar campos e escopos do token. */
    if (corpo.errors?.length && !soNaoEncontrado) {
        throw new ErroPublico(
            "upstream_invalido",
            "o GitHub recusou a consulta",
            corpo.errors.map((e) => e.message).join("; "),
        );
    }

    if (!corpo.data) {
        throw new ErroPublico(
            "upstream_invalido",
            "resposta do GitHub sem dados",
            "GraphQL devolveu data vazio",
        );
    }

    return corpo.data;
}

/**
 * GET na API REST. Devolve `null` em 404 — "não existe" é resposta,
 * não falha. `caminho` é sempre montado por quem chama a partir de
 * valores já validados.
 */
export async function buscarREST<T>(
    caminho: string,
    accept?: string,
): Promise<T | null> {
    let resposta: Response;
    try {
        resposta = await fetch(`${GITHUB_REST}${caminho}`, {
            headers: headersGitHub(accept),
            signal: sinalComTempo(),
        });
    } catch (erro) {
        throw new ErroPublico(
            "upstream_indisponivel",
            "o GitHub não respondeu",
            erro,
        );
    }

    if (resposta.status === 404) return null;

    if (!resposta.ok) {
        throw new ErroPublico(
            "upstream_indisponivel",
            "o GitHub não respondeu",
            `REST HTTP ${resposta.status} em ${caminho}`,
        );
    }

    try {
        return (
            accept?.includes("raw")
                ? await resposta.text()
                : await resposta.json()
        ) as T;
    } catch (erro) {
        throw new ErroPublico(
            "upstream_invalido",
            "resposta do GitHub ilegível",
            erro,
        );
    }
}
