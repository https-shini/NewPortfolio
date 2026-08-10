/* ─────────────────────────────────────────────────────────
   desktop.ts — a ponte tipada para o aplicativo
   ─────────────────────────────────────────────────────────
   O mesmo código roda em dois lugares: no navegador, onde nada disto
   existe, e dentro do app Electron, onde o preload publica um objeto em
   `window`. Este arquivo é o único ponto do site que sabe disso.

   Fica em `shared/lib` e não em `shared/hooks` de propósito: é um
   adaptador de plataforma, sem React. Quem precisa de estado reativo usa
   o hook que o consome — assim a checagem "estou no app?" pode ser feita
   em qualquer camada, inclusive fora de componente.
───────────────────────────────────────────────────────── */

/** O que o processo principal informa sobre a atualização. */
export type SituacaoAtualizacao =
    | "indisponivel"
    | "ocioso"
    | "verificando"
    | "atual"
    | "disponivel"
    | "baixando"
    | "pronta"
    | "erro"
    /** A instalação não sabe se atualizar sozinha (.deb, pasta solta). */
    | "naoSuportada";

export interface EstadoAtualizacao {
    situacao: SituacaoAtualizacao;
    /** Versão em execução. */
    versao?: string | null;
    /** Versão disponível, quando há uma. */
    nova?: string | null;
    /** Percentual inteiro, só em `baixando`. */
    progresso?: number;
    detalhe?: string;
}

interface PonteAtualizacao {
    ler(): Promise<EstadoAtualizacao>;
    verificar(): Promise<EstadoAtualizacao>;
    baixar(): Promise<EstadoAtualizacao>;
    instalar(): void;
    ouvir(aoMudar: (estado: EstadoAtualizacao) => void): () => void;
}

interface PonteDesktop {
    versao: string | null;
    plataforma: string;
    atualizacao?: PonteAtualizacao;
}

declare global {
    interface Window {
        portfolioDesktop?: PonteDesktop;
    }
}

/**
 * A ponte, ou `null` no navegador.
 *
 * Nunca lança: uma versão antiga do app pode ter o objeto sem o campo
 * `atualizacao`, e a página precisa continuar de pé nesse caso — foi
 * para isso que o campo é opcional no tipo.
 */
export function ponteDesktop(): PonteDesktop | null {
    if (typeof window === "undefined") return null;
    return window.portfolioDesktop ?? null;
}

/** Está rodando dentro do aplicativo? */
export function noAplicativo(): boolean {
    return ponteDesktop() !== null;
}

export function ponteAtualizacao(): PonteAtualizacao | null {
    return ponteDesktop()?.atualizacao ?? null;
}
