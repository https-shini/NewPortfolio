import type { Localized } from "@/shared/lib/localized";

/* ─────────────────────────────────────────────────────────
   releaseNotes.ts — camada local do histórico de versões
   ─────────────────────────────────────────────────────────
   Cada versão tem duas camadas:

   · estruturada (sempre): a lista categorizada no padrão
     Keep a Changelog — added / changed / fixed / removed;
   · editorial (opcional, só quando `featured`): capa, título,
     texto corrido e mídia, virando um pequeno estudo de caso.

   Na Fase 2 este arquivo passa a ser uma *sobreposição*: o
   GitHub manda em versão, data e links, e o que estiver aqui
   sobrepõe título, corpo, mídia e destaque — é o que preserva
   o bilíngue, já que o corpo de uma release do GitHub é
   monolíngue.

   A versão do topo precisa casar com a do package.json
   (injetada como __APP_VERSION__); há teste garantindo isso.
───────────────────────────────────────────────────────── */

export type ChangeType = "added" | "changed" | "fixed" | "removed";

/** Ordem canônica de exibição das categorias. */
export const CHANGE_TYPES: ChangeType[] = [
    "added",
    "changed",
    "fixed",
    "removed",
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
export const RELEASE_NOTES: ReleaseEntry[] = [
    {
        version: "2.0.0",
        date: "2026-08-04",
        featured: true,
        tags: ["design", "feature"],
        title: {
            pt: "Segunda geração do portfólio",
            en: "Second generation of the portfolio",
        },
        summary: {
            pt: "Primeira versão publicada da reconstrução completa.",
            en: "First published version of the full rebuild.",
        },
        body: {
            pt: "Esta é a primeira versão marcada do portfólio reconstruído. A versão anterior era **HTML, CSS e JavaScript puro**; esta é uma aplicação **React com TypeScript**, organizada em camadas e apoiada num design system próprio.\n\nA decisão que mais moldou o resto foi manter **apenas duas dependências de runtime** — React e ReactDOM. Todo o resto é do projeto: os tokens de estilo, os 65 ícones, o modal acessível, o roteamento e a internacionalização. Isso mantém o bundle previsível e o código sob controle.\n\nCada número exibido no site é **derivado, nunca digitado**: semestre da graduação, anos de experiência e datas de carreira saem de marcos em ISO e se atualizam sozinhos com o tempo.",
            en: "This is the first tagged version of the rebuilt portfolio. The previous one was **plain HTML, CSS and JavaScript**; this is a **React and TypeScript** application, organized in layers and backed by its own design system.\n\nThe decision that shaped everything else was keeping **only two runtime dependencies** — React and ReactDOM. Everything else belongs to the project: the style tokens, the 65 icons, the accessible modal, the routing and the internationalization. That keeps the bundle predictable and the code under control.\n\nEvery number the site shows is **derived, never typed**: current semester, years of experience and career dates all come from ISO milestones and keep themselves up to date.",
        },
        changes: {
            added: [
                {
                    pt: "Design system com tokens em três níveis, tema claro e escuro",
                    en: "Design system with three-tier tokens, light and dark themes",
                },
                {
                    pt: "Arquitetura em camadas: app, pages, widgets e shared",
                    en: "Layered architecture: app, pages, widgets and shared",
                },
                {
                    pt: "Internacionalização completa em português e inglês",
                    en: "Full internationalization in Portuguese and English",
                },
                {
                    pt: "Página /links: central de links no formato social tree",
                    en: "/links page: link hub in social tree format",
                },
                {
                    pt: "Roteamento por History API, sem dependência externa",
                    en: "History API routing, with no external dependency",
                },
                {
                    pt: "Integração de contribuições do GitHub por função serverless",
                    en: "GitHub contribution stats via a serverless function",
                },
            ],
            changed: [
                {
                    pt: "Imagens migradas para WebP: de 8,6 MB para cerca de 224 KB",
                    en: "Images migrated to WebP: from 8.6 MB down to about 224 KB",
                },
                {
                    pt: "Bundle dividido: vendor separado e modais sob demanda",
                    en: "Split bundle: separate vendor chunk and on-demand modals",
                },
            ],
            fixed: [
                {
                    pt: "Overflow horizontal eliminado de 320 px a 4K",
                    en: "Horizontal overflow eliminated from 320 px to 4K",
                },
                {
                    pt: "Alvos de toque de 44 px em dispositivos sem mouse",
                    en: "44 px touch targets on pointer-coarse devices",
                },
            ],
        },
        links: [
            {
                label: { pt: "Ver a central de links", en: "See the link hub" },
                href: "/links",
            },
        ],
    },
    {
        version: "2.0.0-rc.1",
        date: "2026-08-03",
        tags: ["feature", "fix"],
        title: {
            pt: "Central de links e roteamento próprio",
            en: "Link hub and in-house routing",
        },
        summary: {
            pt: "Central de links, roteamento próprio e correções de deploy.",
            en: "Link hub, in-house routing and deploy fixes.",
        },
        changes: {
            added: [
                {
                    pt: "Rota /links com título, canonical e Open Graph próprios",
                    en: "/links route with its own title, canonical and Open Graph",
                },
                {
                    pt: "Fonte única para todas as URLs públicas do site",
                    en: "Single source for every public URL on the site",
                },
            ],
            fixed: [
                {
                    pt: "Acesso direto a /links retornava 404 em produção",
                    en: "Direct access to /links returned 404 in production",
                },
                {
                    pt: "Função serverless nunca chegava a ser compilada no deploy",
                    en: "Serverless function was never compiled during deploy",
                },
                {
                    pt: "URLs de projeto duplicadas entre quatro componentes",
                    en: "Project URLs duplicated across four components",
                },
            ],
        },
    },
    {
        version: "2.0.0-beta.2",
        date: "2026-07-26",
        tags: ["perf", "design"],
        title: {
            pt: "Modal reutilizável e bundle dividido",
            en: "Reusable modal and a split bundle",
        },
        summary: {
            pt: "Modal reutilizável, carrossel de recomendações e bundle menor.",
            en: "Reusable modal, recommendations carousel and a smaller bundle.",
        },
        changes: {
            added: [
                {
                    pt: "Modal base com foco preso, trava de rolagem e Escape",
                    en: "Base modal with focus trap, scroll lock and Escape",
                },
                {
                    pt: "Carrossel paginado nas recomendações",
                    en: "Paginated carousel in the recommendations section",
                },
            ],
            changed: [
                {
                    pt: "Chunk único de 284 KB dividido em vendor e aplicação",
                    en: "Single 284 KB chunk split into vendor and application",
                },
            ],
            fixed: [
                {
                    pt: "Tema voltou a acompanhar o sistema sem preferência salva",
                    en: "Theme follows the system again when no preference is saved",
                },
            ],
        },
    },
    {
        version: "2.0.0-beta.1",
        date: "2026-07-23",
        tags: ["design", "a11y"],
        title: {
            pt: "Refatoração completa da base",
            en: "Full refactor of the codebase",
        },
        summary: {
            pt: "Refatoração completa unificada na branch principal.",
            en: "Full refactor unified into the main branch.",
        },
        changes: {
            added: [
                {
                    pt: "Suíte de testes com Vitest e Testing Library",
                    en: "Test suite with Vitest and Testing Library",
                },
                {
                    pt: "Integração contínua: lint, tipos, formato, testes e build",
                    en: "Continuous integration: lint, types, format, tests and build",
                },
            ],
            changed: [
                {
                    pt: "Componentes reorganizados por camada e responsabilidade",
                    en: "Components reorganized by layer and responsibility",
                },
            ],
        },
    },
];

/**
 * Versão corrente do site — a primeira entrada da lista.
 * O `package.json` continua sendo a fonte oficial (via __APP_VERSION__);
 * um teste garante que as duas não divergem.
 */
export function getCurrentVersion(): string {
    return RELEASE_NOTES[0]!.version;
}

/** Tags presentes nas entradas, na ordem em que aparecem. */
export function getUsedTags(entries: ReleaseEntry[] = RELEASE_NOTES) {
    const seen: ReleaseTag[] = [];
    entries.forEach((e) =>
        e.tags?.forEach((tag) => {
            if (!seen.includes(tag)) seen.push(tag);
        }),
    );
    return seen;
}
