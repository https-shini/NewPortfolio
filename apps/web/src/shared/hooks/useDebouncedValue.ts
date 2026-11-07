import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────
   useDebouncedValue — o valor, depois que ele parar de mudar
   ─────────────────────────────────────────────────────────
   Separar o que se digita do que se processa. O campo continua
   respondendo a cada tecla — ele é um input controlado, e
   atrasá-lo faria o cursor saltar —, enquanto o trabalho caro
   que depende dele espera a pausa.

   Mora em `shared/` por não saber de nada: recebe um valor,
   devolve o mesmo valor atrasado, e não faz ideia de que hoje
   quem o usa é a busca do DevHub.
───────────────────────────────────────────────────────── */

export function useDebouncedValue<T>(value: T, delay = 250): T {
    const [atrasado, setAtrasado] = useState(value);

    useEffect(() => {
        const id = window.setTimeout(() => setAtrasado(value), delay);
        /* Cada mudança cancela o relógio anterior — sem isto, uma
           sequência de teclas agendaria uma atualização por tecla, e
           todas acabariam disparando. */
        return () => window.clearTimeout(id);
    }, [value, delay]);

    return atrasado;
}
