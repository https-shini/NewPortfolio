import type { Localized } from "@/shared/lib/localized";

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
    /** Nome completo (documentos, JSON-LD, ATS). */
    fullName: "Guilherme de Souza Cruz",
    /** Nome de exibição na UI. */
    name: "Guilherme Cruz",
    role: {
        pt: "Desenvolvedor de Software",
        en: "Software Developer",
    } satisfies Localized,

    email: "contato.guilhermescruz@gmail.com",
    location: {
        pt: "São Paulo, Brasil",
        en: "São Paulo, Brazil",
    } satisfies Localized,

    siteUrl: "https://bl4ck404.dev.br",
    /** Currículo em PDF servido pelo próprio site (frontend/public/docs). */
    cvPath: "/docs/curriculo.pdf",

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
        devlinks: {
            label: "DevLinks",
            handle: "DevLinks",
            url: "https://devlinks-rocketseat-five.vercel.app/",
        },
    } satisfies Record<string, SocialProfile>,
} as const;
