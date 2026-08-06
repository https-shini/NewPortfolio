import { PROFILE } from "@/shared/config/profile";

/* ─────────────────────────────────────────────────────────
   constants.ts — configuração da aplicação
   ─────────────────────────────────────────────────────────
   Dados pessoais vivem em profile.ts (fonte única). Os aliases
   abaixo existem por ergonomia dos consumidores existentes.
───────────────────────────────────────────────────────── */

export const AUTHOR_EMAIL = PROFILE.email;
export const GITHUB_URL = PROFILE.social.github.url;
export const LINKEDIN_URL = PROFILE.social.linkedin.url;
export const SITE_URL = PROFILE.siteUrl;

/* Chaves de persistência (localStorage) */
export const THEME_KEY = "portfolio-theme";
export const LANG_KEY = "portfolio-lang";

/**
 * Currículo em PDF bilíngue — servido de frontend/public/docs.
 * Fonte única em profile.cv; getCvUrl resolve pelo idioma corrente.
 * Usado em Hero e Footer.
 */
export const CV_URLS = PROFILE.cv;

export function getCvUrl(lang: keyof typeof CV_URLS): string {
    return CV_URLS[lang];
}

/**
 * Endpoint do formulário de contato (Formspree ou similar).
 * Configurado via variável de ambiente — ver .env.example.
 * Quando ausente, a UI degrada para o fluxo de mailto.
 */
export const FORM_ENDPOINT: string | undefined =
    import.meta.env.VITE_FORM_ENDPOINT || undefined;

/**
 * SECTION_IDS — reexportado de routes.ts por ergonomia dos consumidores.
 * A definição mudou de lugar porque o gerador de sitemap precisa dela no
 * build, e este módulo lê import.meta.env — o que só existe dentro do
 * Vite. routes.ts não importa nada e serve aos dois mundos.
 */
export { SECTION_IDS, type SectionId } from "@/shared/config/routes";

/**
 * ROUTES — reexportado de routes.ts por ergonomia dos consumidores,
 * mesmo motivo dos aliases de PROFILE acima. A definição mora em
 * shared/config/routes.ts para que profile.ts possa usá-la sem ciclo.
 */
export { ROUTES, type RoutePath } from "@/shared/config/routes";
