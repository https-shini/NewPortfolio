/* ─────────────────────────────────────────────────────────
   routes.ts — rotas da aplicação (pathname)
   ─────────────────────────────────────────────────────────
   Módulo sem dependências, de propósito: profile.ts e
   constants.ts consomem daqui sem criar import circular.

   A home concentra as seções por âncora (ver SECTION_IDS);
   rotas adicionais são páginas próprias, registradas em
   app/routes.tsx.
───────────────────────────────────────────────────────── */

export const ROUTES = {
    HOME: "/",
    LINKS: "/links",
    RELEASE_NOTES: "/release-notes",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

/* ─────────────────────────────────────────────────────────
   Idioma na URL
   ─────────────────────────────────────────────────────────
   Parâmetro de busca, não prefixo de caminho: vale para toda
   rota sem tocar no roteador nem multiplicar as reescritas.

   O padrão fica implícito — `/links` é português, `/links?lang=en`
   é inglês. Uma URL sem parâmetro é a canônica; emitir também
   `?lang=pt` daria duas formas para a mesma página.
───────────────────────────────────────────────────────── */

export const LANG_PARAM = "lang";
export const DEFAULT_LANG = "pt";

/** Etiquetas BCP 47 para o atributo lang e para o hreflang. */
export const HREFLANG = { pt: "pt-BR", en: "en" } as const;

/** Acrescenta o idioma a uma URL, omitindo-o quando for o padrão. */
export function withLang(url: string, lang: "pt" | "en"): string {
    if (lang === DEFAULT_LANG) return url;
    return `${url}${url.includes("?") ? "&" : "?"}${LANG_PARAM}=${lang}`;
}

/**
 * SECTION_IDS — identificadores semânticos das seções da home.
 * Fonte única de verdade: usado em Hero/About/..., Header (nav/observer),
 * Footer (links), scrollToSection() e o gerador de sitemap do build.
 */
export const SECTION_IDS = {
    HOME: "inicio",
    ABOUT: "sobre",
    CAREER: "carreira",
    EDUCATION: "formacoes",
    FEATURED: "destaque",
    WORK: "projetos",
    RECOMMENDATIONS: "recomendacoes",
    CONTACT: "contato",
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

/* ─────────────────────────────────────────────────────────
   Rotas com parâmetro
   ─────────────────────────────────────────────────────────
   As notas de versão têm uma página por versão, e o índice
   pagina conforme o histórico cresce. Os caminhos saem daqui,
   e só daqui — o casamento inverso vive em app/routes.tsx.
───────────────────────────────────────────────────────── */

/** Segmento que distingue o índice paginado de uma versão. */
export const RELEASE_NOTES_PAGE_SEGMENT = "page";

/** Versões por página do índice. Mora aqui, e não no widget, porque o
    gerador de sitemap precisa do mesmo número para saber quantas páginas
    existem — e não pode importar um .tsx sem arrastar o React junto. */
export const RELEASE_NOTES_PAGE_SIZE = 50;

/** `/release-notes/v2.0.0` — o `v` espelha a tag do Git. */
export function releaseNotePath(version: string): string {
    return `${ROUTES.RELEASE_NOTES}/v${version.replace(/^v/i, "")}`;
}

/** `/release-notes/page/2`; a página 1 é o próprio índice. */
export function releaseNotesPagePath(page: number): string {
    return page <= 1
        ? ROUTES.RELEASE_NOTES
        : `${ROUTES.RELEASE_NOTES}/${RELEASE_NOTES_PAGE_SEGMENT}/${page}`;
}
