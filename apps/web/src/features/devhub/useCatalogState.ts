import { useCallback, useEffect, useState } from "react";
import {
    DEFAULT_CATALOG,
    fromSearch,
    toSearch,
    type CatalogState,
} from "@/features/devhub/catalog";

/* ─────────────────────────────────────────────────────────
   useCatalogState — os critérios do catálogo, espelhados na URL
   ─────────────────────────────────────────────────────────
   O estado nasce da query string e volta para ela a cada mudança
   (`replaceState`: filtrar não empilha histórico). Assim:
     · o endereço pode ser compartilhado com o recorte aplicado;
     · abrir um projeto e voltar devolve a mesma busca, os mesmos
       filtros e a mesma página.

   O roteador da SPA só olha o caminho e o `?lang`; os parâmetros
   do catálogo passam por ele sem atrito.
───────────────────────────────────────────────────────── */

type Atualizacao =
    Partial<CatalogState> | ((anterior: CatalogState) => Partial<CatalogState>);

export function useCatalogState(): {
    state: CatalogState;
    update: (mudanca: Atualizacao, opcoes?: { keepPage?: boolean }) => void;
    reset: () => void;
} {
    const [state, setState] = useState<CatalogState>(() =>
        typeof window === "undefined"
            ? DEFAULT_CATALOG
            : fromSearch(window.location.search),
    );

    useEffect(() => {
        const busca = toSearch(state, window.location.search);
        const destino = `${window.location.pathname}${busca}${window.location.hash}`;
        const atual = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        if (destino !== atual) {
            window.history.replaceState(window.history.state, "", destino);
        }
    }, [state]);

    /* Qualquer mudança de critério volta à página 1 — mostrar a página 3
       de um recorte novo esconderia que o recorte mudou. Só a própria
       paginação mantém a página. */
    const update = useCallback(
        (mudanca: Atualizacao, opcoes?: { keepPage?: boolean }) => {
            setState((anterior) => {
                const parcial =
                    typeof mudanca === "function" ? mudanca(anterior) : mudanca;
                return {
                    ...anterior,
                    ...parcial,
                    page: opcoes?.keepPage
                        ? (parcial.page ?? anterior.page)
                        : 1,
                };
            });
        },
        [],
    );

    const reset = useCallback(() => {
        setState((anterior) => ({ ...DEFAULT_CATALOG, sort: anterior.sort }));
    }, []);

    return { state, update, reset };
}
