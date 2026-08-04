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
