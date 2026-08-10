import { useCallback, useEffect, useState } from "react";
import { ponteAtualizacao, type EstadoAtualizacao } from "@/shared/lib/desktop";

/* ─────────────────────────────────────────────────────────
   useAtualizacaoDesktop — estado da atualização, no React
   ─────────────────────────────────────────────────────────
   No navegador devolve `indisponivel` e três funções que não fazem
   nada. É de propósito: a página não precisa se ramificar em "estou no
   app?" antes de cada linha — ela pergunta o estado e desenha o que ele
   disser, e no navegador esse estado nunca produz interface.
───────────────────────────────────────────────────────── */

const FORA = { situacao: "indisponivel" } as const;

export function useAtualizacaoDesktop(): {
    estado: EstadoAtualizacao;
    verificar: () => void;
    baixar: () => void;
    instalar: () => void;
} {
    const [estado, setEstado] = useState<EstadoAtualizacao>(FORA);

    useEffect(() => {
        const ponte = ponteAtualizacao();
        if (!ponte) return;

        let vivo = true;

        /* O estado atual ANTES de assinar: a verificação começa quando o
           app abre, e quem navega até esta página meio minuto depois já
           perdeu os eventos. Sem esta leitura, uma atualização pronta
           apareceria como "nada por aqui". */
        ponte
            .ler()
            .then((inicial) => {
                if (vivo) setEstado(inicial);
            })
            .catch(() => {
                /* App antigo, sem este canal. Segue como indisponível. */
            });

        const cancelar = ponte.ouvir((novo) => {
            if (vivo) setEstado(novo);
        });

        return () => {
            vivo = false;
            cancelar();
        };
    }, []);

    const verificar = useCallback(() => {
        void ponteAtualizacao()?.verificar();
    }, []);

    const baixar = useCallback(() => {
        void ponteAtualizacao()?.baixar();
    }, []);

    const instalar = useCallback(() => {
        ponteAtualizacao()?.instalar();
    }, []);

    return { estado, verificar, baixar, instalar };
}
