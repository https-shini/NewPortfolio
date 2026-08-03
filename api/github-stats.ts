/* ─────────────────────────────────────────────────────────
   /api/github-stats — Vercel Serverless Function
   ─────────────────────────────────────────────────────────
   Agrega métricas do GitHub usando um token que vive APENAS no
   servidor (process.env.GITHUB_TOKEN, configurado nas Environment
   Variables da Vercel). O token NUNCA é exposto ao navegador —
   o frontend consome somente os números já calculados.

   Configuração na Vercel:
     Settings → Environment Variables → GITHUB_TOKEN
     (token fine-grained read-only; escopo público basta)

   Sem o token a função continua respondendo: `repos` vem do endpoint
   público de usuário, mas `commits` usa a Search API, que sem
   autenticação é bloqueada por rate limit — e volta como null.

   POR QUE ESTE ARQUIVO MORA NA RAIZ DO REPOSITÓRIO:
   o Root Directory do projeto na Vercel é a raiz, e é a partir dela
   que ela procura a pasta `api/`. Em `frontend/api/` o arquivo era
   ignorado e a rota respondia 404. Mesma razão do vercel.json.

   Fica fora de src/ — não entra no build do Vite nem no tsc do
   frontend; a Vercel compila esta função separadamente no deploy.
───────────────────────────────────────────────────────── */

interface VercelRequest {
    query: Record<string, string | string[]>;
}
interface VercelResponse {
    setHeader(name: string, value: string): void;
    status(code: number): VercelResponse;
    json(body: unknown): void;
}

/* Espelha PROFILE.githubUsername (frontend/src/shared/config/profile.ts).
   Não dá para importar: esta função é compilada pela Vercel, fora do
   build do frontend. Se mudar lá, mude aqui. */
const GITHUB_USER = "https-shini";

export default async function handler(
    _req: VercelRequest,
    res: VercelResponse,
): Promise<void> {
    const token = process.env.GITHUB_TOKEN;

    const headers: Record<string, string> = {
        Accept: "application/vnd.github+json",
        "User-Agent": "gcruz-portfolio",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
        const [commitsRes, userRes] = await Promise.all([
            fetch(
                `https://api.github.com/search/commits?q=author:${GITHUB_USER}&per_page=1`,
                { headers },
            ),
            fetch(`https://api.github.com/users/${GITHUB_USER}`, { headers }),
        ]);

        const commitsJson = commitsRes.ok
            ? ((await commitsRes.json()) as { total_count?: number })
            : null;
        const userJson = userRes.ok
            ? ((await userRes.json()) as { public_repos?: number })
            : null;

        const commits = commitsJson?.total_count ?? null;
        const repos = userJson?.public_repos ?? null;

        /* Cache na CDN da Vercel: 1h fresco + 1 dia servindo stale enquanto
           revalida — protege contra rate limit e reduz latência. */
        res.setHeader(
            "Cache-Control",
            "s-maxage=3600, stale-while-revalidate=86400",
        );
        res.status(200).json({ commits, repos });
    } catch {
        /* Falha de rede/API → devolve nulos; o frontend usa o fallback. */
        res.status(200).json({ commits: null, repos: null });
    }
}
