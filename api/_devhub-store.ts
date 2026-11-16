import { BlobError, del, get, put } from "@vercel/blob";

/* ─────────────────────────────────────────────────────────
   _devhub-store.ts — onde o DevHub guarda o que sincronizou
   ─────────────────────────────────────────────────────────
   Um armazenamento de documentos JSON por chave, com duas
   implementações:

     · Vercel Blob (produção) — store PRIVADO, lido sem a CDN
       (`useCache: false`) para que todas as instâncias vejam a
       mesma versão logo depois da gravação;
     · memória (testes e desenvolvimento local sem token).

   Gravação atômica: cada documento é um objeto só, substituído
   por inteiro num único `put`. Quem lê recebe a versão anterior
   ou a nova — nunca metade. Por isso a sincronização valida tudo
   ANTES de gravar e grava o índice por último (ver
   `_devhub-sync.ts`).

   Trava: `put` com `allowOverwrite: false` só cria se o objeto
   não existir — é o "compare-and-set" que o Blob oferece. Uma
   trava abandonada (função que morreu no meio) expira e é
   assumida com `ifMatch`, de modo que só uma instância vence.
───────────────────────────────────────────────────────── */

export interface DevhubStore {
    /** Lê um documento; `null` quando não existe. */
    ler<T>(chave: string): Promise<T | null>;
    /** Grava (substitui) um documento inteiro. */
    gravar(chave: string, valor: unknown): Promise<void>;
    /**
     * Tenta adquirir a trava `chave`. Devolve `true` se conseguiu.
     * Uma trava mais velha que `validadeMs` é considerada abandonada.
     */
    travar(chave: string, validadeMs: number, agora?: Date): Promise<boolean>;
    /** Libera a trava. Falhar aqui não é erro: ela expira sozinha. */
    destravar(chave: string): Promise<void>;
}

/** Prefixo de tudo o que o DevHub grava no store. */
export const PREFIXO = "devhub/";

export const CHAVES = {
    snapshot: `${PREFIXO}snapshot.json`,
    status: `${PREFIXO}status.json`,
    trava: `${PREFIXO}lock.json`,
    detalhe: (nome: string) => `${PREFIXO}details/${nome}.json`,
} as const;

interface ConteudoTrava {
    adquiridaEm: string;
}

function expirou(trava: ConteudoTrava | null, validadeMs: number, agora: Date) {
    const t = Date.parse(trava?.adquiridaEm ?? "");
    return !Number.isFinite(t) || agora.getTime() - t > validadeMs;
}

/* ─────────────────────────────────────────────────────────
   Vercel Blob
───────────────────────────────────────────────────────── */

const OPCOES_JSON = {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
} as const;

async function lerBlob<T>(
    chave: string,
): Promise<{ valor: T; etag: string } | null> {
    const r = await get(chave, { access: "private", useCache: false });
    if (!r || r.statusCode !== 200) return null;
    const texto = await new Response(r.stream).text();
    return { valor: JSON.parse(texto) as T, etag: r.blob.etag };
}

export function criarStoreBlob(): DevhubStore {
    return {
        async ler<T>(chave: string) {
            return (await lerBlob<T>(chave))?.valor ?? null;
        },
        async gravar(chave, valor) {
            await put(chave, JSON.stringify(valor), {
                ...OPCOES_JSON,
                allowOverwrite: true,
            });
        },
        async travar(chave, validadeMs, agora = new Date()) {
            const corpo = JSON.stringify({
                adquiridaEm: agora.toISOString(),
            } satisfies ConteudoTrava);
            try {
                await put(chave, corpo, {
                    ...OPCOES_JSON,
                    allowOverwrite: false,
                });
                return true;
            } catch (erro) {
                if (!(erro instanceof BlobError)) throw erro;
            }
            /* Já existe: só assume se a trava estiver abandonada, e só se
               ninguém a trocou entre a leitura e a escrita (`ifMatch`). */
            const atual = await lerBlob<ConteudoTrava>(chave);
            if (atual && !expirou(atual.valor, validadeMs, agora)) return false;
            try {
                await put(chave, corpo, {
                    ...OPCOES_JSON,
                    ...(atual
                        ? { ifMatch: atual.etag }
                        : { allowOverwrite: false }),
                });
                return true;
            } catch (erro) {
                if (erro instanceof BlobError) return false;
                throw erro;
            }
        },
        async destravar(chave) {
            try {
                await del(chave);
            } catch {
                /* expira sozinha */
            }
        },
    };
}

/* ─────────────────────────────────────────────────────────
   Memória — testes e desenvolvimento
───────────────────────────────────────────────────────── */

export interface StoreMemoria extends DevhubStore {
    /** Os documentos gravados, como texto (o mesmo que iria ao Blob). */
    readonly dados: Map<string, string>;
}

export function criarStoreMemoria(): StoreMemoria {
    const dados = new Map<string, string>();
    return {
        dados,
        async ler<T>(chave: string) {
            const texto = dados.get(chave);
            return texto === undefined ? null : (JSON.parse(texto) as T);
        },
        async gravar(chave, valor) {
            /* Serializa antes de trocar: se `stringify` falhar, o valor
               anterior continua lá — mesma garantia do Blob. */
            const texto = JSON.stringify(valor);
            dados.set(chave, texto);
        },
        async travar(chave, validadeMs, agora = new Date()) {
            const atual = dados.get(chave);
            if (
                atual !== undefined &&
                !expirou(JSON.parse(atual) as ConteudoTrava, validadeMs, agora)
            ) {
                return false;
            }
            dados.set(
                chave,
                JSON.stringify({ adquiridaEm: agora.toISOString() }),
            );
            return true;
        },
        async destravar(chave) {
            dados.delete(chave);
        },
    };
}

/* ─────────────────────────────────────────────────────────
   O store em uso
   ─────────────────────────────────────────────────────────
   Com `BLOB_READ_WRITE_TOKEN` (ou OIDC + `BLOB_STORE_ID`), Blob.
   Sem nenhum dos dois, memória — o que só serve para desenvolver:
   cada instância teria a sua cópia. `storeConfigurado()` deixa
   isso explícito para o endpoint avisar em vez de fingir.
───────────────────────────────────────────────────────── */

let atual: DevhubStore | null = null;

export function storeConfigurado(): boolean {
    return Boolean(
        process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID,
    );
}

export function obterStore(): DevhubStore {
    if (!atual) {
        atual = storeConfigurado() ? criarStoreBlob() : criarStoreMemoria();
    }
    return atual;
}

/** Só para testes: troca o store em uso. `null` volta ao padrão. */
export function definirStore(store: DevhubStore | null): void {
    atual = store;
}
