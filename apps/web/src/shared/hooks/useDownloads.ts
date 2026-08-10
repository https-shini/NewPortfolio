import { useEffect, useState } from "react";
import { readCache, writeCache } from "@/shared/lib/cache";
import type { Plataforma } from "@/shared/lib/platform";

/* ─────────────────────────────────────────────────────────
   useDownloads — os instaladores da última versão
   ─────────────────────────────────────────────────────────
   Consome /api/downloads, que já busca com token e classifica
   os assets por plataforma. Mesmo padrão do useReleaseNotes:
   cache de sessão com validade e degradação silenciosa.

   Em `error` a página não fica vazia nem mente: ela diz que
   não conseguiu carregar e oferece o caminho manual, que é a
   página de releases do GitHub.
───────────────────────────────────────────────────────── */

export type DownloadsStatus = "loading" | "ok" | "error";

const CACHE_KEY = "downloads";
const ENDPOINT = "/api/downloads";
/* 1 h, alinhado ao s-maxage da própria função. */
const TTL = 1000 * 60 * 60;

export interface Arquivo {
    plataforma: Plataforma;
    nome: string;
    formato: string;
    arquitetura: string | null;
    tamanho: number;
    url: string;
    downloads: number;
}

export interface Downloads {
    versao: string | null;
    publicadoEm: string | null;
    arquivos: Arquivo[];
}

const VAZIO: Downloads = {
    versao: null,
    publicadoEm: null,
    arquivos: [],
};

export function useDownloads(enabled = true): {
    dados: Downloads;
    status: DownloadsStatus;
} {
    const cached = enabled ? readCache<Downloads>(CACHE_KEY, TTL) : null;

    const [dados, setDados] = useState<Downloads>(cached ?? VAZIO);
    const [status, setStatus] = useState<DownloadsStatus>(
        !enabled || cached ? "ok" : "loading",
    );

    useEffect(() => {
        if (!enabled) return;
        if (readCache<Downloads>(CACHE_KEY, TTL)) return;

        let cancelado = false;

        fetch(ENDPOINT)
            .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
            .then((data: Partial<Downloads> | null) => {
                if (cancelado) return;
                /* A resposta é normalizada em vez de aceita como veio. O
                   contrato é nosso, mas quem responde é a rede: um proxy,
                   um erro devolvido como JSON, ou uma versão futura da
                   função podem entregar outra forma — e `for (const a of
                   undefined)` derruba a página inteira, não só a lista.
                   Foi o que aconteceu na primeira versão deste hook. */
                const seguro: Downloads = {
                    versao: data?.versao ?? null,
                    publicadoEm: data?.publicadoEm ?? null,
                    arquivos: Array.isArray(data?.arquivos)
                        ? data.arquivos
                        : [],
                };
                setDados(seguro);
                setStatus("ok");
                writeCache(CACHE_KEY, seguro);
            })
            .catch(() => {
                if (cancelado) return;
                setStatus("error");
            });

        return () => {
            cancelado = true;
        };
    }, [enabled]);

    return { dados, status };
}

/** Bytes em algo legível. 106000000 não diz nada; "106 MB" diz. */
export function formatarTamanho(bytes: number, lang: "pt" | "en"): string {
    if (!bytes) return "—";
    const mb = bytes / 1024 / 1024;
    const valor = mb >= 100 ? Math.round(mb) : Math.round(mb * 10) / 10;
    return `${valor.toLocaleString(lang === "pt" ? "pt-BR" : "en-US")} MB`;
}
