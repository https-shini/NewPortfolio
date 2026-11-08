import {
    CACHE_CURTO,
    CACHE_PADRAO,
    GITHUB_REST,
    GITHUB_USER,
    headersGitHub,
    sinalComTempo,
} from "./_github.js";

/* ─────────────────────────────────────────────────────────
   /api/github-stats — Vercel Serverless Function
   ─────────────────────────────────────────────────────────
   Agrega métricas do GitHub usando um token que vive APENAS no
   servidor (process.env.GITHUB_TOKEN, configurado nas Environment
   Variables da Vercel). O token NUNCA é exposto ao navegador —
   o frontend consome somente os números já calculados.

   Usuário, cabeçalhos e leitura do token vêm de `_github.ts`,
   compartilhado com `/api/devhub` e `_releases.ts`.

   Sem o token a função continua respondendo: `repos` vem do endpoint
   público de usuário, mas `commits` usa a Search API, que sem
   autenticação é bloqueada por rate limit — e volta como null.

   POR QUE ESTE ARQUIVO MORA NA RAIZ DO REPOSITÓRIO:
   o Root Directory do projeto na Vercel é a raiz, e é a partir dela
   que ela procura a pasta `api/`. Mesma razão do vercel.json.
───────────────────────────────────────────────────────── */

interface VercelRequest {
    query: Record<string, string | string[]>;
}
interface VercelResponse {
    setHeader(name: string, value: string): void;
    status(code: number): VercelResponse;
    json(body: unknown): void;
}

export default async function handler(
    _req: VercelRequest,
    res: VercelResponse,
): Promise<void> {
    const headers = headersGitHub();

    try {
        const [commitsRes, userRes] = await Promise.all([
            fetch(
                `${GITHUB_REST}/search/commits?q=author:${GITHUB_USER}&per_page=1`,
                { headers, signal: sinalComTempo() },
            ),
            fetch(`${GITHUB_REST}/users/${GITHUB_USER}`, {
                headers,
                signal: sinalComTempo(),
            }),
        ]);

        const commitsJson = commitsRes.ok
            ? ((await commitsRes.json()) as { total_count?: number })
            : null;
        const userJson = userRes.ok
            ? ((await userRes.json()) as { public_repos?: number })
            : null;

        const commits = commitsJson?.total_count ?? null;
        const repos = userJson?.public_repos ?? null;

        /* Resposta incompleta (rate limit, falha de um dos dois endpoints)
           fica só um minuto na CDN: antes ela ficava uma hora — e mais um
           dia como stale —, prendendo os números no fallback. */
        res.setHeader(
            "Cache-Control",
            commits === null || repos === null ? CACHE_CURTO : CACHE_PADRAO,
        );
        res.status(200).json({ commits, repos });
    } catch {
        /* Falha de rede/API → devolve nulos; o frontend usa o fallback. */
        res.setHeader("Cache-Control", CACHE_CURTO);
        res.status(200).json({ commits: null, repos: null });
    }
}
