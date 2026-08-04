import { renderMarkdown } from "./_markdown";

/* ─────────────────────────────────────────────────────────
   /api/release-notes — Vercel Serverless Function
   ─────────────────────────────────────────────────────────
   Busca as releases do repositório e devolve, por versão, o
   corpo markdown já convertido em HTML seguro.

   Por que no servidor, e não no navegador:

   · o token (process.env.GITHUB_TOKEN) eleva o limite da API
     de 60 para 5.000 requisições/hora, e nunca sai daqui;
   · o cache da CDN atende todos os visitantes de uma vez, em
     vez de cada aba gastar uma requisição;
   · a conversão do markdown acontece aqui, então o cliente não
     baixa nenhum parser — o site segue com duas dependências.

   Fica em `api/` na raiz do repositório porque é de lá que a
   Vercel procura as funções (ver o Root Directory do projeto).
───────────────────────────────────────────────────────── */

interface VercelRequest {
    query: Record<string, string | string[]>;
}
interface VercelResponse {
    setHeader(name: string, value: string): void;
    status(code: number): VercelResponse;
    json(body: unknown): void;
}

const GITHUB_USER = "https-shini";
const GITHUB_REPO = "NewPortfolio";

/** Teto de releases lidas — a timeline pagina o resto. */
const PER_PAGE = 30;

interface GithubReleasePayload {
    tag_name?: string;
    name?: string | null;
    body?: string | null;
    published_at?: string | null;
    created_at?: string | null;
    draft?: boolean;
    html_url?: string;
}

export interface ReleasePayload {
    version: string;
    date: string;
    title: string;
    html: string;
    url: string;
}

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
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/releases?per_page=${PER_PAGE}`,
            { headers },
        );

        if (!response.ok) {
            /* 200 com lista vazia: para o frontend isso é "não há nada do
               GitHub", e a camada local assume sozinha. */
            res.setHeader("Cache-Control", "s-maxage=60");
            res.status(200).json({ releases: [] });
            return;
        }

        const data = (await response.json()) as GithubReleasePayload[];

        const releases: ReleasePayload[] = data
            /* Rascunhos não são públicos. */
            .filter((r) => !r.draft && Boolean(r.tag_name))
            .map((r) => ({
                version: String(r.tag_name).replace(/^v/i, ""),
                date: r.published_at ?? r.created_at ?? "",
                title: r.name?.trim() || String(r.tag_name),
                html: renderMarkdown(r.body ?? ""),
                url: r.html_url ?? "",
            }))
            .filter((r) => Boolean(r.date));

        /* 1 h fresco + 1 dia servindo o valor antigo enquanto revalida. */
        res.setHeader(
            "Cache-Control",
            "s-maxage=3600, stale-while-revalidate=86400",
        );
        res.status(200).json({ releases });
    } catch {
        /* Falha de rede — o frontend cai na camada local. */
        res.setHeader("Cache-Control", "s-maxage=60");
        res.status(200).json({ releases: [] });
    }
}
