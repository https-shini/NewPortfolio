/* ─────────────────────────────────────────────────────────
   /api/csp-report — onde as violações de CSP são lidas
   ─────────────────────────────────────────────────────────
   A CSP entra em `Content-Security-Policy-Report-Only`: ela
   não bloqueia nada, só relata. Um relatório que ninguém lê
   não serve para calibrar política nenhuma, e hospedagem
   estática não tem onde guardá-lo — daí esta função.

   O destino é o log da função, legível no painel da Vercel.
   Não há banco, não há retenção própria, e é deliberado: o
   volume esperado é de dezenas de eventos durante a
   calibração, não um fluxo contínuo. Se algum dia virar
   fluxo, o lugar disso é um coletor de verdade, não um
   `console.warn`.

   ── Dois formatos, porque os navegadores discordam ──────

   `report-uri` (obsoleto na especificação, ainda o único que
   alguns navegadores honram) manda um objeto único com a
   chave `csp-report`, em `application/csp-report`.

   `report-to` / `Reporting-Endpoints` manda um ARRAY de
   relatórios em `application/reports+json`, cada um com
   `type` e `body`.

   Os dois são aceitos. Recusar um deles seria perder
   justamente os relatórios do navegador que a pessoa usa.

   ── Por que 204, e por que nunca um erro ────────────────

   O navegador não mostra falha de entrega de relatório a
   ninguém e não tenta de novo. Responder erro não informa
   nada nem a quem visita nem a quem mantém — só polui o log
   com o nosso próprio problema. Então: 204 sempre que o
   método está certo, e o que não deu para interpretar vai
   para o log como texto cru.
───────────────────────────────────────────────────────── */

interface VercelRequest {
    method?: string;
    headers: Record<string, string | string[] | undefined>;
    body?: unknown;
}
interface VercelResponse {
    setHeader(name: string, value: string): void;
    status(code: number): VercelResponse;
    send(body?: string): void;
}

/** O que interessa de uma violação, em uma linha legível. */
interface Violacao {
    documento?: string;
    diretiva?: string;
    bloqueado?: string;
    politica?: string;
}

/** Formato do `report-uri`: `{ "csp-report": { ... } }`. */
function deReportUri(payload: Record<string, unknown>): Violacao | null {
    const r = payload["csp-report"];
    if (!r || typeof r !== "object") return null;
    const c = r as Record<string, unknown>;
    return {
        documento: c["document-uri"] as string | undefined,
        diretiva: (c["effective-directive"] ?? c["violated-directive"]) as
            string | undefined,
        bloqueado: c["blocked-uri"] as string | undefined,
        politica: c["original-policy"] as string | undefined,
    };
}

/** Formato do `report-to`: um array de `{ type, body }`. */
function deReportTo(payload: unknown[]): Violacao[] {
    return payload
        .filter(
            (r): r is Record<string, unknown> =>
                !!r && typeof r === "object" && !Array.isArray(r),
        )
        .filter((r) => r.type === "csp-violation" || r.type === undefined)
        .map((r) => {
            const b = (r.body ?? {}) as Record<string, unknown>;
            return {
                documento: b.documentURL as string | undefined,
                diretiva: b.effectiveDirective as string | undefined,
                bloqueado: b.blockedURL as string | undefined,
                politica: b.originalPolicy as string | undefined,
            };
        });
}

/**
 * A política inteira vem em todo relatório e tem centenas de caracteres.
 * No log ela repetiria a mesma coisa em cada linha e enterraria o que
 * muda, que é a diretiva e o recurso bloqueado. Fica de fora.
 */
function linha(v: Violacao): string {
    return [
        `diretiva=${limpo(v.diretiva)}`,
        `bloqueado=${limpo(v.bloqueado)}`,
        `documento=${limpo(v.documento)}`,
    ].join(" · ");
}

/* ── Limites ─────────────────────────────────────────────────
   O endpoint é público e não autenticado — é assim que relatório de
   CSP funciona. Sem teto, qualquer um podia mandar um array com
   milhares de "violações" e encher o log (e a conta de invocações), ou
   pôr quebras de linha num campo para forjar linhas de log com cara de
   legítimas. Um navegador de verdade manda poucos relatórios por vez. */
const MAX_CORPO = 16 * 1024;
const MAX_VIOLACOES = 20;
const MAX_CAMPO = 300;

/** Campo de log: uma linha só, tamanho limitado, sem caractere de controle. */
function limpo(valor: unknown): string {
    if (typeof valor !== "string" || !valor) return "?";
    // eslint-disable-next-line no-control-regex
    return valor.replace(/[\u0000-\u001f\u007f]+/g, " ").slice(0, MAX_CAMPO);
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
): Promise<void> {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        res.status(405).send("Method Not Allowed");
        return;
    }

    /* O corpo chega já parseado quando o content-type é conhecido, e cru
       quando não é — `application/csp-report` e `application/reports+json`
       caem nesse segundo caso em alguns runtimes. */
    let payload: unknown = req.body;
    if (typeof payload === "string") {
        /* O corpo cru vai para um const próprio porque a reatribuição de
           `payload` dentro do try apaga o narrowing para string: no catch
           o TypeScript volta a ver `unknown`. Em execução funcionava por
           acidente da ordem de avaliação — a atribuição não completa
           quando o JSON.parse lança —, e acidente não é garantia. */
        const cru = payload;
        if (cru.length > MAX_CORPO) {
            console.warn(`[csp] corpo descartado: ${cru.length} bytes`);
            res.status(204).send();
            return;
        }
        try {
            payload = JSON.parse(cru);
        } catch {
            console.warn(`[csp] corpo não-JSON: ${limpo(cru)}`);
            res.status(204).send();
            return;
        }
    }

    const violacoes = Array.isArray(payload)
        ? deReportTo(payload)
        : payload && typeof payload === "object"
          ? [deReportUri(payload as Record<string, unknown>)].filter(
                (v): v is Violacao => v !== null,
            )
          : [];

    if (!violacoes.length) {
        /* `JSON.stringify(undefined)` devolve `undefined`, não uma string:
           um POST sem corpo derrubava a função aqui com TypeError (500). */
        const amostra = JSON.stringify(payload) ?? String(payload);
        console.warn(
            `[csp] relatório em formato não reconhecido: ${limpo(amostra)}`,
        );
    } else {
        for (const v of violacoes.slice(0, MAX_VIOLACOES)) {
            console.warn(`[csp] ${linha(v)}`);
        }
        if (violacoes.length > MAX_VIOLACOES) {
            console.warn(
                `[csp] ${violacoes.length - MAX_VIOLACOES} violação(ões) a mais descartada(s)`,
            );
        }
    }

    res.status(204).send();
}
