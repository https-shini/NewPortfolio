import { GITHUB_USER, GITHUB_REPO } from "./_releases.js";

/* ─────────────────────────────────────────────────────────
   /api/downloads — os instaladores da última versão
   ─────────────────────────────────────────────────────────
   A página de downloads podia trazer os links escritos no código. Não
   traz, e a razão é o que acontece na segunda release: alguém publica a
   v2.1.0, e a página continua oferecendo a v2.0.0 até que outra pessoa
   lembre de editar um arquivo e fazer deploy. Link de download velho é
   pior que link ausente — ele funciona, e entrega a coisa errada.

   Aqui a lista sai das GitHub Releases, que é onde o workflow de release
   já publica os artefatos. Uma fonte, atualizada por quem publica.

   Por que uma função e não `fetch` direto do navegador: a API do GitHub
   limita a 60 requisições por hora por IP sem token. Numa página que
   qualquer um abre, isso esgota rápido e o visitante seguinte vê a lista
   vazia. Do servidor, o token entra no cabeçalho e o CDN guarda a
   resposta — uma chamada ao GitHub serve milhares de visitas.
───────────────────────────────────────────────────────── */

interface VercelRequest {
    query: Record<string, string | string[]>;
}
interface VercelResponse {
    setHeader(name: string, value: string): void;
    status(code: number): VercelResponse;
    json(body: unknown): void;
}

interface GithubAsset {
    name?: string;
    size?: number;
    browser_download_url?: string;
    download_count?: number;
}

interface GithubRelease {
    tag_name?: string;
    published_at?: string;
    draft?: boolean;
    prerelease?: boolean;
    html_url?: string;
    assets?: GithubAsset[];
}

/** As plataformas que a página sabe apresentar. */
export type Plataforma = "windows" | "macos" | "linux" | "android";

export interface Arquivo {
    plataforma: Plataforma;
    /** Nome do arquivo como publicado — é o que a pessoa vai baixar. */
    nome: string;
    /** Formato, para a interface dizer "Instalador .exe" e não só "baixar". */
    formato: string;
    /** Arquitetura, quando o nome do arquivo a revela. */
    arquitetura: string | null;
    /** Bytes. A interface formata; aqui vai o número cru. */
    tamanho: number;
    url: string;
}

export interface Downloads {
    versao: string | null;
    publicadoEm: string | null;
    notasUrl: string | null;
    arquivos: Arquivo[];
}

/**
 * Deduz plataforma, formato e arquitetura do NOME do arquivo.
 *
 * O electron-builder e o Gradle nomeiam por convenção, e é essa
 * convenção que se lê aqui — em vez de exigir que quem publica mantenha
 * uma tabela paralela dizendo o que é cada asset. Um arquivo que não
 * casa com nada é ignorado em silêncio: metadados de atualização
 * (`latest.yml`, `blockmap`) são publicados junto e não são para baixar.
 */
export function classificar(nome: string): Omit<Arquivo, "tamanho" | "url"> | null {
    const n = nome.toLowerCase();

    /* Estes acompanham a release para o auto-update funcionar; não são
       instaladores e não devem aparecer para ninguém. */
    if (n.endsWith(".yml") || n.endsWith(".yaml") || n.endsWith(".blockmap")) {
        return null;
    }

    const arquitetura = /arm64|aarch64/.test(n)
        ? "arm64"
        : /x64|amd64|x86_64/.test(n)
          ? "x64"
          : null;

    if (n.endsWith(".exe")) {
        return { plataforma: "windows", nome, formato: "Instalador .exe", arquitetura };
    }
    if (n.endsWith(".dmg")) {
        return { plataforma: "macos", nome, formato: "Imagem .dmg", arquitetura };
    }
    if (n.endsWith(".appimage")) {
        return { plataforma: "linux", nome, formato: "AppImage", arquitetura };
    }
    if (n.endsWith(".deb")) {
        return { plataforma: "linux", nome, formato: "Pacote .deb", arquitetura };
    }
    if (n.endsWith(".apk")) {
        return { plataforma: "android", nome, formato: "APK", arquitetura };
    }
    return null;
}

export async function buscarDownloads(): Promise<Downloads> {
    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
        Accept: "application/vnd.github+json",
        "User-Agent": "gcruz-portfolio",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const vazio: Downloads = {
        versao: null,
        publicadoEm: null,
        notasUrl: null,
        arquivos: [],
    };

    try {
        const resposta = await fetch(
            `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/releases?per_page=10`,
            { headers },
        );
        if (!resposta.ok) {
            /* Mesmo motivo do _releases.ts: sem este log, "o GitHub caiu" e
               "ainda não há release" ficam indistinguíveis de fora. */
            console.warn(
                `[downloads] GitHub respondeu ${resposta.status}` +
                    (token ? "" : " (sem GITHUB_TOKEN: limite de 60 req/h)"),
            );
            return vazio;
        }

        const releases = (await resposta.json()) as GithubRelease[];

        /* A primeira release publicada QUE TENHA instalador. Uma release
           só de notas — como as que existem hoje — não deve fazer a
           página anunciar uma versão para a qual não há o que baixar. */
        for (const r of releases) {
            if (r.draft || r.prerelease || !r.tag_name) continue;

            const arquivos = (r.assets ?? [])
                .map((a) => {
                    if (!a.name || !a.browser_download_url) return null;
                    const meta = classificar(a.name);
                    if (!meta) return null;
                    return {
                        ...meta,
                        tamanho: a.size ?? 0,
                        url: a.browser_download_url,
                    } satisfies Arquivo;
                })
                .filter((a): a is Arquivo => a !== null);

            if (arquivos.length === 0) continue;

            return {
                versao: String(r.tag_name).replace(/^v/i, ""),
                publicadoEm: r.published_at ?? null,
                notasUrl: r.html_url ?? null,
                arquivos,
            };
        }

        return vazio;
    } catch (erro) {
        console.warn("[downloads] falha ao consultar o GitHub", erro);
        return vazio;
    }
}

export default async function handler(
    _req: VercelRequest,
    res: VercelResponse,
): Promise<void> {
    const dados = await buscarDownloads();

    /* Uma hora no CDN, e revalidação em segundo plano por um dia: uma
       release nova aparece em até uma hora sem que ninguém espere pela
       consulta ao GitHub. */
    res.setHeader(
        "Cache-Control",
        "s-maxage=3600, stale-while-revalidate=86400",
    );
    res.status(200).json(dados);
}
