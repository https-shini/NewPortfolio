import { GITHUB_USER, GITHUB_REPO } from "./_releases.js";
import { classificar } from "./downloads.js";

/* ─────────────────────────────────────────────────────────
   /api/baixar — entrega o instalador sem expor o repositório
   ─────────────────────────────────────────────────────────
   A página oferecia o `browser_download_url` que o GitHub devolve em
   cada asset. Esse endereço só é anônimo enquanto o repositório for
   público: num repositório privado ele responde 404 para quem não está
   autenticado, e "autenticado" não inclui o visitante do site.

   Como o repositório vai ser fechado, a distribuição não pode depender
   dele. Aqui o servidor faz o que o visitante não pode: pede o asset à
   API com o token e recebe de volta uma URL assinada e temporária, para
   a qual o navegador é redirecionado. O arquivo continua vindo da
   infraestrutura do GitHub — o que deixa de ser necessário é o
   repositório estar aberto.

   O token nunca sai daqui: o que vai para o navegador é a URL assinada,
   que vale por poucos minutos e só serve para aquele arquivo.
───────────────────────────────────────────────────────── */

interface VercelRequest {
    query: Record<string, string | string[]>;
}
interface VercelResponse {
    setHeader(name: string, value: string): void;
    status(code: number): VercelResponse;
    json(body: unknown): void;
    end(): void;
}

interface GithubAsset {
    id?: number;
    name?: string;
}
interface GithubRelease {
    draft?: boolean;
    assets?: GithubAsset[];
}

/**
 * O que este endpoint aceita entregar.
 *
 * Instaladores — os mesmos que a página lista, pela mesma função, para
 * que as duas nunca discordem sobre o que é um download.
 *
 * E os metadados de atualização: o electron-updater lê `latest*.yml`
 * para descobrir se há versão nova, e os `.blockmap` para baixar só a
 * diferença. Não aparecem na página, mas precisam ser alcançáveis pelo
 * mesmo caminho — senão a atualização automática volta a depender do
 * repositório aberto, que é justamente o que se está removendo.
 */
export function permitido(nome: string): boolean {
    if (classificar(nome)) return true;
    const n = nome.toLowerCase();
    return /^latest[^/]*\.yml$/.test(n) || n.endsWith(".blockmap");
}

/**
 * Nome de arquivo, e nada além disso.
 *
 * Sem esta checagem um `arquivo=../../outra-coisa` viraria caminho na
 * URL da API do GitHub. A lista de assets já limitaria o estrago, mas a
 * validação vem antes de qualquer requisição — barato, e não depende de
 * o próximo passo estar correto.
 */
function nomeValido(nome: string): boolean {
    return (
        nome.length > 0 &&
        nome.length <= 255 &&
        !nome.includes("/") &&
        !nome.includes("\\") &&
        !nome.includes("..") &&
        !nome.startsWith(".")
    );
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
): Promise<void> {
    const bruto = req.query.arquivo;
    const nome = Array.isArray(bruto) ? bruto[0] : bruto;

    if (!nome || !nomeValido(nome)) {
        res.status(400).json({
            erro: "parâmetro 'arquivo' ausente ou inválido",
        });
        return;
    }

    if (!permitido(nome)) {
        /* 404 e não 403: dizer "existe, mas você não pode" descreve o
           repositório para quem está sondando. */
        res.status(404).json({ erro: "arquivo não encontrado" });
        return;
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        /* Sem token não há como resolver um asset de repositório
           privado. Falhar dizendo isso é melhor que devolver 404 e
           deixar parecer que a release é que não existe. */
        console.error("[baixar] GITHUB_TOKEN ausente — download indisponível");
        res.status(503).json({ erro: "download temporariamente indisponível" });
        return;
    }

    const headers: Record<string, string> = {
        Accept: "application/vnd.github+json",
        "User-Agent": "gcruz-portfolio",
        Authorization: `Bearer ${token}`,
    };

    try {
        /* Todas as releases, não só a última: um link antigo — de um
           e-mail, de um favorito — continua funcionando enquanto o
           arquivo existir em alguma release. */
        const lista = await fetch(
            `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/releases?per_page=30`,
            { headers },
        );
        if (!lista.ok) {
            console.warn(`[baixar] GitHub respondeu ${lista.status} ao listar`);
            res.status(502).json({
                erro: "não foi possível localizar o arquivo",
            });
            return;
        }

        const releases = (await lista.json()) as GithubRelease[];
        let assetId: number | null = null;
        for (const r of releases) {
            if (r.draft) continue;
            const achado = (r.assets ?? []).find((a) => a.name === nome);
            if (achado?.id) {
                assetId = achado.id;
                break;
            }
        }

        if (assetId === null) {
            res.status(404).json({ erro: "arquivo não encontrado" });
            return;
        }

        /* `application/octet-stream` faz a API responder 302 para uma URL
           assinada em vez de devolver o JSON do asset. `redirect: manual`
           impede o fetch de segui-la — o que se quer é o endereço, para
           repassar ao navegador, e não os 100 MB passando por aqui. */
        const asset = await fetch(
            `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/releases/assets/${assetId}`,
            {
                headers: { ...headers, Accept: "application/octet-stream" },
                redirect: "manual",
            },
        );

        const destino = asset.headers.get("location");
        if (!destino) {
            console.warn(
                `[baixar] sem Location para o asset ${assetId} (status ${asset.status})`,
            );
            res.status(502).json({
                erro: "não foi possível preparar o download",
            });
            return;
        }

        /* A URL assinada expira em minutos. Guardá-la em CDN entregaria
           um endereço morto para todo mundo depois do primeiro acesso. */
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Location", destino);
        res.status(302).end();
    } catch (erro) {
        console.warn("[baixar] falha ao resolver o asset", erro);
        res.status(502).json({ erro: "não foi possível preparar o download" });
    }
}
