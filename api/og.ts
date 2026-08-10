import { ImageResponse } from "@vercel/og";
import { RELEASE_NOTES } from "../apps/web/src/shared/config/releaseNotes.js";

/* ─────────────────────────────────────────────────────────
   /api/og — imagem de compartilhamento por versão
   ─────────────────────────────────────────────────────────
   Sem JSX de propósito. O Satori aceita a árvore de elementos
   como objeto puro, e escrever assim evita trazer o React para
   o package.json da raiz só para satisfazer o transformador —
   o cliente segue com duas dependências, e a única do servidor
   é a que desenha a imagem.

   O layout é deliberadamente pobre: um cartão escuro, o número
   da versão grande, o título abaixo, o domínio no rodapé. Um
   cartão de compartilhamento é lido de relance, num feed, em
   miniatura — o que não puder ser lido a 300px de largura não
   deveria estar nele.
───────────────────────────────────────────────────────── */

const FUNDO = "#070d19";
const MARCA = "#f43f5e";
const TEXTO = "#f8fafc";
const APAGADO = "#8593a9";

/* Mesma forma das outras funções de api/. Node, e não edge: assim a
   variante do rasterizador usada aqui é a mesma que o teste exercita —
   o build edge do @vercel/og troca o resvg nativo por WebAssembly, e
   validar um caminho enquanto se publica o outro não é validação. */
interface VercelRequest {
    url?: string;
    headers: Record<string, string | string[] | undefined>;
}
interface VercelResponse {
    setHeader(name: string, value: string): void;
    status(code: number): VercelResponse;
    send(body: Buffer): void;
}

type Estilo = Record<string, string | number>;
interface Elemento {
    type: string;
    key: string | null;
    props: { style?: Estilo; children?: unknown };
}

/** Constrói um nó no formato que o Satori espera, sem JSX. */
function caixa(style: Estilo, children?: unknown): Elemento {
    /* O Satori exige display explícito em qualquer elemento com mais de
       um filho, e falha em vez de adivinhar. Declarar aqui evita repetir
       `display: "flex"` em cada chamada e esquecer numa delas. */
    return {
        type: "div",
        key: null,
        props: { style: { display: "flex", ...style }, children },
    };
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
): Promise<void> {
    /* No runtime Node o `url` chega relativo; a base é descartável, serve
       só para o parser aceitar. */
    const { searchParams } = new URL(req.url ?? "/", "http://localhost");
    const pedida = searchParams.get("v")?.replace(/^v/i, "") ?? "";

    const entrada = RELEASE_NOTES.find((r) => r.version === pedida);

    /* Versão desconhecida ainda rende um cartão: pode ser uma release
       publicada no GitHub depois do último deploy, e um cartão genérico
       é melhor do que uma imagem faltando. */
    const titulo = entrada?.title.pt ?? "Notas de versão";
    const data = entrada?.date ?? "";

    const arvore = caixa(
        {
            width: "100%",
            height: "100%",
            flexDirection: "column",
            justifyContent: "space-between",
            background: FUNDO,
            padding: "72px 80px",
            fontFamily: "sans-serif",
        },
        [
            /* Faixa da marca — o único ornamento. */
            caixa({
                width: 120,
                height: 8,
                background: MARCA,
                borderRadius: 4,
            }),

            caixa({ flexDirection: "column" }, [
                ...(pedida
                    ? [
                          caixa(
                              {
                                  fontSize: 104,
                                  fontWeight: 700,
                                  color: TEXTO,
                                  letterSpacing: "-0.03em",
                                  lineHeight: 1,
                              },
                              `v${pedida}`,
                          ),
                      ]
                    : []),
                caixa(
                    {
                        fontSize: 44,
                        color: APAGADO,
                        marginTop: 24,
                        lineHeight: 1.25,
                        /* Título longo não pode empurrar o rodapé para
                           fora do cartão. */
                        maxHeight: 140,
                        overflow: "hidden",
                    },
                    titulo,
                ),
            ]),

            caixa(
                {
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    fontSize: 28,
                    color: APAGADO,
                },
                [caixa({ color: TEXTO }, "gcruz.dev.br"), caixa({}, data)],
            ),
        ],
    );

    const imagem = new ImageResponse(arvore as never, {
        width: 1200,
        height: 630,
    });

    res.setHeader("Content-Type", "image/png");
    res.setHeader(
        "Cache-Control",
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    );
    res.status(200).send(Buffer.from(await imagem.arrayBuffer()));
}
