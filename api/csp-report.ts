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
        `diretiva=${v.diretiva ?? "?"}`,
        `bloqueado=${v.bloqueado ?? "?"}`,
        `documento=${v.documento ?? "?"}`,
    ].join(" · ");
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
        try {
            payload = JSON.parse(payload);
        } catch {
            console.warn(`[csp] corpo não-JSON: ${payload.slice(0, 500)}`);
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
        console.warn(
            `[csp] relatório em formato não reconhecido: ${JSON.stringify(payload).slice(0, 500)}`,
        );
    } else {
        for (const v of violacoes) console.warn(`[csp] ${linha(v)}`);
    }

    res.status(204).send();
}
