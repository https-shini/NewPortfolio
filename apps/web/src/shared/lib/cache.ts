/* ─────────────────────────────────────────────────────────
   cache.ts — cache de sessão com validade
   ─────────────────────────────────────────────────────────
   Guarda respostas de rede em `sessionStorage` para não refazer
   a mesma chamada a cada navegação dentro da aba.

   Toda leitura e escrita é tolerante a falha: `sessionStorage`
   lança em contextos restritos (iframe sem permissão, modo
   privado de alguns browsers) e pode estourar a cota. Nesses
   casos o cache simplesmente não existe — quem chama refaz a
   requisição, e nada quebra.
───────────────────────────────────────────────────────── */

interface CacheEnvelope<T> {
    /** Momento da escrita, em epoch ms. */
    at: number;
    value: T;
}

/**
 * Lê um valor ainda válido do cache.
 *
 * @param key identificador do registro
 * @param ttl validade em ms; omitido, o valor vale por toda a sessão
 * @returns o valor, ou `null` se ausente, expirado ou ilegível
 */
export function readCache<T>(key: string, ttl?: number): T | null {
    try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as CacheEnvelope<T>;
        /* Registro gravado por uma versão anterior, sem envelope. */
        if (typeof parsed?.at !== "number") return null;

        if (ttl !== undefined && Date.now() - parsed.at > ttl) {
            sessionStorage.removeItem(key);
            return null;
        }

        return parsed.value;
    } catch {
        return null;
    }
}

/** Grava um valor no cache, carimbando o instante da escrita. */
export function writeCache<T>(key: string, value: T): void {
    try {
        const envelope: CacheEnvelope<T> = { at: Date.now(), value };
        sessionStorage.setItem(key, JSON.stringify(envelope));
    } catch {
        /* cota estourada ou storage indisponível — segue sem cache */
    }
}

/** Remove um registro. Útil em testes e ao invalidar manualmente. */
export function clearCache(key: string): void {
    try {
        sessionStorage.removeItem(key);
    } catch {
        /* storage indisponível — nada a limpar */
    }
}
