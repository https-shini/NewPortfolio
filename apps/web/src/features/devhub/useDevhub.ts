import { useEffect, useState } from "react";
import {
    fetchIndex,
    fetchPinned,
    fetchProject,
    fetchStats,
} from "@/features/devhub/api";
import type {
    DevhubIndex,
    DevhubPinned,
    RepositoryDetail,
    RepositoryStats,
} from "@/features/devhub/types";

/* ─────────────────────────────────────────────────────────
   useDevhub — o estado remoto do DevHub, sem biblioteca
   ─────────────────────────────────────────────────────────
   Mesma forma de `useGithubStats`: `fetch` num efeito, cache de
   sessão por baixo (api.ts) e uma bandeira de cancelamento para
   não escrever estado depois do unmount.

   Três estados explícitos: "carregando", "deu erro" e "não existe"
   pedem telas diferentes.
───────────────────────────────────────────────────────── */

export interface AsyncState<T> {
    data: T | null;
    loading: boolean;
    error: boolean;
}

const INICIAL = { data: null, loading: true, error: false } as const;

/**
 * Executa `carregar` uma vez por valor de `chave`.
 *
 * Trocar a chave (outro projeto) exige remontar o componente — quem
 * consome passa `key={name}` (ver app/routes.tsx). Assim o estado já
 * nasce "carregando", sem `setState` em cascata dentro do efeito.
 */
function useRemoto<T>(
    carregar: () => Promise<T | null>,
    chave: string,
): AsyncState<T> {
    const [estado, setEstado] = useState<AsyncState<T>>(INICIAL);

    useEffect(() => {
        let cancelado = false;
        carregar()
            .then((data) => {
                if (!cancelado)
                    setEstado({ data, loading: false, error: false });
            })
            .catch(() => {
                if (!cancelado)
                    setEstado({ data: null, loading: false, error: true });
            });
        return () => {
            cancelado = true;
        };
        /* `carregar` é estável por chave — ver os chamadores abaixo. */
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chave]);

    return estado;
}

/** O acervo inteiro — métricas, recentes e galeria. */
export function useDevhubIndex(): AsyncState<DevhubIndex> {
    return useRemoto(fetchIndex, "index");
}

/** Os fixados no GitHub — a vitrine da home. */
export function useDevhubPinned(): AsyncState<DevhubPinned> {
    return useRemoto(fetchPinned, "pinned");
}

/** Um projeto pelo nome. `data: null` sem erro = não existe. */
export function useDevhubProject(name: string): AsyncState<RepositoryDetail> {
    return useRemoto(() => fetchProject(name), name);
}

/** Estatísticas de um projeto. `data: null` sem erro = indisponível. */
export function useDevhubStats(name: string): AsyncState<RepositoryStats> {
    return useRemoto(() => fetchStats(name), `stats:${name}`);
}
