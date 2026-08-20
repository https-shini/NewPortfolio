import type { Localized } from "@/shared/lib/localized";
import { ROUTES } from "@/shared/config/routes";

/* ─────────────────────────────────────────────────────────
   profile.ts — fonte única de verdade da identidade pessoal
   ─────────────────────────────────────────────────────────
   Todos os dados de contato/perfil vivem aqui. Nenhum outro
   arquivo deve hardcodear nome, e-mail, URLs ou redes sociais:
   importe deste módulo (ou dos aliases em constants.ts).
───────────────────────────────────────────────────────── */

export interface SocialProfile {
    /** Nome exibido da rede (nome próprio — não traduzido). */
    label: string;
    /** Handle curto exibido na UI (ex.: "/in/oguilherme-cruz"). */
    handle: string;
    url: string;
}

export const PROFILE = {
    /**
     * Nome usado em TODA referência pessoal — UI, JSON-LD, títulos de
     * página e metadados. Primeiro e último nome, sem nomes do meio.
     *
     * Campo único de propósito: havia um `fullName` separado, e manter
     * duas formas do mesmo nome fazia a variante longa reaparecer.
     */
    name: "Guilherme Cruz",
    role: {
        pt: "Desenvolvedor de Software",
        en: "Software Developer",
    } satisfies Localized,

    /**
     * Handle público exibido na página /links. Independente do siteUrl
     * (gcruz.dev.br) por escolha — é a identidade curta usada em bio de
     * redes sociais.
     */
    handle: "@gcruz.dev",

    /**
     * Linha de atuação da página /links. Nomes próprios do mercado,
     * exibidos como estão nos dois idiomas.
     */
    roles: ["Full Stack Developer", "AI & Automation", "Freelancer"],

    email: "contato@gcruz.dev.br",
    location: {
        pt: "São Paulo, Brasil",
        en: "São Paulo, Brazil",
    } satisfies Localized,

    /**
     * Domínio canônico do site. Fonte única — usado em runtime (SEO/OG via
     * profile) e injetado no index.html no build (ver vite.config.ts).
     * Sobrescrevível por VITE_SITE_URL para ambientes de preview.
     */
    siteUrl: import.meta.env.VITE_SITE_URL || "https://gcruz.dev.br",
    /** Currículo em PDF bilíngue servido pelo próprio site (apps/web/public/docs). */
    cv: {
        pt: "/docs/Curriculo_PTBR.pdf",
        en: "/docs/Curriculo_EN.pdf",
    } satisfies Localized,

    /** Usuário do GitHub — usado pela serverless /api/github-stats. */
    githubUsername: "https-shini",

    social: {
        github: {
            label: "GitHub",
            handle: "/https-shini",
            url: "https://github.com/https-shini",
        },
        linkedin: {
            label: "LinkedIn",
            handle: "/in/oguilherme-cruz",
            url: "https://linkedin.com/in/oguilherme-cruz",
        },
        /* Central de links do próprio site (página /links). O app externo que
           ocupava este lugar virou um dos itens listados lá — ver links.ts. */
        devlinks: {
            label: "Social Links",
            handle: "Social Links",
            url: ROUTES.LINKS,
        },
    } satisfies Record<string, SocialProfile>,
} as const;

/* ─────────────────────────────────────────────────────────
   TIMELINE_ANCHORS — marcos temporais (fonte única de datas)
   ─────────────────────────────────────────────────────────
   Formato "YYYY-MM", consistente com o Timeline e dateUtils.ts.
   Toda derivação de data (semestre, anos estudando) parte daqui —
   nenhuma data de referência deve viver dentro de componentes.
───────────────────────────────────────────────────────── */
export const TIMELINE_ANCHORS = {
    /** Início do Bacharelado em Ciência da Computação. */
    graduationStart: "2023-01",
    /** Duração total do curso, em semestres. */
    graduationTotalSemesters: 8,
    /** Marco de "anos estudando" — início da formação em computação (ETEC). */
    devJourneyStart: "2020-01",
} as const;
