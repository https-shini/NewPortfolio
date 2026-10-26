import type { Localized } from "@/shared/lib/localized";

/* ─────────────────────────────────────────────────────────
   releaseNotes.ts — camada local do histórico de versões
   ─────────────────────────────────────────────────────────
   Este é um histórico CURADO, e não um registro de tudo que
   aconteceu. Ele é público, faz parte do portfólio, e conta uma
   coisa só: como o projeto amadureceu de bl4ck404.dev.br até
   gcruz.dev.br. Versões que descreviam caminhos abandonados
   saíram — quem lê quer entender o projeto de hoje, não
   arqueologia. Acrescentar uma entrada aqui é decisão
   editorial, não consequência automática de ter feito um
   commit.

   Cada versão tem três camadas:

   · resumo (`summary`): uma linha em linguagem corrente, que é
     o que aparece no card do índice — qualquer pessoa entende;
   · corpo (`body`): o texto da página da versão, onde cabem
     termos técnicos e visão de alto nível;
   · estruturada (`changes`): a lista categorizada — ver o
     comentário de ChangeType abaixo.

   O `featured` NÃO controla se o corpo aparece (ReleaseCard o
   renderiza sempre que existe); ele marca quem abre expandido
   no topo do índice, e só a entrada mais recente o leva.

   Este arquivo é também a LISTA DE PERMISSÃO do histórico: o
   GitHub manda em data e link, mas só para versões declaradas
   aqui — ver mergeReleaseNotes.ts.

   A versão do topo precisa casar com a do package.json
   (injetada como __APP_VERSION__); há teste garantindo isso.
───────────────────────────────────────────────────────── */

/* O vocabulário era o do Keep a Changelog — added / changed / fixed /
   removed —, que serve a um changelog de biblioteca: quem lê quer saber
   o que quebrou e o que sumiu. Este histórico tem outro leitor. Ele é
   público, faz parte do portfólio, e a pergunta que responde é como o
   projeto amadureceu.

   Daí as seis categorias abaixo: elas nomeiam eixos de evolução em vez
   de tipos de commit. `fixed` e `removed` saíram porque nenhuma entrada
   os usa — um histórico curado registra o avanço, e correção de bug
   antigo ou funcionalidade descontinuada não descrevem o projeto de
   hoje. */
export type ChangeType =
    | "added"
    | "improved"
    | "design"
    | "performance"
    | "architecture"
    | "content";

/** Ordem canônica de exibição das categorias. */
export const CHANGE_TYPES: ChangeType[] = [
    "added",
    "improved",
    "design",
    "performance",
    "architecture",
    "content",
];

/**
 * Mídia do corpo de um post.
 *
 * União discriminada de propósito: vídeo **exige** uma faixa de legendas
 * (`captions`, um arquivo .vtt). Assim o compilador impede que um vídeo
 * sem legenda chegue ao site, em vez de deixar a falta passar batido.
 */
export type ReleaseMedia =
    | {
          type: "image";
          /** Import de `assets/release-notes/*` ou caminho em `public/`. */
          src: string;
          /** Texto alternativo; vazio quando a imagem é decorativa. */
          alt?: Localized;
          caption?: Localized;
      }
    | {
          type: "video";
          src: string;
          /** Caminho do .vtt de legendas — obrigatório. */
          captions: string;
          caption?: Localized;
      };

export interface ReleaseLink {
    label: Localized;
    href: string;
}

export interface ReleaseEntry {
    /** SemVer, sem o prefixo "v". Casa com a tag da release. */
    version: string;
    /** ISO "YYYY-MM-DD". Na Fase 2 o `published_at` do GitHub tem prioridade. */
    date: string;
    /** Trata a entrada como post editorial completo. */
    featured?: boolean;
    /**
     * Obrigatório: toda versão tem página própria, e uma página precisa
     * de manchete. Nas releases vindas do GitHub o título é o `name` da
     * release, com a tag como reserva (ver api/release-notes.ts).
     */
    title: Localized;
    /** Uma linha, exibida no cabeçalho colapsado do histórico. */
    summary?: Localized;
    /** Imagem de topo do post — só faz sentido em `featured`. */
    cover?: string;
    /** Texto corrido; aceita `\n\n` entre parágrafos e `**ênfase**`. */
    body?: Localized;
    /** Galeria do corpo (antes/depois, vídeo). */
    media?: ReleaseMedia[];
    tags?: ReleaseTag[];
    changes?: Partial<Record<ChangeType, Localized[]>>;
    links?: ReleaseLink[];
}

/** Vocabulário fechado de tags — alimenta os chips de filtro. */
export type ReleaseTag = "design" | "feature" | "perf" | "a11y" | "fix";

/* ─────────────────────────────────────────────────────────
   As entradas — mais recente primeiro.

   Os marcos anteriores à primeira tag usam identificadores de
   pré-lançamento do SemVer (`2.0.0-beta.1`), que é exatamente
   o que a especificação prevê para versões que antecedem uma
   release. As datas vêm do histórico real do repositório.
───────────────────────────────────────────────────────── */
