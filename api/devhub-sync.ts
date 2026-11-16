import { timingSafeEqual } from "node:crypto";
import { obterStore, storeConfigurado } from "./_devhub-store.js";
import { sincronizar } from "./_devhub-sync.js";

/* ─────────────────────────────────────────────────────────
   /api/devhub-sync — sincroniza o DevHub com o GitHub
   ─────────────────────────────────────────────────────────
   Chamado de duas formas, com a MESMA autorização:

     · pelo Vercel Cron, de hora em hora (`0 * * * *`, ver
       vercel.json). A Vercel envia
       `Authorization: Bearer $CRON_SECRET` sozinha;
     · à mão, para forçar uma sincronização:
           curl -X POST https://gcruz.dev.br/api/devhub-sync \
                -H "Authorization: Bearer $CRON_SECRET"

   Horário: o cron da Vercel roda em UTC. `0 * * * *` dispara em
   toda hora cheia UTC, que é também hora cheia em
   America/Sao_Paulo — o fuso é UTC-3 fixo, sem horário de verão
   desde 2019. Se o horário de verão voltar, continua sendo hora
   cheia (UTC-2 também é deslocamento inteiro).

   Sem `CRON_SECRET` configurado, o endpoint se recusa a rodar:
   uma rota pública que dispara consultas ao GitHub seria
   justamente o que esta mudança remove.
───────────────────────────────────────────────────────── */

interface Requisicao {
    method?: string;
    headers: Record<string, string | string[] | undefined>;
}

interface Resposta {
    setHeader(name: string, value: string): void;
    status(code: number): Resposta;
    json(body: unknown): void;
}

/** Compara em tempo constante, para não vazar o segredo pelo relógio. */
export function autorizado(cabecalho: unknown, segredo: string): boolean {
    if (typeof cabecalho !== "string" || !segredo) return false;
    const esperado = Buffer.from(`Bearer ${segredo}`);
    const recebido = Buffer.from(cabecalho);
    return (
        esperado.length === recebido.length &&
        timingSafeEqual(esperado, recebido)
    );
}

export default async function handler(
    req: Requisicao,
    res: Resposta,
): Promise<void> {
    res.setHeader("Cache-Control", "no-store");

    if (req.method && req.method !== "GET" && req.method !== "POST") {
        res.setHeader("Allow", "GET, POST");
        res.status(405).json({ error: { code: "metodo_nao_permitido" } });
        return;
    }

    const segredo = process.env.CRON_SECRET ?? "";
    if (!segredo) {
        res.status(503).json({ error: { code: "nao_configurado" } });
        return;
    }
    if (!autorizado(req.headers.authorization, segredo)) {
        res.status(401).json({ error: { code: "nao_autorizado" } });
        return;
    }
    if (!storeConfigurado()) {
        /* Em memória, a sincronização morreria com a instância e o
           /api/devhub (outra instância) nunca a veria. */
        res.status(503).json({ error: { code: "store_nao_configurado" } });
        return;
    }

    const r = await sincronizar({ store: obterStore() });
    if (r.resultado === "ocupado") {
        res.status(409).json({ result: "busy" });
        return;
    }
    res.status(r.resultado === "ok" ? 200 : 502).json({
        result: r.resultado === "ok" ? "ok" : "failed",
        status: r.status,
    });
}
