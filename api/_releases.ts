import { renderMarkdown } from "./_markdown";

/* ─────────────────────────────────────────────────────────
   _releases — a busca das releases, compartilhada
   ─────────────────────────────────────────────────────────
   Duas funções precisam da mesma lista: /api/release-notes,
   que alimenta a timeline, e /api/feed, que emite o Atom.
   Sem isto, a segunda copiaria o token, o tratamento de erro
   e o formato — e as duas divergiriam na primeira correção
   feita só de um lado.
───────────────────────────────────────────────────────── */

export const GITHUB_USER = "https-shini";
export const GITHUB_REPO = "NewPortfolio";

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
    /** ISO completo, como o GitHub devolve. */
    date: string;
    title: string;
    html: string;
    url: string;
}

/**
 * Busca as releases publicadas. Devolve lista vazia em qualquer falha —
 * quem chama decide o que mostrar, e a camada local do site assume
 * sozinha quando não vem nada.
 */
export async function fetchGithubReleases(): Promise<ReleasePayload[]> {
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
            /* O corpo é o mesmo de "não há releases publicadas", então sem
               este log as duas situações ficam indistinguíveis de fora e
               uma queda real passaria despercebida. */
            console.warn(
                `[releases] GitHub respondeu ${response.status}` +
                    (token ? "" : " (sem GITHUB_TOKEN: limite de 60 req/h)"),
            );
            return [];
        }

        const data = (await response.json()) as GithubReleasePayload[];

        return data
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
    } catch (error) {
        console.error("[releases] falha ao buscar:", error);
        return [];
    }
}
