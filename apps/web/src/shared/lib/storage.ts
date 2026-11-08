/* ─────────────────────────────────────────────────────────
   storage.ts — preferências do visitante sem derrubar a página
   ─────────────────────────────────────────────────────────
   `localStorage` LANÇA (não devolve null) em contextos restritos:
   cookies bloqueados por política, alguns modos privados, iframe
   de terceiro. Ler direto no inicializador de um Provider fazia o
   React desmontar a árvore inteira — página em branco por causa de
   uma preferência de idioma.

   Preferência é conveniência: sem armazenamento, o site funciona e
   só deixa de lembrar. Todo acesso de preferência passa por aqui.
───────────────────────────────────────────────────────── */

/** Lê uma preferência; `null` quando não existe ou não dá para ler. */
export function lerPreferencia(chave: string): string | null {
    try {
        return localStorage.getItem(chave);
    } catch {
        return null;
    }
}

/** Grava uma preferência; falha silenciosa — o valor vale só nesta visita. */
export function gravarPreferencia(chave: string, valor: string): void {
    try {
        localStorage.setItem(chave, valor);
    } catch {
        /* sem persistência, sem erro */
    }
}
