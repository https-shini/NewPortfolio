import { fetchGithubReleases, type ReleasePayload } from "./_releases";

/* ─────────────────────────────────────────────────────────
   /api/release-notes — Vercel Serverless Function
   ─────────────────────────────────────────────────────────
   Devolve, por versão, o corpo markdown já convertido em HTML
   seguro. A busca em si vive em _releases.ts, compartilhada
   com o feed Atom.

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

export type { ReleasePayload };

export default async function handler(
    _req: VercelRequest,
    res: VercelResponse,
): Promise<void> {
    const releases = await fetchGithubReleases();

    /* Lista vazia é resposta legítima: para o frontend significa "não há
       nada do GitHub", e a camada local assume sozinha. O cache curto
       nesse caso evita fixar uma falha temporária por uma hora. */
    res.setHeader(
        "Cache-Control",
        releases.length
            ? "s-maxage=3600, stale-while-revalidate=86400"
            : "s-maxage=60",
    );
    res.status(200).json({ releases });
}
