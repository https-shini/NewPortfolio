import { lazy, type ComponentType, type LazyExoticComponent } from "react";

/* ─────────────────────────────────────────────────────────
   lazyComRetry — `React.lazy` que sobrevive a um deploy
   ─────────────────────────────────────────────────────────
   Cada página secundária é um chunk com hash no nome. Depois de um
   deploy, uma aba que já estava aberta ainda conhece os nomes antigos;
   ao navegar, ela pede um arquivo que não existe mais, o `import()`
   rejeita e — sem tratamento — a rota fica em branco.

   A saída é recarregar a página UMA vez: o HTML novo traz os nomes
   novos. O marcador em `sessionStorage` impede laço de recarga se o
   problema for outro (rede caída, erro no próprio módulo); na segunda
   falha o erro sobe para o ErrorBoundary, que mostra a recuperação.
───────────────────────────────────────────────────────── */

const MARCADOR = "rota:recarregou-por-chunk";

function jaRecarregou(): boolean {
    try {
        return sessionStorage.getItem(MARCADOR) === "1";
    } catch {
        /* Sem storage não há como evitar o laço: não recarrega. */
        return true;
    }
}

function marcar(valor: boolean): void {
    try {
        if (valor) sessionStorage.setItem(MARCADOR, "1");
        else sessionStorage.removeItem(MARCADOR);
    } catch {
        /* nada a fazer */
    }
}

/* Mesma restrição do próprio `React.lazy` (`T extends ComponentType<any>`):
   com `unknown` ou `never` no lugar, a inferência sobre as páginas reais
   falha, porque as props dos componentes são contravariantes. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyComRetry<T extends ComponentType<any>>(
    carregar: () => Promise<{ default: T }>,
    recarregar: () => void = () => window.location.reload(),
): LazyExoticComponent<T> {
    return lazy(async () => {
        try {
            const modulo = await carregar();
            marcar(false);
            return modulo;
        } catch (erro) {
            if (jaRecarregou()) throw erro;
            marcar(true);
            recarregar();
            /* Enquanto a página recarrega, nada para renderizar. */
            return new Promise<{ default: T }>(() => {});
        }
    });
}
