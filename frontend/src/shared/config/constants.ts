export const AUTHOR_EMAIL = 'contato.guilhermescruz@gmail.com';
export const GITHUB_URL    = 'https://github.com/https-shini';
export const LINKEDIN_URL  = 'https://linkedin.com/in/oguilherme-cruz';
export const FORM_ENDPOINT = 'https://formspree.io/f/CONFIGURE';
export const THEME_KEY     = 'portfolio-theme';
export const LANG_KEY      = 'portfolio-lang';

/**
 * URL do currículo em PDF.
 * Servido a partir de src/public/docs (ver publicDir em vite.config.ts),
 * então em runtime fica disponível na raiz do site.
 * Centralizado aqui para facilitar manutenção (usado em Hero, Footer, etc.)
 */
export const CV_URLS = {
    pt: '/docs/Curriculo_PTBR.pdf',
    en: '/docs/Curriculo_EN.pdf',
} as const;

export function getCvUrl(lang: keyof typeof CV_URLS): string {
    return CV_URLS[lang];
}

/**
 * SECTION_IDS — identificadores semânticos das seções do site em português.
 * Fonte única de verdade: usado em Hero/About/..., Header (nav/observer),
 * Footer (links) e scrollToSection().
 */
export const SECTION_IDS = {
    HOME:            'inicio',
    ABOUT:           'sobre',
    CAREER:          'carreira',
    EDUCATION:       'formacoes',
    FEATURED:        'destaque',
    WORK:            'projetos',
    RECOMMENDATIONS: 'recomendacoes',
    CONTACT:         'contato',
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];
